# SPONSORS — prize-track strategy

How Suiteas maps to the Web3NZ 2026 prize tracks. Source of truth in code:
`apps/web/lib/config/sponsors.ts`. Event: UC, 24–27 July 2026, $25k+ prizes.

**Still needed from the slides:** exact $ for the sponsor tracks (Avalanche,
Lumin, FireEyes, CryptoNZ, DNZD) and the FireEyes/Lumin judging criteria. The
FireEyes (governance) and Lumin (digital identity / verifiable credentials)
reads below are grounded in web research, not the deck — confirm against it.

Known amounts: Overall 1st/2nd/3rd = **$1300 / $650 / $400**; Best content and
Most commits = **$200** each.

---

## Relevance matrix

| Track | Fit | Why | Smallest move |
|---|---|---|---|
| **Avalanche C-Chain** | 🟢 core | The whole build is this — Fuji, Core, USDC, Suite, x402, ~1s | Nothing; make the split shine. **Anchor.** |
| **Overall 1/2/3** | 🟢 strong | x402 + on-chain split + koha is differentiated + real | Get the loop working live |
| **CryptoNZ / Kiwiana** | 🟢 strong | **"Koha" is te reo Māori** — gift/reciprocity; $0-included | Framing, copy, te reo in UI |
| **Lumin — Digital Identity** | 🟢 strong | One wallet = one identity across the bundle; no PII handed to each SaaS. Self-sovereign login | AccessPass as credential; optional attestation layer |
| **Lumin — Payments + Identity** | 🟢 strong | Identity authorises the payment; payment grants access — one act, no signup form | Tie AccessPass to the payment |
| **New Money — Digital NZD** | 🟡 partial | Rail is token-agnostic; koha can settle in NZD | Point x402 asset at DNZD token (need address) |
| **FireEyes — Governance** | 🔴 stretch | Not a governance project | Skip unless early |
| **Best content** ($200) | ⚪ meta | Non-code | Demo video + write-up |
| **Most commits** ($200) | ⚪ meta | Already small/frequent | Keep committing |

## The identity thesis (why Lumin is a real fit, not a stretch)

The default web2 SaaS bundle makes you hand your personal details to every
product you sign up for. Suiteas inverts that: **your Avalanche wallet is your
one identity for the whole bundle.** Privy turns an email into an embedded
wallet (no seed phrase, no PII to the member products); you log in with the
wallet; the AccessPass NFT is your membership credential. You pay-what-you-can
and get access to every product **without giving your identity away N times.**

That is a digital-identity story — pseudonymous, portable, user-controlled — and
it's inherent to the architecture, not bolted on. To go deeper than
sign-in-with-wallet (toward Lumin's verifiable-credentials world), the AccessPass
can carry attestations later. Payments + identity are the same act here, which
is exactly the "Payments + Identity" track.

## Where to spend today

1. **Avalanche + Overall** — the live loop. Two biggest prizes, one demo.
2. **Kiwiana** — mostly framing around koha; already true. Near-free.
3. **Lumin identity** — make the "one identity, no PII" value prop explicit in
   the UI (cheap) + AccessPass credential (real but small).
4. **DNZD** — ~1hr config change *if* the token exists on Fuji. Best ROI add.
5. **Skip** FireEyes governance unless finished early.

## The demo that covers the most tracks at once

Pay koha with your wallet (identity + payment, no signup) → pool ticks up on
Avalanche → splits on-chain by usage → one product pays another. That single
narrative lights up Avalanche, Overall, Kiwiana, and both Lumin tracks. Don't
fragment it per-sponsor.
