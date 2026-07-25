# CONTRACTS

Minimal on-chain surface for the demo. Read before any Solidity.

- **`Suite.sol`** — the shared pool. The core of the demo.
- **`AccessPass.sol`** — soulbound membership credential (identity track).
- **`UsageSplit.sol`** — pure library, the split arithmetic. Not deployed.
- **`KohaRecord.sol`** — the permanent giving record. **Never burns**; AccessPass
  burns on lapse, the giving record does not.

Solidity ^0.8.24, OpenZeppelin for anything standard, `evm_version = cancun`
(OZ 5.1 uses `mcopy`; Avalanche supports Cancun via Durango).

## The settlement token

Suite holds whatever ERC-20 it is pointed at. **Fuji USDC is the current
fallback**; New Money's **dNZD** is the intended currency and is confirmed to work
*at the contract layer* — it is only the gasless x402 payment leg that cannot
settle dNZD, because the token has no EIP-3009 (`docs/DNZD.md`).

The contract only ever calls `balanceOf` and `transfer`, so it is token- and
decimals-agnostic — `test_Distribute_DecimalsAgnostic` proves that. Both candidate
tokens happen to be 6 dp, but nothing depends on it. Nothing in Solidity needs to
change when the token does; only the `SETTLEMENT_TOKEN` deploy variable.

`Suite.settlementToken` is **immutable**, so changing the token means deploying a
new pool.

## Suite.sol

This address is the x402 `payTo`, so koha settles straight in.

Key design point (read before touching payments): the contract has **no deposit
function and cannot see individual koha payments**. x402 relays EIP-3009
`transferWithAuthorization`, which has no recipient callback — so `Suite` is a
dumb pot. Usage is metered **off-chain** and the owner (oracle wallet) calls
`distribute(recipients, amounts)` with the computed split.

- `settlementToken()` — the ERC-20 the pool holds.
- `poolBalance()` — held balance in atomic units. Poll this for the live counter.
- `distribute(address[] recipients, uint256[] amounts)` — `onlyOwner`. Splits the
  pool. Any remainder carries to the next period.
- Constructor rejects a zero token address, so a pool cannot be deployed pointing
  at nothing if `SETTLEMENT_TOKEN` is unset or wrong.

For the demo, **metering is faked**: seed usage numbers, compute amounts, call
`distribute`. Judges watch it settle on-chain; the input being hand-seeded is
disclosed, not hidden.

## UsageSplit.sol

Pro-rata allocation from off-chain usage weights, by floor division only. Turns
seeded usage into the `amounts` array. Guarantees `sum(amounts) <= distributable`
and returns the shortfall as `remainder`, which stays pooled for the next period.
Zero total weight allocates nothing and carries the whole pool forward.

## KohaRecord.sol

The permanent record of what you gave. Soulbound ERC-721, one per giver.

Not a claim on the pool and not ownership of anything — a statement of
contribution you can carry to another bundle: *"I gave this much, this often."*
That is the portability pitch, and it only works if the record outlives the
membership.

- `record(address giver, uint256 amount)` — `onlyOwner`. Opens the giver's record
  on their first koha, then accumulates. Returns the tokenId.
- `recordMany(address[] givers, uint256[] amounts)` — `onlyOwner`. A period in one
  transaction; same parallel-array shape as `Suite.distribute`.
- `totalGiven(address)` / `kohaCount(address)` / `recordOf(address)` / `hasRecord(address)`.
- `totalRecorded()` / `giverCount()` — collective totals, for a headline figure.

Same off-chain trust model as `Suite.distribute`: the contract cannot observe koha
(EIP-3009 has no recipient callback), so the oracle wallet attests it. Disclosed,
not hidden.

**Why the burn path is blocked rather than just absent.** `_update` reverts
`NeverBurns()` on any `to == address(0)`, so the invariant holds even if a future
edit adds a burn function. Leaving it merely unimplemented would make invariant #1
a fact about today's code instead of a property of the contract.

**Zero-amount koha is a first-class record.** `record(giver, 0)` mints and
increments `kohaCount`. A zero-payer has a giving history like anyone else — that
is the thesis, not an edge case.

## Tests

Per `CLAUDE.md`, the invariants that must not break come first:

