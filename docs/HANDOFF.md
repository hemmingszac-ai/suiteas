# Suiteas — Handoff Brief (backend / "new money" / on-chain lane)

You're picking up the **contracts, x402/payments, data layer, and on-chain workings**.
A separate dev owns **UI/design** (`apps/web` components, styling, pages). Don't
edit their UI files without saying so in the commit message. Read `CLAUDE.md`
and `docs/SPONSORS.md` first — this brief is the fast on-ramp.

## What Suiteas is (30s)
A collective SaaS bundle. Users pay what they can — including **$0** — as
micropayments ("**koha**", te reo Māori for *gift*) over **x402** into a shared
pool (the `Suite` contract). The pool splits **on-chain** to member products by
metered usage. Members also pay each other on the same rail. Chain is
**Avalanche Fuji**; currency is **USDC** (and, for a prize, a NZD stablecoin).

## Current state (as of handoff)
- **Live on Vercel** from `main` (commit `cb3b665`): landing + dashboard + x402 route build & deploy green.
- **Privy login wired** and App ID set. Login works once the live URL is in Privy's allowed origins.
- **Contracts written + solc-verified, NOT deployed:** `Suite.sol` (pool + `distribute`), `AccessPass.sol` (soulbound membership credential). Foundry tests written but **not run** (Foundry install was egress-blocked in the origin session — solc was used to verify compilation).
- **x402 route live** (`app/api/protected/route.ts`): unpaid GET → HTTP 402 (verified). Client `ContributeButton` wired via `x402-fetch`.
- **Pool counter + AccessPass card read on-chain** but show `—` / mock until contracts are deployed.
- **`packages/shared/src/addresses.json`**: `Suite`/`AccessPass`/`KohaRecord` are still **zero addresses**. `USDC` is set and verified.

## Git / push reality — READ THIS
- Work was done on branch `claude/remote-control-architecture-qkg9a1`, merged to `main` (`cb3b665`).
- The origin Claude sandbox **could not push** (hard 403). Code reached GitHub via a **git bundle** that the human pushed from their Mac. **If your sandbox also can't push, use the same escape hatch:** `git bundle create out.bundle --branches` → hand it to the human → they push.
- Commits show **"Unverified"** on GitHub (no signing key in the sandbox). Cosmetic — ignore.

## Stack
Avalanche Fuji (43113) · x402 (thirdweb facilitator) · USDC (+ future DNZD) ·
Solidity 0.8.24 / Foundry (**evm_version = cancun**) · Next.js 14 App Router ·
Privy · viem + wagmi · Supabase (not yet wired) · Vercel · pnpm monorepo.

## Repo map
```
apps/web/
  app/api/protected/route.ts   # x402 paid route (YOUR lane)
  lib/x402.ts                  # payTo / facilitator / price config (YOUR lane)
  lib/config/sponsors.ts       # prize-track registry
  components/, app/*           # UI (OTHER dev's lane)
contracts/
  src/Suite.sol                # pool + distribute() (deployed addr → payTo)
  src/AccessPass.sol           # soulbound credential
  test/*.t.sol                 # forge tests (not yet run)
  foundry.toml                 # remappings; evm cancun
packages/shared/
  src/addresses.json           # SOURCE OF TRUTH for addresses — never hardcode
  src/abis/                    # Suite.json, AccessPass.json
docs/
  ARCHITECTURE.md, CONTRACTS.md, SPONSORS.md   # exist
  FLOWS.md, X402.md, SCOPE.md, AUTH.md         # referenced by CLAUDE.md but NOT created yet
```

## Your priority queue
1. **Deploy script (Foundry)** — deploy `Suite` + `AccessPass` to Fuji and write their
   addresses into `packages/shared/src/addresses.json`. This lights up the pool counter,
   the AccessPass card, and mint-on-contribute. **Highest value; not written yet.**
