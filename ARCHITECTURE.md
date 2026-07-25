# ARCHITECTURE — Suiteas

## What we're building

A collective SaaS bundle. Users pay what they can — as micropayments, per use — into a shared pool. A smart contract splits that pool between member SaaS products by metered usage. Users get access to every member product for one contribution; members get access to every other member's customers, and can pay each other for services in the same currency.

**Suiteas** is the product. **Koha** is the payment mechanism inside it.

Blockchain is load-bearing in two places: the split has to be trustless or no SaaS will join a bundle a competitor operates, and per-call micropayments are not economically possible on card rails.

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Chain | **Avalanche Fuji** (testnet, chain ID 43113) | ~1s finality, ~$0.001 fees, native USDC, first-class x402 support, local ecosystem mentors |
| Payment rail | **x402** (HTTP 402) | Per-request micropayments, gasless for users via EIP-3009, no billing infra to build |
| x402 facilitator | PayAI (`facilitator.payai.network`) | Settles avalanche-fuji, no API key. thirdweb also works but wants a secret key on a paid-looking plan |
| Middleware | `x402-next` | Drops into Next.js route handlers |
| Currency | **Settlement token** — Fuji USDC today; dNZD intended but blocked for x402 (no EIP-3009, see `docs/DNZD.md`) | EIP-3009 path = gasless, no approval step. Configurable, not hardcoded — see `docs/X402.md` |
| Contracts | Solidity ^0.8.24 + Foundry | Three small contracts — x402 does the payment work. **Deployed + verified on Fuji**, see `docs/DEPLOY.md` |
| Web | Next.js 14 App Router + TypeScript | One framework for UI and API routes |
| Auth | Privy | Email → embedded Avalanche wallet, no seed phrase |
| Off-chain DB | Supabase | Usage attestations, member records, API keys |
| Deploy | Vercel | Zero config |

## Repo layout

```
suiteas/
├── AGENTS.md / CLAUDE.md      # agent lane instructions
├── SETUP.md ARCHITECTURE.md
├── docs/
│   ├── FLOWS.md               # the four money flows — read this first
│   ├── X402.md                # payment rail integration
│   ├── CONTRACTS.md
│   ├── AUTH.md
│   ├── SCOPE.md
│   └── DEPLOY.md              # deploy runbook + the switch to dNZD
├── contracts/                 # Foundry
│   ├── src/{Suite.sol,AccessPass.sol,KohaRecord.sol,UsageSplit.sol}
│   └── script/{Deploy.s.sol,Distribute.s.sol}
├── scripts/                   # export-abis / sync-addresses (pnpm abis|addresses)
├── packages/
│   ├── sdk/                   # embeddable widget, one script tag — not built
│   └── shared/                # ABIs, addresses, settlement token, types
└── apps/
    ├── web/                   # login, dashboard, explorer, modal, API
    └── demo-saas/             # member product embedding the SDK — not built
```

## The four money flows

Full detail in `docs/FLOWS.md`. Summary:

1. **User → Pool (subscribe)** — escrow-gated. Pay, funds held, access verified, AccessPass NFT minted.
2. **User → Pool (micro-koha)** — x402 per-request. Uses a member product, pays a few cents, settles in ~1s.
3. **Pool → Members (split)** — pro-rata by metered usage, permissionless settlement.
4. **Member ↔ Member (multidirectional)** — one SaaS calls another's API and pays x402 koha into the pool. The bundle is a two-sided economy, not a subscription box.

Flow 4 is the differentiator. Say it in the pitch: members are customers of each other, so the network compounds from both sides.

## Why x402 changes the design

Without x402 we would build a payment contract, a billing system, an approval flow, and a gas story. With x402 the payment rail is an HTTP header and a middleware. **The `payTo` address in the x402 config is our Suite contract**, so every micropayment lands in the pool automatically with no custom deposit function.

This is the single biggest scope reduction available to us. Do not build custom payment plumbing.

## Data flow

```
User signs up with email → Privy provisions embedded Avalanche wallet
        ↓
User hits a paid route in a member SaaS
        ↓ x402-next middleware returns 402 with payment requirements
Client signs EIP-3009 authorization (gasless — facilitator sponsors)
        ↓ facilitator verifies + settles on Fuji (~1s)
Settlement token lands in Suite contract (the pool)
        ↓
Member SaaS posts a signed usage attestation → Supabase
        ↓ at period close, oracle posts usage allocations on-chain
Suite.distribute(period) — callable by anyone — pays members pro-rata
        ↓
KohaRecord accrues (permanent), AccessPass stays live while subscribed
```

## Honest weak points — say these before a judge finds them

1. **Usage metering is off-chain**, posted by an oracle wallet. Centralised. Roadmap: multi-sig attestations → TEE → ZK usage proofs.
2. **The x402 facilitator is a trusted third party** for settlement sponsorship. Mitigated by the protocol design (facilitators cannot move funds outside agreed terms) but worth naming.
3. **Testnet only.** No real money touches this weekend.
4. **The pool is empty and the split has not run on Fuji.** The contracts are
   deployed and verified, but `Suite.poolBalance()` is 0 and `period` is 0 — one
   paid browser payment and a set of member recipient addresses are what stand
   between "deployed" and "demonstrated". Say that rather than implying the loop
   has already closed on-chain.
