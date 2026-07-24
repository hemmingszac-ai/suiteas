# SPONSORS — prize alignment strategy

**Status: partial.** Built from confirmed sponsors (repo docs + research). The
prize-track names/amounts and any sponsor not listed below must be filled from
the event slides. Source of truth in code: `apps/web/lib/config/sponsors.ts`.

Event: Web3NZ Hackathon, University of Canterbury, 24–27 July 2026. 48h, **$25k+ prizes**.

---

## What we know vs. what we need

| Known | Source |
|---|---|
| Chain = Avalanche Fuji; Core is the primary wallet | `ARCHITECTURE.md`, `SETUP.md` |
| x402 rail via thirdweb facilitator | `ARCHITECTURE.md`, `docs/X402.md` |
| USDC (Circle) is the settlement currency | `ARCHITECTURE.md` |
| Privy for login + embedded wallets | `AGENTS.md`, `SETUP.md` |
| $25k+ prizes, UC Crypto Society DAO | web3nz.xyz, cryptocurrency.org.nz |
| Sibling 2025 event ran Base / ETHGlobal / Easy Crypto | UoA news, Easy Crypto |

**Still needed from the slides (the only real blocker):**
1. Exact prize-track names + $ amounts.
2. Full sponsor list (esp. any wallet / infra / stablecoin / RWA / AI sponsor).
3. Any "must integrate X to qualify for track Y" rules.

Drop these into `sponsors.ts` and this doc updates in minutes.

---

## Sponsor → architecture → prize map

The thesis: **Suiteas is already unusually well-aligned.** x402 micropayments +
on-chain revenue split + embedded-wallet onboarding hits the four load-bearing
sponsors *by construction*, not by bolting on integrations.

| Sponsor | Their tech | How we hit their track | Strength |
|---|---|---|---|
| **Avalanche** | Fuji, Core, ~1s finality | Whole app on Fuji; Core primary; live pool tick-up is the demo | ⭐⭐⭐ core |
| **thirdweb / x402** | HTTP 402 facilitator | Koha *is* x402 per-request payment — the core mechanic | ⭐⭐⭐ core |
| **Circle** | USDC, EIP-3009 gasless | Every payment settles USDC; zero-amount still works | ⭐⭐⭐ core |
| **Privy** | Email → embedded wallet | No-seed onboarding; pay in <3s | ⭐⭐⭐ core |
| **Base/Coinbase** | Coinbase Wallet | Offered on login screen | ⭐ bolt-on |
| _(from slides)_ | — | — | fill in |

If a sponsor on the slides isn't covered here, that's the gap list to close.

---

## Where the build is already strong

The four money flows (`docs/FLOWS.md`) map cleanly onto sponsor tech:

1. **Subscribe** (escrow + AccessPass NFT) → Avalanche contracts.
2. **Micro-koha** (x402 per request) → thirdweb + Circle. **This is the wow.**
3. **Split** (pool → members pro-rata) → Avalanche, permissionless.
4. **Member ↔ member** (SaaS pay each other) → x402 again — the differentiator.

The demo the README protects — pay a few cents, pool ticks up, splits on-chain,
one product pays another — is a **single narrative that lights up 4 sponsors at
once**. That's the winning structure; don't fragment it into per-sponsor demos.

## Where to add, in priority order (36h)

Tailored so each build step banks another track. Adjust once slides land.

1. **x402 test route returns 402 → settles USDC at `payTo`** (the Suite contract).
   This one integration proves Avalanche + thirdweb + Circle simultaneously.
   Highest ROI. (Smoke-test item F in `SETUP.md`.)
2. **Login + embedded wallet** (done — scaffolded) → banks Privy.
3. **Live pool counter / explorer** → the visual that sells the Avalanche track.
4. **Split settlement on-chain** → completes the Avalanche + Circle story.
5. **Member→member call** → the differentiator; strongest single "flow 4" moment.
6. Only then: any sponsor-specific bolt-on a track *requires* (from slides).

Everything past step 5 is optional and gated behind `features.ts` flags so it
can be cut without touching the core demo.

## Anti-scope reminder

Per `docs/SCOPE.md`: no mainnet, no real money, no fungible token unless a prize
track explicitly rewards a launch. "Top up" and "launch coin" are `features.ts`
flags kept `false` until a track justifies them — don't build them on spec.
