# CLAUDE.md

Suiteas — Web3NZ hackathon. 36 hours, two developers. Optimise for a working demo, not a maintainable codebase.

## Read first
- `docs/FLOWS.md` — the four money flows, this is the core of the project
- `docs/SCOPE.md` — what is explicitly out of scope
- `docs/CONTRACTS.md` — before any Solidity
- `docs/X402.md` — before any payment work
- `docs/AUTH.md` — before any auth work

## What we're building
A collective SaaS bundle. Users pay what they can as x402 micropayments into a shared pool. A contract splits it between member products by metered usage. Members also pay each other on the same rail. Suiteas is the product; koha is the payment mechanism.

## Division of labour with Codex
Claude Code owns: **contracts, tests, API routes, data layer, x402 server middleware.**
Codex owns: **frontend, modal, widget SDK, demo app, styling.**
Same repo, separate branches. Don't edit the other lane's files without saying so in the commit message.

## Rules
- TypeScript everywhere, `strict: true`. No `any` — at hackathon pace it costs more time than it saves.
- Solidity ^0.8.24. OpenZeppelin for anything standard. Never hand-roll ERC-721 or access control.
- **Never write a custom payment/deposit function.** x402 handles payment; `payTo` is the Suite contract. If you're writing `deposit()`, stop and re-read `docs/X402.md`.
- Chain is Avalanche Fuji (43113). Currency is Fuji USDC. Never mainnet.
- Never derive a user's wallet address from client input — always from the verified Privy token server-side.
- Contract addresses come from `packages/shared/src/addresses.json`, written by the deploy script. Never hardcode an address.
- Secrets in `.env.local` only. Never commit or log a key.
- Small commits, push often.

## Two invariants that must not break
1. **KohaRecord never burns.** AccessPass burns on lapse; the giving record is permanent. If both burned, a lapsed user loses their history and the portability pitch dies.
2. **Zero-amount contributions must succeed.** Zero-payers still get access. That's the thesis, not an edge case.

## Anti-scope
If asked to build something in the out-of-scope list in `docs/SCOPE.md`, say so and propose the smallest thing that serves the demo. Scope creep is the primary failure mode this weekend — pushing back is the most useful thing you can do.

## Testing
Only the tests listed in `docs/CONTRACTS.md`. The "no wei lost" invariant and "record survives an AccessPass burn" are the important ones. No frontend tests.

## Style
Terse. Working code and short explanations, not walkthroughs.
