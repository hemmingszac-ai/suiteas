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

- **A KohaRecord UI.** The contract is **built and tested** (`docs/CONTRACTS.md`)
  and deploys with the others, so the giving record is readable on-chain — but
  nothing renders it. The ABI is in `packages/shared/src/abis/KohaRecord.json`
  and the address in `addresses.json`, so a card is a frontend-lane task, not a
  backend one. (`AGENTS.md`)
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

- **dNZD**: address, decimals and EIP-712 domain are now **confirmed on-chain**
  (`docs/DNZD.md`) and recorded in config. But it **does not implement EIP-3009**,
  so x402 cannot settle it — status stays pending. Unblocking it needs New Money
  to upgrade the token (it is a UUPS proxy, so they can without changing the
  address). **Writing an x402 scheme for ERC-2612 `permit` is out of scope** —
  that is protocol work, not configuration.
- ~~**x402 facilitator URL.**~~ **Resolved, not blocked.** PayAI
  (`https://facilitator.payai.network`) settles avalanche-fuji with no API key, so
  the paid thirdweb plan was never needed. Verified live — `docs/X402.md`. What
  remains is a paid click from a funded wallet, which needs a browser, not work.
- **Fuji deployment.** Owner wallet has AVAX; the deploy script is written,
  tested locally and not run. See `docs/DEPLOY.md`.

## The test to apply

Does it make the demo — pay koha → pool ticks up → splits on-chain — more
likely to work on stage? If not, it is scope creep, however good the idea is.
