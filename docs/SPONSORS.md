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
| **New Money — Digital NZD** | 🟡 partial | Rail is token-agnostic, but dNZD has no EIP-3009 so x402 cannot settle it (`docs/DNZD.md`) | Run the **pool + split** in dNZD; koha still settles in USDC |
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

**Frictionless identity creation is the "intuitive + secure" half of the pitch.**
Privy's "automatically create embedded wallets on login" means a user logs in
with an email and *instantly* has a self-custodial Avalanche wallet — no seed
phrase, no personal data handed over, no crypto knowledge required. That single
setting is what makes the identity both secure (self-custodial, on Avalanche)
and intuitive (feels like a normal email signup). The wallet is created for them;
they never see key management. That is the "modern, secure, intuitive digital
identity" the Lumin identity track is asking for.

## Where to spend today

1. **Avalanche + Overall** — the live loop. Two biggest prizes, one demo.
2. **Kiwiana** — mostly framing around koha; already true. Near-free.
3. **Lumin identity** — make the "one identity, no PII" value prop explicit in
   the UI (cheap) + AccessPass credential (real but small).
4. **dNZD** — no longer a config change. The token is live on Fuji and inspected
   (`docs/DNZD.md`): 6 dp, EIP-712 `{dNZD, 1}`, ERC-2612 permit, but **no
   EIP-3009**, so koha cannot settle in it over x402. What is still cheap: deploy
   the pool in dNZD and do the **on-chain split** in dNZD, which is a real
   "settles in NZD" demo, and ask New Money whether they will add EIP-3009 (the
   token is a UUPS proxy, so they can without changing the address).
5. **Skip** FireEyes governance unless finished early.

## The demo that covers the most tracks at once

Pay koha with your wallet (identity + payment, no signup) → pool ticks up on
Avalanche → splits on-chain by usage → one product pays another. That single
narrative lights up Avalanche, Overall, Kiwiana, and both Lumin tracks. Don't
fragment it per-sponsor.
