# Suiteas

One subscription, every tool. Pay-what-you-can access to a bundle of indie SaaS products, with revenue split on-chain by usage.

**Suiteas** is the bundle. **Koha** is the payment mechanism inside it — micropayments over x402, settling on Avalanche in about a second.

Built at Web3NZ Hackathon, University of Canterbury, 24–26 July 2026.

## Live on Avalanche Fuji (43113)

| Contract | Address |
|---|---|
| `Suite` (the pool — this is the x402 `payTo`) | `0x9CFE88A4d8AEBF32F27dbBaaa335990dd70A2385` |
| `AccessPass` (soulbound membership, burns on lapse) | `0x1408C2174B1B2815b65F5f4f8beb71cdCcAF6d5f` |
| `KohaRecord` (permanent giving record, never burns) | `0x553FAC970312aDDBc1366eD6aa3A87F2cB29B477` |

Settling in Fuji USDC. Testnet only — never mainnet. Code reads these from
`packages/shared/src/addresses.json`; never hardcode one. Verification details and
the deploy runbook: `docs/DEPLOY.md`.

## Start here

| If you are... | Read |
|---|---|
| Setting up before the event | `SETUP.md` |
| Wondering what we're building | `ARCHITECTURE.md` |
| Wondering how money moves | `docs/FLOWS.md` ← start here, it's the core |
| Touching payments | `docs/X402.md` |
| Touching Solidity | `docs/CONTRACTS.md` |
| Touching login | `docs/AUTH.md` |
| About to add a feature | `docs/SCOPE.md` |
| An AI agent | `CLAUDE.md` (contracts/API) or `AGENTS.md` (frontend) |

## Quick start

```bash
bash scripts/bootstrap.sh suiteas
cd suiteas
cp .env.example .env.local     # fill in keys — see SETUP.md
pnpm install
pnpm contracts:test
pnpm dev
```

## The four flows

1. **Subscribe** — escrow-gated, mints a soulbound AccessPass that burns on lapse
2. **Micro-koha** — x402 per-request payment, lands in the pool, ~1s settlement
3. **Split** — pool distributed to members pro-rata by usage, permissionless settlement
4. **Member ↔ Member** — SaaS products pay each other on the same rail

Flow 4 is the differentiator. Members are customers of each other, so the network compounds from both sides.

## Stack

Avalanche Fuji · x402 (PayAI facilitator — settles Fuji, no API key) · Fuji USDC (dNZD intended; blocked for x402, see `docs/DNZD.md`) · Foundry · Next.js 14 · Privy · Supabase (not yet wired) · Vercel

## The demo we are protecting

A judge watches a user pay a few cents inside one SaaS, sees the pool tick up live, watches it split on-chain across four products, then sees one product pay another automatically. Every scope decision serves that.

## Working agreement

- Claude Code lane: contracts, tests, API routes, data layer
- Codex lane: frontend, modal, SDK, demo app, styling
- Separate branches, merge often
- Hard stop 1am both nights
- Backup demo video recorded by 11pm Saturday
- Code freeze 8am Sunday

## Not shipping this weekend

Mainnet, real money, fungible tokens, governance, mobile. See `docs/SCOPE.md`.
