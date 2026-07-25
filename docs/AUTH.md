# AUTH

Read before any auth work. Auth is **Privy**. Never build a custom login form.

## The shape of it

Email → Privy provisions an embedded Avalanche wallet → the wallet is the
identity. No seed phrase, no personal details handed to any member product.
That is the Lumin identity pitch in `docs/SPONSORS.md`, and it is inherent to the
architecture rather than bolted on: **the payment and the identity are one act.**

## Where it lives

| File | Role |
|---|---|
| `apps/web/components/providers.tsx` | `PrivyProvider` config — the only place Privy is configured |
| `apps/web/lib/config/wallets.ts` | Login methods + wallet list, one editable registry |
| `apps/web/lib/wagmi.ts` | wagmi bridged to Privy (`@privy-io/wagmi`); Privy owns connectors |
| `apps/web/components/login-button.tsx`, `wallet-status.tsx` | `usePrivy()` UI |
| `apps/web/app/dashboard/page.tsx` | Client-side auth guard, redirects to `/` |

Config that matters, all in `providers.tsx`:

- `embeddedWallets: { createOnLogin: "users-without-wallets" }` — the setting the
  frictionless-identity pitch depends on. Log in with an email, instantly have a
  self-custodial Avalanche wallet.
- `defaultChain` / `supportedChains` — Fuji only.
- Missing `NEXT_PUBLIC_PRIVY_APP_ID` renders a visible error rather than a blank
  screen. Keep that behaviour.

To add or remove a login method, edit `lib/config/wallets.ts` — it derives both
`loginMethods` and `appearance.walletList`. Don't scatter Privy options.

## Server-side rule

**Never derive a user's wallet address from client input.** A body field, a query
param or a header claiming to be an address is not an identity — always take it
from the verified Privy access token, server-side.

Current state, stated plainly: **no route verifies a Privy token yet**, because
no route needs a user identity. `/api/protected` is gated by payment, not by
login — x402 authenticates the *payment*, and the payer address comes from the
signed authorization, not from the client's claim.

The first route that needs "who is this user" must verify the token server-side
(`@privy-io/server-auth`, not currently a dependency) and derive the address from
the verified claims. That is the moment to write it, not before.

## Privy dashboard — human-owned

Not configurable from this repo. Per `SETUP(1).md` §6:

- `NEXT_PUBLIC_PRIVY_APP_ID` set locally and in Vercel (public, safe to commit
  to env config — it is not a secret).
- `http://localhost:3000` **and** the live Vercel URL in allowed origins. Login
  silently fails from an origin that is not listed — this is the most common
  "Privy is broken" cause.
- Email login enabled; embedded wallets created for users without wallets;
  Avalanche Fuji as the supported/default chain.

## Preview mock — never in production

`NEXT_PUBLIC_PREVIEW_MOCK=1` renders auth-gated screens without a login, using a
placeholder wallet and pool figure (`lib/config/preview.ts`). It **bypasses the
auth guard**: for local design previews and a stage-demo backup only. It must be
off in Vercel production.
