# DEPLOY

Deploying `Suite` + `AccessPass` + `KohaRecord` to Avalanche Fuji, and running the split.

## Deployed — Avalanche Fuji (43113), 2026-07-25

| Contract | Address | Verified |
|---|---|---|
| `Suite` | `0x9CFE88A4d8AEBF32F27dbBaaa335990dd70A2385` | bytecode present; `settlementToken()` = Fuji USDC, `owner()` = owner/oracle |
| `AccessPass` | `0x1408C2174B1B2815b65F5f4f8beb71cdCcAF6d5f` | bytecode **exact match** with the local build; `PASS` |
| `KohaRecord` | `0x553FAC970312aDDBc1366eD6aa3A87F2cB29B477` | bytecode **exact match** with the local build; `KOHA` |
| Settlement token | `0x5425890298aed601595a70AB815c96711a31Bc65` | Fuji USDC, `symbol()` = USDC, 6 dp |
| Owner / oracle | `0xa7Dd13442d45450BE26843f6941B659555116bf1` | owns all three |

Deployed against **Fuji USDC**, not dNZD — dNZD has no EIP-3009 so koha cannot
settle into it over x402 (`docs/DNZD.md`). `Suite.settlementToken` is immutable,
so moving to dNZD means deploying a second pool.

Suite's on-chain bytecode differs from the local build in exactly 16 byte-ranges,
all of which reassemble to the Fuji USDC address — the inlined `immutable`. Every
other byte matches, so the deployed code is this repo's code.

### Read the addresses from `packages/shared`, never from this table

This table is a record for humans. Code reads
`packages/shared/src/addresses.json` via `getAddress()`.

### If a deploy is interrupted — read this before `--resume`

The 2026-07-25 deploy timed out after `Suite` was mined and was completed with
`--resume --slow`. That worked, but the **old** `Deploy.s.sol` then rewrote
`deployments/43113.json` with addresses shifted by one, because a resumed run
re-simulates from an already-advanced nonce. It was caught and corrected by hand.

That cannot happen now: the script no longer writes the record, and `pnpm
addresses` builds it from broadcast receipts and refuses any address without
bytecode. **Always run `pnpm addresses` after a resume, and read its output** —
it prints the bytecode size of each contract and cross-checks
`Suite.settlementToken()`.

## Wallets (public addresses — safe here)

| Role | Address | State |
|---|---|---|
| Owner / oracle / deployer | `0xa7Dd13442d45450BE26843f6941B659555116bf1` | deployed all three; nonce 3 |
| Demo payer | `0x32f720F098816BCfe19d694D81fF9Bd8e27DaFE4` | 20 Fuji USDC, 0 AVAX (fine — x402 is gasless) |
| Member recipients | not yet chosen | needed before broadcasting a split |

Both are accounts on one Core wallet (same recovery phrase), testnet use only.
Neither has ever transacted on Avalanche mainnet.

The owner/oracle wallet owns all three contracts and is the only account that can
call `Suite.distribute`, `AccessPass.mint` and `KohaRecord.record`.

## Signing

The 2026-07-25 deploy was signed **from the browser wallet (Core)**, not from a
Foundry keystore — no private key was ever exported or written to disk. That is
the preferred route; keep using it.

If a future step does need a local signer, import once into Foundry's keystore,
which stores it encrypted under `~/.foundry/keystores`:

```bash
cast wallet import suiteas-deployer --interactive     # paste the key at the prompt
cast wallet address --account suiteas-deployer        # confirm it matches the owner above
```

Then every script call takes `--account suiteas-deployer` and prompts for the
password. Do not put a private key in `.env`, in a script, or on a command line.
In Core, "Show Private Key" is per-account (Account name → Options) and you must
pick **C-Chain** — X/P-Chain derives a different key.

## Environment

Foundry reads `contracts/.env` automatically. Copy the template:

```bash
cp contracts/.env.example contracts/.env
```

| Variable | Used by | Notes |
|---|---|---|
| `FUJI_RPC_URL` | both scripts | the `fuji` alias in `foundry.toml` |
| `SETTLEMENT_TOKEN` | `Deploy.s.sol` | Fuji USDC now, dNZD later |
| `SUITE_OWNER` | `Deploy.s.sol` | owner/oracle wallet |
| `SUITE_ADDRESS` | `Distribute.s.sol` | optional; falls back to the deploy artifact |
| `USAGE_FILE` | `Distribute.s.sol` | optional; defaults to `script/usage.example.json` |
| `DISTRIBUTE_MAX` | `Distribute.s.sol` | optional cap in atomic units |

