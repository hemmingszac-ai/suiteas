# SETUP — do all of this BEFORE 5pm Friday

Two people, 36 hours. Every minute on account signup after 8pm Friday is stolen from building. Split this: one does accounts, the other does local installs. 45 minutes in parallel.

---

## A. Accounts and subscriptions

| Service | What for | Plan | Cost | Who |
|---|---|---|---|---|
| GitHub | Repo (`suiteas`), both devs push | Free | $0 | Dev A |
| **Privy** | Login + embedded Avalanche wallets | Free dev tier | $0 | Dev A |
| **thirdweb** | x402 facilitator — settles payments on Fuji | Free | $0 | Dev B |
| **Supabase** | Postgres for usage attestations + member keys | Free | $0 | Dev A |
| **Vercel** | Deploy web + demo app | Hobby | $0 | Dev A |
| Alchemy or Infura | Fuji RPC (or use the public Avalanche RPC) | Free | $0 | Dev B |
| Claude Code | Agent 1 | Pro or Max — Claude Code requires a paid plan, free claude.ai doesn't include it | Existing | Dev B |
| Codex | Agent 2 | Credits provided at the event — confirm at check-in | $0 | Dev B |

Grab and save: Privy App ID + App Secret, thirdweb Secret Key + server wallet address, Supabase URL + anon key + service role key.

## B. Avalanche Fuji — do this THURSDAY, not Friday night

This is the single most likely thing to block you.

1. Install Core or MetaMask, add **Avalanche Fuji** (chain ID **43113**)
2. **Fuji AVAX** from the Avalanche faucet — both dev wallets plus a demo user wallet
3. **Fuji testnet USDC** — this is separate from AVAX and people forget it
4. Confirm balances on all three wallets before kickoff

Faucets are rate-limited and slow. Doing this Friday at 9pm is how teams lose a night.

## C. Read before you arrive (30 min, Dev B)

The Avalanche Builder Hub has a full x402 course covering exactly this setup — network strings, facilitators, middleware. Skim it. Mentors at the event will likely know it, which makes them far more useful to you.

## D. Local installs (both machines)

```bash
node -v          # need 22+; nvm install 22 && nvm use 22
npm install -g pnpm

curl -L https://foundry.paradigm.xyz | bash && foundryup
forge --version

curl -fsSL https://claude.ai/install.sh | bash    # Anthropic's recommended installer
claude --version && claude                        # log in on first run

npm install -g @openai/codex
codex --version
```

Windows: use WSL2. Do not fight PowerShell at a hackathon.

## E. Bootstrap the repo

```bash
bash scripts/bootstrap.sh suiteas
cd suiteas
# copy the docs from this bundle into the repo (README, ARCHITECTURE, docs/*, CLAUDE.md, AGENTS.md)
cp .env.example .env.local     # fill in keys from section A
pnpm install
git remote add origin git@github.com:YOURNAME/suiteas.git
git push -u origin main
```

Add your teammate as a collaborator immediately so they're not blocked at 8pm.

## F. Smoke test before kickoff — all eight must pass

- [ ] `forge build` succeeds
- [ ] `pnpm dev` starts the web app
- [ ] Privy login modal opens, email sign-in works
- [ ] Wallet address appears after login
- [ ] Fuji AVAX **and** USDC visible on all three wallets
- [ ] **x402: a test route returns 402, a payment settles, USDC lands at `payTo`** ← the important one
- [ ] `claude` runs in the repo and reads CLAUDE.md
- [ ] `codex` runs in the repo and reads AGENTS.md

The x402 test is the one that matters. If it fails, you need to know Friday afternoon — not Saturday night. Budget 45 minutes; if thirdweb's facilitator is the problem, switch to another Avalanche facilitator rather than debugging.

## G. At 6pm Friday when themes drop

Do not touch the architecture. It's theme-agnostic. Only the **pitch framing** changes — see the theme map in `docs/SCOPE.md`. 15 minutes max, then build.
