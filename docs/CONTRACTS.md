# CONTRACTS

Minimal on-chain surface for the demo. Read before any Solidity.

- **`Suite.sol`** — the shared pool. The core of the demo.
- **`AccessPass.sol`** — soulbound membership credential (identity track).
- **`UsageSplit.sol`** — pure library, the split arithmetic. Not deployed.
- **`KohaRecord`** — not written. See `docs/SCOPE.md`. If built: it **never
  burns**; AccessPass burns on lapse, the giving record does not.

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

## Tests

Per `CLAUDE.md`, the two invariants that must not break come first:

1. **No wei lost** — `test_Distribute_NoWeiLost`: paid-out + remainder == start.
   Also `testFuzz_Plan_ConservesValue`, which fuzzes the same property through
   the allocation maths.
2. **Zero-amount succeeds** — `test_Distribute_ZeroAmountAllowed`: a member with
   no usage receives nothing without reverting. Also `test_Plan_AllZeroUsage`.

| File | Covers |
|---|---|
| `test/Suite.t.sol` | split by amounts, no wei lost, zero amount, exceeds-pool revert, length mismatch, only-owner, zero-token constructor, decimals-agnostic |
| `test/AccessPass.t.sol` | mint, one-per-address, only-owner, soulbound transfer revert, burn, re-mint after burn |
| `test/Deploy.t.sol` | the deploy script's env wiring: owner/oracle owns both contracts, Suite points at the configured token, missing addresses rejected |
| `test/Distribute.t.sol` | usage file parsing + bad-input rejection, pro-rata plan, cap, never-exceeds-pool, plan → `distribute` end to end, fuzz |

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

Constructor: `Suite(settlementToken, owner)` / `AccessPass(owner)`, both from
environment variables — no address is hardcoded in Solidity. The script refuses
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
