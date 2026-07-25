# FLOWS — the four money flows

The core of the project. `ARCHITECTURE.md` summarises these; this file is the
detail plus **what is actually built**, so nobody demos a flow that isn't wired.

Currency in every flow is the **settlement token**: Fuji USDC today. New Money's
dNZD is the intended currency and works for flows 1/3/4, but **not for flow 2** —
it has no EIP-3009, so x402 cannot settle it (`docs/DNZD.md`). Chain is Avalanche
Fuji (43113) in all four.

| # | Flow | Status |
|---|---|---|
| 1 | User → Pool, subscribe (escrow-gated) | **not built** |
| 2 | User → Pool, micro-koha over x402 | **built** — unpaid 402 verified; live settlement blocked on a facilitator URL |
| 3 | Pool → Members, split by usage | **built + deployed to Fuji** — `Suite.distribute` + seeded usage script. Not yet run on Fuji: needs member recipient addresses and a non-zero pool |
| 4 | Member ↔ Member | **not built** — the differentiator |

---

## Flow 2 — User → Pool (micro-koha). The one that works.

The flow the demo is built around, because it needs no billing infrastructure.

```
User hits a paid member route (/api/protected)
   ↓  x402 middleware answers HTTP 402 + payment requirements
Client signs an EIP-3009 authorization (gasless — the facilitator sponsors gas)
   ↓  facilitator verifies, then settles on Fuji (~1s)
Settlement token lands in the Suite contract — the pool
   ↓
Handler runs and returns the resource
```

Code: `apps/web/app/api/protected/route.ts` (server, `withX402`),
`apps/web/lib/x402.ts` + `apps/web/lib/settlement.ts` (config),
`apps/web/components/contribute-button.tsx` (client, `x402-fetch`).

Two properties that are load-bearing rather than incidental:

- **`payTo` is the Suite contract.** The pool has no deposit function and needs
  none. x402 relays a plain ERC-20 transfer to `payTo`. See `docs/X402.md`.
- **Payment settles only after a <400 response**, so payment and delivery stay
  atomic — a failed request does not charge.

**Zero-amount koha.** Paying $0 must succeed: zero-payers still get access, which
is the thesis, not an edge case. Note where the invariant lives — a $0 koha is
not an x402 request at all (a 402 quote of zero has nothing to sign). It is the
*subscribe* path (flow 1) and the *split* (flow 3) that must tolerate zero, and
`Suite.distribute` does: a zero allocation transfers nothing and does not revert.
`X402_PRICE` is the per-call price a member charges, which is a separate thing
from what a user chooses to give.

## Flow 1 — User → Pool (subscribe, escrow-gated)

Not built. Intended shape from `ARCHITECTURE.md`: pay what you can (including
$0), funds held, access verified, AccessPass minted.

What exists towards it: `AccessPass.sol` (soulbound credential, `onlyOwner`
mint/burn) and the dashboard card that reads it. What does not exist: escrow, the
pay-what-you-can amount field, and any mint-on-contribute wiring. `AccessPass`
mint is owner-only, so today a pass is issued by the owner/oracle wallet, not by
the payment.

## Flow 3 — Pool → Members (the split)

The flow judges watch settle on-chain.

```
Member products accrue usage (off-chain, hand-seeded for the demo)
   ↓  contracts/script/usage.example.json — recipients + usage weights
UsageSplit.allocate computes pro-rata amounts by floor division
   ↓  total is re-checked against poolBalance() before broadcasting
Suite.distribute(recipients, amounts)  — onlyOwner, the oracle wallet
   ↓
Each member's wallet receives its share; the remainder stays pooled
```

Code: `contracts/src/Suite.sol`, `contracts/src/UsageSplit.sol`,
`contracts/script/Distribute.s.sol`. Run it per `docs/DEPLOY.md`.

Invariants, both tested:

- **No wei lost.** `sum(amounts) + remainder == distributable`, and `sum(amounts)`
  is never more than the pool. Floor division only; the dust carries to the next
  period rather than being stranded or over-spent.
- **Zero allocations succeed.** A member with no usage this period receives
  nothing without reverting. All-zero usage carries the whole pool forward.

Honest weak point, per `ARCHITECTURE.md`: metering is off-chain and posted by a
single oracle wallet. Say it before a judge finds it. The JSON input is
hand-seeded and disclosed, not hidden.

## Flow 4 — Member ↔ Member. The differentiator.

Not built. One member product calls another member's paid route and pays koha
over x402 — into the same pool, on the same rail. Nothing new is required on
the contract side: it is flow 2 with a member's server as the payer instead of a
person's browser.

Why it matters in the pitch: members are customers of each other, so the network
compounds from both sides. It is a two-sided economy, not a subscription box.

## What the pool cannot see

Worth understanding before proposing per-payment features. EIP-3009
`transferWithAuthorization` has no recipient callback, so `Suite` cannot observe
an individual koha payment: it sees only its own balance. Anything per-payer
(who gave, how often, giving history → `KohaRecord`) has to come from the x402
response, the facilitator, or an off-chain record — not from the pool contract.