`Deploy.s.sol` refuses any chain other than Fuji (43113) or a local node
(31337), so a mainnet RPC cannot be broadcast to by accident.

## 1. Deploy — **already done on Fuji**

Kept for a re-deploy (e.g. a second pool against a different settlement token).

```bash
cd contracts
forge test -vvv                                    # green first

# dry run — simulates, broadcasts nothing, writes nothing
forge script script/Deploy.s.sol --rpc-url fuji

# for real
forge script script/Deploy.s.sol --rpc-url fuji --account suiteas-deployer --broadcast
```

The addresses the script *prints* come from its simulation and are only correct on
a clean, uninterrupted run. **Do not copy them anywhere.** Record them with:

```bash
cd ..
pnpm addresses          # broadcast receipts -> deployments/<chain>.json + addresses.json
pnpm abis               # only if the contracts changed
pnpm typecheck && pnpm build
```

`pnpm addresses` reads `contracts/broadcast/Deploy.s.sol/<chainId>/run-latest.json`
— the receipts, which are what the chain actually created — writes `Suite`,
`AccessPass`, `KohaRecord` and `SettlementToken`, and leaves other keys alone. It
aborts if any address has no bytecode or if the Suite slot does not answer
`settlementToken()`. Never hand-edit an address into code.

Sanity checks (all read-only):

```bash
cast call <SUITE> "settlementToken()(address)" --rpc-url fuji
cast call <SUITE> "owner()(address)" --rpc-url fuji
cast call <SUITE> "poolBalance()(uint256)" --rpc-url fuji
cast call <KOHA_RECORD> "totalRecorded()(uint256)" --rpc-url fuji
```

## 2. Point x402 at the pool — **done locally, PENDING in Vercel**

`apps/web/.env.local` now has
`X402_PAY_TO=0x9CFE88A4d8AEBF32F27dbBaaa335990dd70A2385` (the Suite pool) and
`X402_FACILITATOR_URL=https://facilitator.payai.network`. Verified: the unpaid 402
quote returns that `payTo`.

**Both still need setting in the Vercel project** — the deployed site is otherwise
quoting a zero `payTo`. `.env.local` is gitignored and never committed.

In `apps/web/.env.local` **and** Vercel, set `X402_PAY_TO` to the deployed Suite
address (or unset it so `addresses.json` supplies it). Confirm the smoke test in
`docs/X402.md` still returns 402 unpaid, and that a paid call increases
`poolBalance()`.

## 3. Attest the koha (optional, for the portability story)

`KohaRecord` is the permanent giving record. Like `Suite`, it cannot see koha
itself — EIP-3009 has no recipient callback — so the oracle wallet attests each
one. Amounts are in the settlement token's atomic units (USDC: 6 dp, so
`10000` = $0.01).

```bash
# one koha
cast send <KOHA_RECORD> "record(address,uint256)" <GIVER> 10000 \
  --rpc-url fuji --account suiteas-deployer

# a period in one transaction — note the zero-payer, which must succeed
cast send <KOHA_RECORD> "recordMany(address[],uint256[])" \
  "[<GIVER_A>,<GIVER_B>]" "[10000,0]" \
  --rpc-url fuji --account suiteas-deployer

# read it back
cast call <KOHA_RECORD> "totalGiven(address)(uint256)" <GIVER> --rpc-url fuji
cast call <KOHA_RECORD> "kohaCount(address)(uint256)" <GIVER> --rpc-url fuji
```

The first `record` for an address mints their soulbound token; later ones
accumulate onto it. There is deliberately no burn path — see `docs/CONTRACTS.md`.

## 4. Run the split

```bash
cd contracts
cp script/usage.example.json script/usage.local.json   # put real member wallets in
```

`usage.local.json` is the gitignored working copy — use that name, not `usage.json`,
so real member wallets never get committed.

The file is two parallel arrays — same length, zero usage allowed:

```json
{ "recipients": ["0x…", "0x…"], "usage": [1200, 0] }
```

```bash
# dry run — prints the plan and every allocation, broadcasts nothing
USAGE_FILE=script/usage.local.json forge script script/Distribute.s.sol \
  --rpc-url fuji --sender 0xa7Dd13442d45450BE26843f6941B659555116bf1

# settle it
USAGE_FILE=script/usage.local.json forge script script/Distribute.s.sol \
  --rpc-url fuji --account suiteas-deployer --broadcast
```

Read the dry-run output before broadcasting — that is the review step. Set
`DISTRIBUTE_MAX` to split only part of the pool so the live counter keeps a
visible balance during the demo.

