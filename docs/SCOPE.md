# SCOPE

Scope creep is the primary failure mode this weekend. `CLAUDE.md` and `AGENTS.md`
both point here: if a request is on this list, say so and propose the smallest
thing that serves the demo.

Every item below is sourced from an existing decision in this repo, not invented
here. The source is named so it can be argued with.

## Hard rules — never in scope

| Not in scope | Why | Source |
|---|---|---|
| Mainnet, real funds | Fuji (43113) only, testnet assets only | `CLAUDE.md`, `SETUP.md` |
| A custom deposit / payment / escrow-transfer function | x402 already moves the money; `payTo` is the Suite contract. This is the single biggest scope reduction available | `CLAUDE.md`, `ARCHITECTURE.md`, `docs/X402.md` |
| Hand-rolled ERC-721 or access control | OpenZeppelin for anything standard | `CLAUDE.md` |
| A hardcoded contract address anywhere in code | `packages/shared/src/addresses.json` is the source of truth | `CLAUDE.md` |
| A custom login form | Auth is Privy | `AGENTS.md`, `docs/AUTH.md` |
| Deriving a user's wallet address from client input | Always from the verified Privy token, server-side | `CLAUDE.md` |
| A second styling system | Tailwind + shadcn/ui | `AGENTS.md` |
| Committing or logging a key | Secrets live in `.env.local` and Vercel only | `CLAUDE.md` |
| `NEXT_PUBLIC_PREVIEW_MOCK` in production | It bypasses the auth guard | `apps/web/lib/config/preview.ts` |
| Frontend tests | Only the contract tests in `docs/CONTRACTS.md` | `CLAUDE.md`, `AGENTS.md` |

## Deferred — real, but not now

Not rejected. Just not before the flows that are already half-built.

- **KohaRecord.** The permanent giving record. Contract not written; the address
  is a zero entry in `addresses.json`. Build it only if pursuing the portability
  pitch. Invariant if built: **it never burns** — AccessPass burns on lapse, the
  giving record does not. (`CLAUDE.md`, `docs/HANDOFF.md` #5)
- **Supabase.** Not wired into the code and not required to begin. Usage is a
  reviewed JSON file for now. Recorded as a later integration task, not a
  blocker. (`SETUP(1).md` §6, `docs/HANDOFF.md`)
- **Flow 1, escrow-gated subscribe** and **flow 4, member ↔ member.** See
  `docs/FLOWS.md`. Flow 4 is the differentiator and should be told in the pitch
  whether or not it is built this weekend.
- **The embeddable widget SDK and the demo-SaaS app.** `packages/sdk` and
  `apps/demo-saas` appear in the `ARCHITECTURE.md` layout but do not exist.
  Codex's lane if they happen. (`AGENTS.md`)
- **Real (non-seeded) metering.** Off-chain and hand-seeded is the disclosed
  design, not a stopgap to fix this weekend. Roadmap: multi-sig attestations →
  TEE → ZK usage proofs. (`ARCHITECTURE.md`)
- **FireEyes governance track.** Not a governance project. Skip unless finished
  early. (`docs/SPONSORS.md`)
- **A second Vercel project.** Use the existing one unless it cannot be
  recovered. (`SETUP(1).md` §6)

## Blocked on someone else, not on scope

Do not build around these; they are inputs, not work.

- **dNZD**: token address, decimals, EIP-712 domain, whether it implements
  EIP-3009, and the API/facilitator details. Pending from New Money. The
  configuration surface for all of it already exists — see `docs/X402.md`.
- **x402 facilitator URL** (and a secret if it needs auth). Without it, live
  Fuji settlement cannot be tested. thirdweb is unconfigured because the
  available plan appears paid.
- **Fuji deployment.** Owner wallet has AVAX; the deploy script is written,
  tested locally and not run. See `docs/DEPLOY.md`.

## The test to apply

Does it make the demo — pay koha → pool ticks up → splits on-chain — more
likely to work on stage? If not, it is scope creep, however good the idea is.
