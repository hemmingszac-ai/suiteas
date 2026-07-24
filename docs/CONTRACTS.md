# CONTRACTS

Minimal on-chain surface for the demo. **One** contract for v1: `Suite`.
AccessPass / KohaRecord (the NFT narrative) are deferred until the core split
loop is solid — see `docs/SPONSORS.md` for why.

## Suite.sol

The shared pool. This address is the x402 `payTo`, so USDC settles straight in.

Key design point (read before touching payments): the contract has **no deposit
function and cannot see individual koha payments**. x402 relays EIP-3009
`transferWithAuthorization`, which has no recipient callback — so `Suite` is a
dumb USDC pot. Usage is metered **off-chain** and the owner (oracle wallet)
calls `distribute(recipients, amounts)` with the computed split.

- `poolBalance()` — USDC held. Poll this for the live counter.
- `distribute(address[] recipients, uint256[] amounts)` — `onlyOwner`. Splits
  the pool. Any remainder carries to the next period.

For the demo, **metering is faked**: seed usage numbers, compute amounts, call
`distribute`. Judges watch it settle on-chain; the input being hand-seeded is
disclosed, not hidden.

## Tests (the two that matter)

Per `CLAUDE.md`, these are the invariants that must not break:

1. **No wei lost** — `test_Distribute_NoWeiLost`: paid-out + remainder == start.
2. **Zero-amount succeeds** — `test_Distribute_ZeroAmountAllowed`: a member with
   no usage receives nothing without reverting.

Plus: split-by-amounts, exceeds-pool revert, length-mismatch revert, only-owner.

## Running

Foundry's installer is blocked by this environment's egress policy, so the
contract was compile-verified with solc 0.8.24 (no `forge` run here). On a
machine with Foundry:

```bash
cd contracts
pnpm install                              # OpenZeppelin via npm
forge install foundry-rs/forge-std        # test lib (not on npm)
forge test -vvv
```

Remappings (`foundry.toml`): OZ resolves from `node_modules`, forge-std from `lib`.

## Deploy

Writes the deployed address to `packages/shared/src/addresses.json` (never
hardcode). Constructor: `Suite(usdcAddress, ownerAddress)`. The Suite ABI is
exported to `packages/shared/src/abis/Suite.json` for the frontend.

### Fuji USDC address — verified

`addresses.json` uses `0x5425890298aed601595a70AB815c96711a31Bc65`. Confirmed:
- Circle's official USDC address list (chain 43113) and Snowtrace.
- The Avalanche Builder Hub **x402** network-setup docs use this exact token for
  x402 on Fuji — since x402 requires EIP-3009 `transferWithAuthorization`, its use
  of this token is proof of gasless support.
- Valid EIP-55 checksum (viem-safe; won't throw at runtime).

Not done here: a live RPC round-trip (Fuji RPC is egress-blocked in this
environment). Optional sanity check on your machine:
`cast call 0x5425890298aed601595a70AB815c96711a31Bc65 "symbol()(string)" --rpc-url $FUJI_RPC_URL` → `USDC`.
