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

## Current state (as of 2026-07-25, end of the second backend session)

Working branch: **`claude/backend-sprint`**, pushed to origin, tree clean, 12
commits ahead of `origin/main`. `origin/main` is 2 commits ahead of the branch
(frontend lane: site nav, landing page, logo fix) — **trial-merged and verified
clean**: zero overlapping files, 41 contract tests + typecheck + build all green
on the merged tree. Not merged in, so GitHub does the merge.

**The one live blocker: the Fuji deploy needs a signer.** Everything else on the
critical path is done. `~/.foundry/keystores` is empty. The human must export the
**C-Chain** private key for `0xa7Dd…6bf1` from their **Core browser extension**
(Account name top-left → Options next to the account → *Show Private Key* →
C-Chain), then `cast wallet import suiteas-deployer --interactive`, then broadcast.
Verify with `cast wallet address --account suiteas-deployer` — if it is not
`0xa7Dd13442d45450BE26843f6941B659555116bf1` they picked X/P-Chain, which derives
a different key. Both original accounts were checked on Avalanche **mainnet**: 0
AVAX, 0 USDC, nonce 0, so exporting that key exposes nothing.
**Do not create a replacement wallet** — the human explicitly rejected that and
does not want funds moved. Use the two accounts already in the docs.

- **Live on Vercel** from `main` (commit `cb3b665`): landing + dashboard + x402 route build & deploy green.
- **Privy login wired** and App ID set. Login works once the live URL is in Privy's allowed origins.
- **Contracts written and tested, NOT deployed:** `Suite.sol` (pool + `distribute`), `AccessPass.sol` (soulbound membership credential), `KohaRecord.sol` (permanent giving record, never burns), `UsageSplit.sol` (split maths). `forge test` passes on a real machine (41 tests). Deploy + distribute scripts exist; the Fuji deploy has been dry-run against live Fuji (~0.0136 AVAX of the owner's 0.5) and is one keystore import away from broadcasting.
- **Settlement token is configurable** — dNZD intended, Fuji USDC the fallback. Nothing about the token is hardcoded in Solidity or in the x402 config.
- **x402 route live + facilitator resolved** (`app/api/protected/route.ts`): unpaid GET → 402 with a correct quote, verified live against the PayAI facilitator (`avalanche-fuji`, Fuji USDC, `10000` atomic, EIP-712 `{USD Coin, 2}`). Client `ContributeButton` wired via `x402-fetch`. A *paid* settlement is still unproven — needs a browser click.
- **Pool counter + AccessPass card read on-chain** but show `—` / mock until contracts are deployed.
- **`packages/shared/src/addresses.json`**: `Suite`/`AccessPass`/`KohaRecord` are still **zero addresses**. `SettlementToken` and `USDC` are both set to the verified Fuji USDC address.

## Git / push reality — READ THIS
- **Pushing works from the human's Mac.** The 403 below was sandbox-specific; `git push` to `origin` succeeded repeatedly in the 2026-07-25 session. Don't reach for the bundle workaround before trying a normal push.
- Historic note: the first session ran in a sandbox that **could not push** (hard 403) and shipped via a **git bundle**. If you are in a sandbox and hit 403: `git bundle create out.bundle --branches` → hand to the human.
- The first session's work is on branch `claude/remote-control-architecture-qkg9a1` (tip `cb3b665`), which **is** an ancestor of `origin/main` — so the content landed, but `cb3b665` is a branch tip, not a commit on `main`. `main` has moved past it twice since.
- Commits show **"Unverified"** on GitHub (no signing key). Cosmetic — ignore.

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
  Deploy.s.sol                 # Suite + AccessPass + KohaRecord, env-driven, not yet broadcast
  Distribute.s.sol             # seeded usage -> Suite.distribute
  usage.example.json           # the reviewed split input
scripts/
  export-abis.mjs              # pnpm abis
  sync-addresses.mjs           # pnpm addresses — deploy artifact -> addresses.json
docs/
  ARCHITECTURE.md, CONTRACTS.md, SPONSORS.md, DEPLOY.md
  FLOWS.md, X402.md, SCOPE.md, AUTH.md         # written in the backend sprint
```

## What the 2026-07-25 session changed

Four commits on `claude/backend-sprint`, all pushed:

| Commit | What |
|---|---|
| `dab17fa` | **`KohaRecord.sol` + 10 tests.** Invariant #1 enforced structurally: `_update` reverts `NeverBurns()` on any burn, so it holds even if a future edit adds a burn path. Wired into `Deploy.s.sol`, `pnpm abis`, `pnpm addresses`, `Deploy.t.sol`. Also fixed `docs/DEPLOY.md` telling you to create `script/usage.json`, which is **not** gitignored — now `usage.local.json`, which is. |
| `e787a94` | **PayAI as the x402 facilitator.** Killed the "thirdweb costs money" blocker. No code change needed — `facilitatorConfig()` already read only the URL. |
| `f269017`, `2978e5b` | A keystore-password-file ignore, then its revert. Net zero — see the rejected approach below. |

**Verified by running it, not by reading docs:**
- 41 contract tests pass (`forge test`), up from 31.
- Fuji deploy **dry-run against live Fuji** several times, clean. Predicted addresses with the original owner: `Suite 0x9CFE88A4…`, `AccessPass 0x1408C217…`, `KohaRecord 0x553FAC97…`. Cost ~0.022–0.043 AVAX depending on gas price.
- PayAI `/supported` lists `exact` on `avalanche-fuji`; `/verify` and `/settle` answer 200.
- Unpaid `GET /api/protected` → 402 with the correct quote.
- `pnpm typecheck` and `pnpm build` green, before and after a trial merge of `origin/main`.
- Both original wallets have zero mainnet exposure (0 AVAX / 0 USDC / nonce 0).

**An approach that was tried and explicitly rejected — do not repeat it.** When the
owner wallet's key could not be located, a fresh deploy wallet was generated
(`0x46a0C2EA…`) with a faucet-funding plan. The human rejected it: they want the
**original two wallets** used and **no funds moved**. It was fully reverted —
keystore deleted, password file deleted, `contracts/.env` restored, ignore rule
reverted. The correct path is exporting the existing key from Core.

## Your priority queue

Backend sprint done: deploy script, seeded split workflow, settlement-token
config, the four missing docs, `KohaRecord`, and the facilitator. Everything left
is blocked on a human input or is deferred scope.

1. **Run the deploy on Fuji — the only thing on the critical path.**
   `contracts/script/Deploy.s.sol` deploys all three contracts and has been
   dry-run against live Fuji successfully. `contracts/.env` exists (gitignored)
   with Fuji USDC as the settlement token and `0xa7Dd…6bf1` as owner. Blocked
   solely on the signer — see "Current state" above for the Core export path.
   Exact commands: `docs/DEPLOY.md`.

   **Once the human confirms the keystore exists, do all of this without asking:**
   ```bash
   cd contracts && forge script script/Deploy.s.sol --rpc-url fuji \
     --account suiteas-deployer --broadcast
   cd .. && pnpm addresses          # deployments/43113.json -> addresses.json
   # set X402_PAY_TO to the new Suite address in apps/web/.env.local AND Vercel
   pnpm typecheck && pnpm build
   # verify on-chain:
   cast call <SUITE> "settlementToken()(address)" --rpc-url fuji   # -> Fuji USDC
   cast call <SUITE> "owner()(address)" --rpc-url fuji             # -> 0xa7Dd…6bf1
   cast call <KOHA_RECORD> "totalRecorded()(uint256)" --rpc-url fuji
   # re-run the 402 smoke test and confirm payTo is now the Suite address
   ```
   Then sweep the docs that still say "nothing is deployed": `docs/DEPLOY.md`
   (line 5), `docs/CONTRACTS.md`, this file, `ARCHITECTURE.md`. Lights up the pool
   counter and the AccessPass card, which currently render `—`.
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
