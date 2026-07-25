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
- **Contracts written and tested, NOT deployed:** `Suite.sol` (pool + `distribute`), `AccessPass.sol` (soulbound membership credential), `KohaRecord.sol` (permanent giving record, never burns), `UsageSplit.sol` (split maths). `forge test` passes on a real machine (41 tests). Deploy + distribute scripts exist; the Fuji deploy has been dry-run against live Fuji (~0.0136 AVAX of the owner's 0.5) and is one keystore import away from broadcasting.
- **Settlement token is configurable** — dNZD intended, Fuji USDC the fallback. Nothing about the token is hardcoded in Solidity or in the x402 config.
- **x402 route live** (`app/api/protected/route.ts`): unpaid GET → HTTP 402 (verified). Client `ContributeButton` wired via `x402-fetch`.
- **Pool counter + AccessPass card read on-chain** but show `—` / mock until contracts are deployed.
- **`packages/shared/src/addresses.json`**: `Suite`/`AccessPass`/`KohaRecord` are still **zero addresses**. `SettlementToken` and `USDC` are both set to the verified Fuji USDC address.

## Git / push reality — READ THIS
- Work was done on branch `claude/remote-control-architecture-qkg9a1`, merged to `main` (`cb3b665`).
- The origin Claude sandbox **could not push** (hard 403). Code reached GitHub via a **git bundle** that the human pushed from their Mac. **If your sandbox also can't push, use the same escape hatch:** `git bundle create out.bundle --branches` → hand it to the human → they push.
- Commits show **"Unverified"** on GitHub (no signing key in the sandbox). Cosmetic — ignore.

## Stack
Avalanche Fuji (43113) · x402 (PayAI facilitator) · USDC (+ future DNZD) ·
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
  src/AccessPass.sol           # soulbound credential (burns on lapse)
  src/KohaRecord.sol           # permanent giving record (never burns)
  test/*.t.sol                 # forge tests — 41, all passing
  foundry.toml                 # remappings; evm cancun
packages/shared/
  src/addresses.json           # SOURCE OF TRUTH for addresses — never hardcode
  src/abis/                    # Suite.json, AccessPass.json
contracts/script/
  Deploy.s.sol                 # Suite + AccessPass, env-driven, not yet run on Fuji
  Distribute.s.sol             # seeded usage -> Suite.distribute
  usage.example.json           # the reviewed split input
scripts/
  export-abis.mjs              # pnpm abis
  sync-addresses.mjs           # pnpm addresses — deploy artifact -> addresses.json
docs/
  ARCHITECTURE.md, CONTRACTS.md, SPONSORS.md, DEPLOY.md
  FLOWS.md, X402.md, SCOPE.md, AUTH.md         # written in the backend sprint
```

## Your priority queue

Backend sprint done: deploy script, seeded split workflow, settlement-token
config, the four missing docs. Everything left is blocked on a human input or is
deferred scope.

1. **Run the deploy on Fuji.** `contracts/script/Deploy.s.sol` deploys all three
   contracts and has been **dry-run against live Fuji successfully**;
   `contracts/.env` is in place with Fuji USDC as the settlement token (dNZD
   cannot settle over x402, so USDC is the call — `docs/DNZD.md`). The only thing
   left is the signer: `~/.foundry/keystores` is empty, so run
   `cast wallet import suiteas-deployer --interactive` and then broadcast. Exact
   commands: `docs/DEPLOY.md`. Lights up the pool counter and the AccessPass card.
2. **x402 facilitator — no longer blocked.** `X402_FACILITATOR_URL` is set to
   PayAI (`https://facilitator.payai.network`), which settles avalanche-fuji and
   needs **no API key**, so the paid thirdweb plan is not required. Verified live:
   `/supported` lists `exact` on avalanche-fuji, and unpaid `GET /api/protected`
   returns a correct 402 quote (avalanche-fuji / Fuji USDC / 10000 atomic /
   EIP-712 `{USD Coin, 2}`). **Remaining:** one paid click from a wallet holding
   Fuji USDC, to confirm settlement and a tx hash in `x-payment-response`. That
   needs a browser, so it cannot be done from a terminal. `docs/X402.md`.
3. **dNZD — the "New Money" prize track. Inspected; blocked on the token.**
   Address/decimals/EIP-712 domain are confirmed on-chain and in config, but
   dNZD has **no EIP-3009**, so x402 cannot settle it. It has ERC-2612 `permit`,
   which is not a substitute. Full evidence: **`docs/DNZD.md`**. Options: ask New
   Money to upgrade the token (UUPS, address can stay), or run a **dNZD
   split-only** pool while koha settles in USDC (`docs/DEPLOY.md`). Writing an
   x402 permit scheme is out of scope.
4. **Split with real member wallets** — the workflow exists
   (`contracts/script/Distribute.s.sol`, seeded JSON, `onlyOwner` oracle).
   Needs: the member recipient addresses. Hand-seeded usage is fine and
   disclosed.
5. **`KohaRecord`** — **built, tested (10 tests), deploys with the others.** The
   permanent giving record: soulbound, one per giver, `record`/`recordMany`
   attested by the oracle, and the burn path is blocked in `_update` so the
   invariant is structural. `test_RecordSurvivesAccessPassBurn` is the named
   invariant test. Not deployed yet (same deploy as #1) and **nothing renders it**
   — a card is a frontend-lane task. `docs/CONTRACTS.md`.
6. **Member ↔ member flow (flow 4, the differentiator)** — one member's API calls
   another's paid route, paying x402 into the pool. No contract work needed; it
   is flow 2 with a server as the payer. `docs/FLOWS.md`.

## Env / keys
Full list with required/optional/pending split: `.env.example` (web) and
`contracts/.env.example` (deploy).
- `NEXT_PUBLIC_PRIVY_APP_ID=cmrzbm07300en0djt6hnvzj5x` (set; public)
- `X402_PAY_TO` — the `Suite` address (override with a dev wallet to test before deploy)
- `X402_FACILITATOR_URL=https://facilitator.payai.network` — **set, verified.**
  No auth, so `THIRDWEB_SECRET_KEY` stays empty. Also needs setting in Vercel.
- `X402_SETTLEMENT_TOKEN_*` / `X402_PRICE_ATOMIC` — **leave empty.** All five or
  none, and dNZD cannot settle over x402 yet (`docs/DNZD.md`).
- dNZD `0x99A22a5AD6B2fd7EefE512F49dc22336dEEdf877` — 6 dp, EIP-712 `{dNZD, 1}`,
  ERC-2612 permit ✓, **EIP-3009 ✗**. Demo payer holds 1,000,000 dNZD.
- Fuji USDC `0x5425890298aed601595a70AB815c96711a31Bc65` — verified, FiatTokenV2 (EIP-3009 ✓)
- Owner/oracle `0xa7Dd13442d45450BE26843f6941B659555116bf1` (0.5 Fuji AVAX);
  demo payer `0x32f720F098816BCfe19d694D81fF9Bd8e27DaFE4` (Fuji test USDC).
- Deploy signer comes from a foundry keystore account (`cast wallet import`), never a file.
- Secrets live in `apps/web/.env.local` and Vercel env vars only. **Never commit a secret or a private key.**

## Gotchas
- `forge test` runs test functions **concurrently** and env vars are process-global, so `vm.setEnv` cases for the same variable must live in one test function (see `test/Deploy.t.sol`).
- `Suite.settlementToken` is immutable — swapping USDC for dNZD means deploying a new pool, not reconfiguring the old one.
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