`--sender` on the dry run matters: `distribute` is `onlyOwner`, so simulating as
anyone else fails with `OwnableUnauthorizedAccount`, which is the check working.

## Switching to dNZD

**Read `docs/DNZD.md` first.** dNZD's address, decimals and EIP-712 domain are
confirmed, but it **does not implement EIP-3009**, so koha cannot settle into a
dNZD pool over x402. Two honest options:

- **Deploy the pool against USDC** (what the steps above do). Flow 2 and flow 3
  both work. This is the default.
- **Deploy the pool against dNZD for the split only.** `Suite` holds dNZD fine, so
  seed it with a plain transfer from the demo payer (which holds 1,000,000 dNZD)
  and run the split on-chain. Do **not** set the `X402_SETTLEMENT_TOKEN_*`
  variables — the 402 quote would look valid and then fail at settlement. Koha
  keeps settling in USDC, so the story has two currencies in it; say that out loud
  rather than letting a judge find it.

```bash
# dNZD split-only pool
SETTLEMENT_TOKEN=0x99A22a5AD6B2fd7EefE512F49dc22336dEEdf877 \
  forge script script/Deploy.s.sol --rpc-url fuji --account suiteas-deployer --broadcast
cd .. && pnpm addresses
# seed it from the demo payer, then run script/Distribute.s.sol as normal
cast send 0x99A22a5AD6B2fd7EefE512F49dc22336dEEdf877 "transfer(address,uint256)" \
  <SUITE> 100000000 --rpc-url fuji --account <demo-payer-keystore>
```

### Once the settlement token actually supports EIP-3009

If New Money upgrades dNZD (it is a UUPS proxy, so the address can stay), or
another EIP-3009 token is chosen, this is the whole change:

```bash
# 1. contracts/.env
SETTLEMENT_TOKEN=<dNZD address>

# 2. redeploy Suite against the new token (the pool is immutable in its token)
cd contracts
forge script script/Deploy.s.sol --rpc-url fuji --account suiteas-deployer --broadcast
cd .. && pnpm addresses

# 3. packages/shared/src/settlement.json — promote the token from
#    candidates.<symbol> to the "43113" entry and set "status": "live".
#    For dNZD the verified values are already recorded: symbol dNZD,
#    decimals 6, eip712 { name: "dNZD", version: "1" }.

# 4. apps/web/.env.local + Vercel — quote the token directly
X402_SETTLEMENT_TOKEN_ADDRESS=0x99A22a5AD6B2fd7EefE512F49dc22336dEEdf877
X402_SETTLEMENT_TOKEN_DECIMALS=6
X402_SETTLEMENT_TOKEN_EIP712_NAME=dNZD
X402_SETTLEMENT_TOKEN_EIP712_VERSION=1
X402_PRICE_ATOMIC=<price in atomic units — not converted from USD>
X402_PAY_TO=<new Suite address>

# 5. pnpm typecheck && pnpm build, then re-run the 402 smoke test
```

**First re-verify EIP-3009 actually landed** — this is the step that is currently
false, so do not skip it:

```bash
# must return false (not revert) once EIP-3009 is present
cast call 0x99A22a5AD6B2fd7EefE512F49dc22336dEEdf877 \
  "authorizationState(address,bytes32)(bool)" \
  0x32f720F098816BCfe19d694D81fF9Bd8e27DaFE4 \
  0x0000000000000000000000000000000000000000000000000000000000000001 --rpc-url fuji
```

If it reverts with empty data, the function is still absent and nothing above
will work. Re-check the EIP-712 domain too — an upgrade can change it.

`Suite.settlementToken` is immutable, so a token change means a new pool. Do the
split demo on one token or the other, not across a swap.

## Local rehearsal

The whole sequence, no testnet and no keys:

```bash
anvil                                              # in another terminal
cd contracts
forge test -vvv                                    # includes Deploy + Distribute tests
forge create test/mocks/MockSettlementToken.sol:MockSettlementToken \
  --rpc-url http://127.0.0.1:8545 --unlocked --from <anvil account 0> --broadcast \
  --constructor-args "USD Coin" "USDC" 6
SETTLEMENT_TOKEN=<mock> SUITE_OWNER=<anvil account 0> \
  forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 \
  --broadcast --unlocked --sender <anvil account 0>
cast send <mock> "mint(address,uint256)" <suite> 1000000 \
  --rpc-url http://127.0.0.1:8545 --unlocked --from <anvil account 0>
# then the Distribute commands above against the anvil RPC
```

`--unlocked` uses anvil's own accounts, so no key is handled. The local chain's
artifact (`deployments/31337.json`) is gitignored — ephemeral addresses are not a
deployment record.
