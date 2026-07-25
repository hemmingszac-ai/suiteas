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

## Current state (as of 2026-07-25, after the Fuji deploy)

Working branch: **`claude/backend-sprint`**, pushed to origin. `origin/main` has
moved with frontend-lane work — a trial merge was verified clean (zero
overlapping files; tests, typecheck and build green on the merged tree), so
GitHub does the merge.

**The contracts are LIVE on Fuji and verified.** The deploy was signed from the
**Core browser wallet** — no private key was exported or written to disk, and
`~/.foundry/keystores` is still empty. Keep signing that way.

**Nothing on the critical path is code-blocked.** The two remaining launch
blockers are both external, in a browser:

1. Set `X402_PAY_TO=0x9CFE88A4d8AEBF32F27dbBaaa335990dd70A2385` and
   `X402_FACILITATOR_URL=https://facilitator.payai.network` in the **Vercel**
   project. Set locally already; the deployed site quotes a zero `payTo` until
   this is done. There is no Vercel CLI on the machine.
2. Complete **one real paid Fuji USDC x402 payment** from the dashboard using the
   demo payer `0x32f720…FE4` (20 USDC, 0 AVAX — fine, x402 is gasless). Confirm
   `Suite.poolBalance()` rises and `x-payment-response` carries a tx hash. This is
   the only unproven leg of the rail.

**Do not create a replacement deploy wallet** — the human rejected that and does
not want funds moved. Use the two Core accounts already in the docs.

- **Live on Vercel** from `main` (commit `cb3b665`): landing + dashboard + x402 route build & deploy green.
- **Privy login wired** and App ID set. Login works once the live URL is in Privy's allowed origins.
- **Contracts DEPLOYED to Fuji (2026-07-25) and verified on-chain:** `Suite` `0x9CFE88A4…`, `AccessPass` `0x1408C217…`, `KohaRecord` `0x553FAC97…`, all owned by `0xa7Dd…6bf1`, settling in Fuji USDC. `UsageSplit.sol` is an internal library, nothing to deploy. Full verification table: `docs/DEPLOY.md`. `forge test` — 41 tests, green.
- **Settlement token is configurable** — dNZD intended, Fuji USDC the fallback. Nothing about the token is hardcoded in Solidity or in the x402 config.
- **x402 route live + facilitator resolved** (`app/api/protected/route.ts`): unpaid GET → 402 with a correct quote, verified live against the PayAI facilitator (`avalanche-fuji`, Fuji USDC, `10000` atomic, EIP-712 `{USD Coin, 2}`). Client `ContributeButton` wired via `x402-fetch`. A *paid* settlement is still unproven — needs a browser click.
- **Pool counter + AccessPass card** now have real addresses to read. The pool reads 0 because no koha has settled yet — that needs one paid browser payment, not code.
- **`packages/shared/src/addresses.json`**: all three contract addresses are live and non-zero. `SettlementToken` and `USDC` are the verified Fuji USDC address.

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
  Deploy.s.sol                 # Suite + AccessPass + KohaRecord, env-driven; broadcast to Fuji 2026-07-25
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
| `a10765d` | The Fuji deployment addresses, hand-corrected after the resumed-deploy shift. |
| `5bb6987` | **Root-cause fix for that shift.** `Deploy.s.sol` no longer writes the address record; `pnpm addresses` builds it from broadcast receipts and refuses addresses with no bytecode or a Suite slot that will not answer `settlementToken()`. Both guards were tested against the real failure. |

**Verified by running it, not by reading docs:**
- 41 contract tests pass (`forge test`), up from 31.
- Fuji deploy dry-run several times, then **broadcast for real** — the predicted addresses (`Suite 0x9CFE88A4…`, `AccessPass 0x1408C217…`, `KohaRecord 0x553FAC97…`) are what actually got deployed, confirmed against broadcast receipts.
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

Backend sprint done: contracts deployed + verified on Fuji, deploy script, seeded
split workflow, settlement-token config, the docs, `KohaRecord`, and the
facilitator. **Nothing left is code-blocked** — what remains is two browser tasks
and deferred scope.

1. ~~**Run the deploy on Fuji.**~~ **DONE 2026-07-25.** All three contracts live
   and verified on-chain (bytecode present, `AccessPass`/`KohaRecord` an exact
   byte match with the local build, `Suite` matching apart from its inlined
   immutable, `settlementToken()` = Fuji USDC, `owner()` = `0xa7Dd…6bf1`). Signed
   from the Core browser wallet. Addresses in `docs/DEPLOY.md` and
   `packages/shared/src/addresses.json`.

   **A resumed deploy corrupted the address record — read this before re-deploying.**
   The run timed out after `Suite` was mined and was finished with
   `--resume --slow`. The old `Deploy.s.sol` then rewrote
   `deployments/43113.json` from its *simulated* addresses, which on a resume
   derive from an already-advanced nonce, so every entry shifted by one: Suite got
   AccessPass's address, AccessPass got KohaRecord's, KohaRecord got an address
   with no code. Because `X402_PAY_TO` is the Suite address, that record would
   have sent koha into `AccessPass` — an ERC-721 with no way to move an ERC-20 out,
   i.e. unrecoverable. Fixed at the root: the script no longer writes the record,
   and `pnpm addresses` derives it from broadcast receipts and refuses any address
   without bytecode or any Suite slot that will not answer `settlementToken()`.
   **Always run `pnpm addresses` after a deploy and read its output.**