1. **No wei lost** — `test_Distribute_NoWeiLost`: paid-out + remainder == start.
   Also `testFuzz_Plan_ConservesValue`, which fuzzes the same property through
   the allocation maths.
2. **Record survives an AccessPass burn** —
   `test_RecordSurvivesAccessPassBurn`: the member lapses, the credential burns,
   the record and its totals stand, and re-subscribing lands on the *same* record.
   Also `test_NeverBurns_GuardRejectsBurn`, which reaches past the (absent) burn
   path to prove the guard itself rejects one.
3. **Zero-amount succeeds** — `test_Distribute_ZeroAmountAllowed`: a member with
   no usage receives nothing without reverting. Also `test_Plan_AllZeroUsage` and
   `test_Record_ZeroAmountSucceeds`.

| File | Covers |
|---|---|
| `test/Suite.t.sol` | split by amounts, no wei lost, zero amount, exceeds-pool revert, length mismatch, only-owner, zero-token constructor, decimals-agnostic |
| `test/AccessPass.t.sol` | mint, one-per-address, only-owner, soulbound transfer revert, burn, re-mint after burn |
| `test/KohaRecord.t.sol` | opens on first koha, zero-amount koha, accumulation onto one token, only-owner, zero-giver revert, `recordMany` + length mismatch, soulbound, never-burns guard, survives an AccessPass burn |
| `test/Deploy.t.sol` | the deploy script's env wiring: owner/oracle owns all three contracts, Suite points at the configured token, missing addresses rejected |
| `test/Distribute.t.sol` | usage file parsing + bad-input rejection, pro-rata plan, cap, never-exceeds-pool, plan → `distribute` end to end, fuzz |

41 tests, all passing.

Note for anyone adding a test that touches `vm.setEnv`: forge runs test functions
concurrently and env vars are process-global, so cases that set the same variable
have to live in one test function (see `Deploy.t.sol`).

## Running

```bash
cd contracts
pnpm install                              # OpenZeppelin via npm
forge install foundry-rs/forge-std        # test lib (not on npm), if lib/ is empty
forge test -vvv
```

Remappings (`foundry.toml`): OZ resolves from `node_modules`, forge-std from `lib`.
`fs_permissions` lets scripts read the seeded usage file and write
`deployments/`, and nothing else.

## Deploy

Full runbook: **`docs/DEPLOY.md`**. In short:

```bash
forge script script/Deploy.s.sol --rpc-url fuji                          # dry run
forge script script/Deploy.s.sol --rpc-url fuji --account <keystore> --broadcast
pnpm addresses                                                            # from repo root
```

Constructors: `Suite(settlementToken, owner)`, `AccessPass(owner)`,
`KohaRecord(owner)` — all from environment variables, no address hardcoded in
Solidity. The script refuses
any chain but Fuji (43113) and a local node. It writes
`contracts/deployments/<chainId>.json`; `pnpm addresses` merges that into
`packages/shared/src/addresses.json` (the source of truth) and `pnpm abis`
refreshes `packages/shared/src/abis/`.

**Not deployed yet.** The dNZD details have now arrived and are confirmed, but
dNZD cannot settle over x402 (`docs/DNZD.md`), so the token choice is a judgement
call rather than a formality — `docs/DEPLOY.md` lays out the two options. Deploy
is still pending that call.

### Fuji USDC address — verified

`addresses.json` uses `0x5425890298aed601595a70AB815c96711a31Bc65` for both
`SettlementToken` (current fallback) and `USDC`. Confirmed:

- Circle's official USDC address list (chain 43113) and Snowtrace.
- The Avalanche Builder Hub **x402** network-setup docs use this exact token for
  x402 on Fuji — since x402 requires EIP-3009 `transferWithAuthorization`, its use
  of this token is proof of gasless support.
- It is also what x402's own `getDefaultAsset("avalanche-fuji")` returns, with 6
  decimals and EIP-712 domain `{ name: "USD Coin", version: "2" }` — the values
  in `packages/shared/src/settlement.json`.
- Valid EIP-55 checksum (viem-safe; won't throw at runtime).

Not done here: a live RPC round-trip. Optional sanity check:
`cast call 0x5425890298aed601595a70AB815c96711a31Bc65 "symbol()(string)" --rpc-url $FUJI_RPC_URL` → `USDC`.
