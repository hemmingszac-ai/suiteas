# AGENTS.md

Suiteas — Web3NZ hackathon. 36 hours, two developers. Optimise for a working demo, not a maintainable codebase.

## Read first
- `docs/FLOWS.md` — the four money flows, this is the core of the project
- `docs/SCOPE.md` — what is explicitly out of scope
- `docs/AUTH.md` — before any auth work
- `docs/X402.md` — before any payment work

## What we're building
A collective SaaS bundle. Users pay what they can as x402 micropayments into a shared pool. A contract splits it between member products by metered usage. Members also pay each other on the same rail. Suiteas is the product; koha is the payment mechanism.

## Division of labour with Claude Code
Codex owns: **frontend, modal, widget SDK, demo app, styling.**
Claude Code owns: **contracts, tests, API routes, data layer, x402 server middleware.**
Same repo, separate branches. Don't edit the other lane's files without saying so in the commit message.

## Rules
- TypeScript everywhere, `strict: true`. No `any`.
- Next.js 14 App Router. Tailwind + shadcn/ui. Don't introduce another styling system.
- Auth is Privy (`@privy-io/react-auth`). Never build a custom login form. Never derive a wallet address from client input.
- Chain reads via viem + wagmi. Chain is Avalanche Fuji (43113).
- Contract addresses come from `packages/shared/src/addresses.json`. Never hardcode an address in a component.
- The SDK must load from one `<script>` tag, stay dependency-light, under 20kb.
- Secrets in `.env.local` only. Never commit or log a key.
- Small commits, push often.

## The modal is the product
Member sites embed one script tag and never touch funds. The modal (hosted iframe) must:
- Offer suggested amounts **plus a free-text field, with zero allowed and never blocked**
- Handle Privy login inline if there's no session
- Show the live pool figure — "your koha joins $X funding Y products"
- Show the minted AccessPass on success
- Complete in under 3 seconds, or the stage demo drags

## Design direction
Clean and confident, not crypto-garish. No neon gradients, no 3D coins. Think Stripe or Linear. It should look like a real product a SaaS founder would embed. The explorer page is the visual centrepiece — money visibly flowing is the money shot of the pitch, so make the pool counter tick up live.

## Anti-scope
If asked to build something in the out-of-scope list in `docs/SCOPE.md`, say so and propose the smallest thing that serves the demo. Scope creep is the primary failure mode this weekend.

## Testing
No frontend tests. Contract tests are Claude Code's lane.

## Style
Terse. Working code and short explanations, not walkthroughs.