2. **The two remaining launch blockers, both external and both in a browser:**
   - **Vercel env vars.** Set `X402_PAY_TO=0x9CFE88A4d8AEBF32F27dbBaaa335990dd70A2385`
     and `X402_FACILITATOR_URL=https://facilitator.payai.network` in the Vercel
     project. Both are set in `apps/web/.env.local` (gitignored) and verified
     locally; the deployed site quotes a zero `payTo` until Vercel has them. No
     Vercel CLI on the machine.
   - **One real paid x402 payment.** The unpaid half is verified end to end
     (`/supported` lists `exact` on avalanche-fuji; the 402 quote returns
     avalanche-fuji / Fuji USDC / 10000 atomic / EIP-712 `{USD Coin, 2}` / `payTo`
     = the Suite pool). The **paid** half has never run. From the dashboard, pay
     with `0x32f720…FE4` (20 USDC, 0 AVAX — fine, x402 is gasless) and confirm
     `Suite.poolBalance()` rises and `x-payment-response` carries a tx hash.
     Cannot be driven from a terminal. `docs/X402.md`.
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
5. **`KohaRecord`** — **built, tested (10 tests), deployed and verified** at
   `0x553FAC970312aDDBc1366eD6aa3A87F2cB29B477`. The permanent giving record:
   soulbound, one per giver, `record`/`recordMany` attested by the oracle, and the
   burn path is blocked in `_update` so the invariant is structural.
   `test_RecordSurvivesAccessPassBurn` is the named invariant test. Currently
   `totalRecorded` = 0 and **nothing renders it** — the ABI is in
   `packages/shared/src/abis/KohaRecord.json` and the address resolves via
   `getAddress("KohaRecord")`, so a card is a frontend-lane task.
   `docs/CONTRACTS.md`.
6. **Member ↔ member flow (flow 4, the differentiator)** — one member's API calls
   another's paid route, paying x402 into the pool. No contract work needed; it
   is flow 2 with a server as the payer. `docs/FLOWS.md`.

## Env / keys
Full list with required/optional/pending split: `.env.example` (web) and
`contracts/.env.example` (deploy).
- `NEXT_PUBLIC_PRIVY_APP_ID=cmrzbm07300en0djt6hnvzj5x` (set; public)
- `X402_PAY_TO=0x9CFE88A4d8AEBF32F27dbBaaa335990dd70A2385` — the deployed `Suite`
  pool. **Set locally, PENDING in Vercel.** Could also be unset now that
  `addresses.json` holds the real Suite address. Never point it at a personal
  wallet, and never at `AccessPass`/`KohaRecord` — koha sent to an ERC-721 is
  unrecoverable.
- `X402_FACILITATOR_URL=https://facilitator.payai.network` — **set, verified.**
  No auth, so `THIRDWEB_SECRET_KEY` stays empty. Also needs setting in Vercel.
- `X402_SETTLEMENT_TOKEN_*` / `X402_PRICE_ATOMIC` — **leave empty.** All five or
  none, and dNZD cannot settle over x402 yet (`docs/DNZD.md`).
- dNZD `0x99A22a5AD6B2fd7EefE512F49dc22336dEEdf877` — 6 dp, EIP-712 `{dNZD, 1}`,
  ERC-2612 permit ✓, **EIP-3009 ✗**. Demo payer holds 1,000,000 dNZD.
- Fuji USDC `0x5425890298aed601595a70AB815c96711a31Bc65` — verified, FiatTokenV2 (EIP-3009 ✓)
- Owner/oracle `0xa7Dd13442d45450BE26843f6941B659555116bf1` — deployed all three,
  nonce 3; demo payer `0x32f720F098816BCfe19d694D81fF9Bd8e27DaFE4` (20 Fuji USDC,
  0 AVAX). Both are accounts on one Core wallet; neither has touched mainnet.
- Deploy signing was done **in the Core browser wallet** — no key was exported and
  `~/.foundry/keystores` is empty. If a local signer is ever needed, use
  `cast wallet import` (C-Chain key), never a key in a file.
- Secrets live in `apps/web/.env.local` and Vercel env vars only. **Never commit a secret or a private key.**

## Gotchas
- `forge test` runs test functions **concurrently** and env vars are process-global, so `vm.setEnv` cases for the same variable must live in one test function (see `test/Deploy.t.sol`).
- `Suite.settlementToken` is immutable — swapping USDC for dNZD means deploying a new pool, not reconfiguring the old one.
- `evm_version = cancun` (OZ 5.1 uses `mcopy`; Avalanche supports Cancun via Durango).
- OZ comes from npm (`contracts/node_modules`), forge-std from `lib/`. Remappings in `foundry.toml`.
- `next.config.mjs` has a `webpack.IgnorePlugin` for `@x402/*` — a wagmi-transitive dep, required while wagmi stays. Don't remove it.
- `addresses.json` now holds live Suite/AccessPass/KohaRecord addresses. The frontend's zero-address guards are still there and harmless — they matter again for any chain that has not been deployed to.
- **A resumed `forge script` re-simulates from an advanced nonce, so the addresses it prints are wrong.** Never copy addresses out of script output; run `pnpm addresses`, which reads broadcast receipts. Full explanation in `script/Deploy.s.sol`.
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
