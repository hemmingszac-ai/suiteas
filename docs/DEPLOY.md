# DEPLOY

Deploying `Suite` + `AccessPass` to Avalanche Fuji, and running the split.

**Nothing is deployed yet.** The scripts are written and rehearsed against a
local anvil; the Fuji run is deliberately held until the dNZD token details
arrive, so the pool is not deployed pointing at a token we intend to replace.

## Wallets (public addresses — safe here)

| Role | Address | State |
|---|---|---|
| Owner / oracle / deployer | `0xa7Dd13442d45450BE26843f6941B659555116bf1` | 0.5 Fuji AVAX |
| Demo payer | `0x32f720F098816BCfe19d694D81fF9Bd8e27DaFE4` | Fuji test USDC |
| Member recipients | not yet chosen | needed before broadcasting a split |

The owner/oracle wallet owns both contracts and is the only account that can call
`Suite.distribute` and `AccessPass.mint`.

## The signing key never enters this repo

Import it once into Foundry's keystore, which stores it encrypted under
`~/.foundry/keystores`:

```bash
cast wallet import suiteas-deployer --interactive     # paste the key at the prompt
cast wallet address --account suiteas-deployer        # confirm it matches the owner above
```

Then every script call takes `--account suiteas-deployer` and prompts for the
password. Do not put a private key in `.env`, in a script, or on a command line.

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

## 1. Deploy

```bash
cd contracts
forge test -vvv                                    # green first

# dry run — simulates, broadcasts nothing, writes no artifact
forge script script/Deploy.s.sol --rpc-url fuji

# for real
forge script script/Deploy.s.sol --rpc-url fuji --account suiteas-deployer --broadcast
```

Then wire the addresses into the app:

```bash
cd ..
pnpm addresses          # deployments/43113.json -> packages/shared/src/addresses.json
pnpm abis               # only if the contracts changed
pnpm typecheck && pnpm build
```

`pnpm addresses` writes `Suite`, `AccessPass` and `SettlementToken`, leaving other
keys alone. Never hand-edit an address into code.

Optional sanity checks:

```bash
cast call <SUITE> "settlementToken()(address)" --rpc-url fuji
cast call <SUITE> "owner()(address)" --rpc-url fuji
cast call <SUITE> "poolBalance()(uint256)" --rpc-url fuji
```

## 2. Point x402 at the pool

In `apps/web/.env.local` **and** Vercel, set `X402_PAY_TO` to the deployed Suite
address (or unset it so `addresses.json` supplies it). Confirm the smoke test in
`docs/X402.md` still returns 402 unpaid, and that a paid call increases
`poolBalance()`.

## 3. Run the split

```bash
cd contracts
cp script/usage.example.json script/usage.json     # put real member wallets in
```

The file is two parallel arrays — same length, zero usage allowed:

```json
{ "recipients": ["0x…", "0x…"], "usage": [1200, 0] }
```

```bash
# dry run — prints the plan and every allocation, broadcasts nothing
USAGE_FILE=script/usage.json forge script script/Distribute.s.sol \
  --rpc-url fuji --sender 0xa7Dd13442d45450BE26843f6941B659555116bf1

# settle it
USAGE_FILE=script/usage.json forge script script/Distribute.s.sol \
  --rpc-url fuji --account suiteas-deployer --broadcast
```

Read the dry-run output before broadcasting — that is the review step. Set
`DISTRIBUTE_MAX` to split only part of the pool so the live counter keeps a
visible balance during the demo.

`--sender` on the dry run matters: `distribute` is `onlyOwner`, so simulating as
anyone else fails with `OwnableUnauthorizedAccount`, which is the check working.

## Switching to dNZD

When New Money supplies the token details, this is the whole change:

```bash
# 1. contracts/.env
SETTLEMENT_TOKEN=<dNZD address>

# 2. redeploy Suite against the new token (the pool is immutable in its token)
cd contracts
forge script script/Deploy.s.sol --rpc-url fuji --account suiteas-deployer --broadcast
cd .. && pnpm addresses

# 3. packages/shared/src/settlement.json — add the real symbol, decimals and
#    EIP-712 domain for chain 43113, and set "status": "live"

# 4. apps/web/.env.local + Vercel — quote the token directly
X402_SETTLEMENT_TOKEN_ADDRESS=<dNZD address>
X402_SETTLEMENT_TOKEN_DECIMALS=<from the token contract>
X402_SETTLEMENT_TOKEN_EIP712_NAME=<from the token contract>
X402_SETTLEMENT_TOKEN_EIP712_VERSION=<from the token contract>
X402_PRICE_ATOMIC=<price in atomic units — not converted from USD>
X402_PAY_TO=<new Suite address>

# 5. pnpm typecheck && pnpm build, then re-run the 402 smoke test
```

`Suite.settlementToken` is immutable, so a token change means a new pool. Do the
split demo on one token or the other, not across a swap.

**Confirm first:** dNZD must implement EIP-3009 `transferWithAuthorization` for
x402 to settle it. If it only supports EIP-2612 `permit`, the rail needs a new
scheme and no configuration change will do it. See `docs/X402.md`.

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