2. **thirdweb facilitator** — set `X402_FACILITATOR_URL` (+ `THIRDWEB_SECRET_KEY` if it
   needs auth) so x402 actually settles on Fuji. Verify the smoke test: unpaid
   `GET /api/protected` → 402; paid → USDC lands at the `Suite` address (`payTo`).
3. **Digital NZD (DNZD) — the "New Money" prize track.** The x402 rail is token-agnostic.
   If the DNZD sponsor has a Fuji test token (EIP-3009/`transferWithAuthorization`
   support required), point the x402 asset at it in `lib/x402.ts` (`KOHA_ROUTE.price`
   → `{ amount, asset: { address, decimals, eip712: { name, version } } }`). ~1hr to win a track. **Need the token address.**
4. **Real metering + split** — currently faked. `Suite.distribute(recipients, amounts)` is
   `onlyOwner` (the oracle wallet). Seed usage (Supabase or a JSON file), compute the
   split, call `distribute`. Judges watch it settle on-chain; hand-seeded input is fine.
5. **`KohaRecord` contract** — not built. Invariant: it is the **permanent** giving record
   and **never burns** (AccessPass burns on lapse; KohaRecord does not). Build if pursuing
   the portability pitch.
6. **Member ↔ member flow (flow 4, the differentiator)** — one member's API calls another's
   paid route, paying x402 into the pool.

## Env / keys
- `NEXT_PUBLIC_PRIVY_APP_ID=cmrzbm07300en0djt6hnvzj5x` (set; public)
- `X402_PAY_TO` — the `Suite` address (override with a dev wallet to test before deploy)
- `X402_FACILITATOR_URL` / `THIRDWEB_SECRET_KEY` — **pending** (thirdweb account)
- Fuji USDC `0x5425890298aed601595a70AB815c96711a31Bc65` — verified, FiatTokenV2 (EIP-3009 ✓)
- Need: Fuji AVAX + USDC in test wallets; an **owner/oracle wallet** for the contracts.
- Secrets live in `apps/web/.env.local` and Vercel env vars only. **Never commit a secret or a private key.**

## Gotchas
- Foundry was egress-blocked in the origin sandbox → run `forge install foundry-rs/forge-std && forge test` on a real machine.
- `evm_version = cancun` (OZ 5.1 uses `mcopy`; Avalanche supports Cancun via Durango).
- OZ comes from npm (`contracts/node_modules`), forge-std from `lib/`. Remappings in `foundry.toml`.
- `next.config.mjs` has a `webpack.IgnorePlugin` for `@x402/*` — a wagmi-transitive dep, required while wagmi stays. Don't remove it.
- `addresses.json` Suite/AccessPass are zero until you deploy; frontend reads guard on the zero address.
- `NEXT_PUBLIC_PREVIEW_MOCK=1` renders auth-gated screens without a login — **design preview only, never in prod.**

## Rules (from CLAUDE.md — do not break)
- Never hardcode a contract address; read from `packages/shared`.
- **Never write a custom deposit/payment function.** x402 handles payment; `payTo` = the `Suite` contract.
- Fuji (43113) only. Never mainnet.
- **Zero-amount koha must succeed** (thesis, not an edge case).
- **KohaRecord never burns.** AccessPass burns on lapse.
- TypeScript `strict`, no `any`. Small commits, push often.

## Run / build / test
```bash
pnpm install
pnpm dev            # web app (localhost:3000)
pnpm build
# contracts:
cd contracts
pnpm install                        # OpenZeppelin
forge install foundry-rs/forge-std  # test lib
forge test -vvv
```

## Prize context (why your lane matters)
See `docs/SPONSORS.md` for the full map. Your work drives: **Avalanche C-Chain**
(anchor), **Overall**, **New Money / Digital NZD** (your token work), and
**Lumin — Payments + Identity** (x402 as modern payments/invoicing). Identity is
mostly done (wallet-as-login + soulbound AccessPass); payments + the split are yours.
