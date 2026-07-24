# Suiteas development setup

This file is the complete pre-coding setup checklist for Suiteas.

It is intentionally limited to environment preparation, dependency installation, account configuration, test funds, and verification. **Do not implement features, alter product behaviour, deploy contracts, or redesign the UI while completing this setup.**

## Codex goal

Use this instruction from the repository root:

```text
/goal Follow SETUP.md and prepare this repository for development. Complete every safe, automatable setup and verification step. Do not implement features or deploy contracts. Preserve existing source files. Skip steps that are already complete, never invent credentials, never expose secrets, and stop with a READY or BLOCKED report containing the exact checks run and any remaining human actions.
```

## Completion standard

Setup is **READY** only when:

- the repository is clean and synced;
- Node.js, pnpm, Foundry, Forge, Cast, Git, and Codex are available;
- all workspace dependencies are installed;
- `forge-std` is installed for contract tests;
- contract tests pass;
- TypeScript checks pass;
- the production web build passes;
- the local environment file exists in the correct app directory;
- required public configuration is present;
- missing secrets, accounts, allowed origins, wallets, or faucet funds are listed clearly as human actions;
- no feature code has been added or changed.

A missing human-owned credential or faucet balance should produce **BLOCKED**, not a guessed value.

---

## 1. Read the repository instructions

Before changing anything, read:

```text
AGENTS.md
CLAUDE.md
docs/HANDOFF.md
docs/SPONSORS.md
docs/CONTRACTS.md
ARCHITECTURE.md
```

Important constraints:

- Avalanche Fuji only: chain ID `43113`.
- Never use mainnet or real funds.
- Never commit or print secrets or private keys.
- Never hardcode a contract address; use `packages/shared/src/addresses.json`.
- Never add a custom deposit or payment function; x402 sends funds to `payTo`.
- `NEXT_PUBLIC_PREVIEW_MOCK=1` is for local design previews only and must never be enabled in production.
- Do not edit UI/design files during backend setup.

---

## 2. Confirm repository state

From the repository root:

```bash
git status
git branch --show-current
git remote -v
git pull --ff-only origin main
```

Expected state:

- branch: `main`;
- working tree: clean;
- local branch: up to date with `origin/main`.

Do not discard, reset, stash, or overwrite uncommitted user work. If the tree is not clean, stop and report the changed paths.

---

## 3. Verify the local toolchain

Required versions:

- Node.js `>=22`;
- pnpm `10.33.0` as declared in `package.json`;
- Foundry with `forge`, `cast`, and `anvil`;
- Git;
- Codex CLI.

Run:

```bash
node -v
npm -v
pnpm -v
forge --version
cast --version
anvil --version
git --version
codex --version
```

### Install only what is missing

#### pnpm

```bash
npm install -g pnpm@10.33.0
```

Do not upgrade the repository to pnpm 11 during the hackathon.

#### Foundry on macOS or Linux

```bash
curl -L https://foundry.paradigm.xyz | bash
```

Reload the shell using the instruction printed by the installer. On zsh this is usually:

```bash
source ~/.zshenv
```

Then install the Foundry tools:

```bash
foundryup
```

If Foundry reports that `libusb` is missing on macOS and hardware-wallet support is needed:

```bash
brew install libusb
```

Do not install Homebrew or `libusb` unless the warning is relevant or a hardware wallet actually requires it.

#### Codex CLI

```bash
npm install -g @openai/codex
codex --version
```

Authentication is a human-owned step. Never request, store, or print an OpenAI credential in the repository.

---

## 4. Install repository dependencies

From the repository root:

```bash
pnpm install
```

This installs all pnpm workspace projects, including `apps/web`, `packages/shared`, and `contracts`.

The pnpm warning about ignored optional dependency build scripts is not automatically a failure. Do not run `pnpm approve-builds` unless a later build or test specifically fails because one of those scripts was blocked.

### Install the Foundry test library

Check whether this directory exists:

```text
contracts/lib/forge-std
```

If it does not exist:

```bash
cd contracts
forge install foundry-rs/forge-std
cd ..
```

Do not reinstall it when it is already present.

---

## 5. Create the local environment file

The Next.js app runs from `apps/web`, so its local environment file belongs here:

```text
apps/web/.env.local
```

If it does not exist, create it from the repository template:

```bash
cp .env.example apps/web/.env.local
```

Never commit `apps/web/.env.local`.

Use this checklist when filling it:

```dotenv
# Public Privy application identifier
NEXT_PUBLIC_PRIVY_APP_ID=

# Avalanche Fuji only
NEXT_PUBLIC_CHAIN_ID=43113

# Optional; the public Fuji RPC is used when blank
NEXT_PUBLIC_FUJI_RPC_URL=

# Optional for WalletConnect/Core mobile
NEXT_PUBLIC_WALLETCONNECT_ID=

# Before Suite is deployed, this may be a test recipient wallet.
# After deployment, this must be the deployed Suite address.
X402_PAY_TO=

# Required for real Fuji x402 settlement
X402_FACILITATOR_URL=

# Server secret, only when required by the chosen facilitator
THIRDWEB_SECRET_KEY=

# Default metered smoke-test price
X402_PRICE=$0.01
```

Rules:

- Preserve `NEXT_PUBLIC_CHAIN_ID=43113`.
- Never put a private wallet key in this file unless a later, reviewed server-side workflow explicitly requires it.
- Never put any secret in a `NEXT_PUBLIC_*` variable.
- Do not copy placeholder or zero contract addresses into configuration as though they were deployed contracts.
- Do not enable `NEXT_PUBLIC_PREVIEW_MOCK` in Vercel production.

Codex may create the ignored file and preserve placeholders, but it must not invent missing values.

---

## 6. Human-owned accounts and configuration

Codex should verify what can be verified locally and report the rest as human actions.

### Privy

Required:

- an active Privy application;
- `NEXT_PUBLIC_PRIVY_APP_ID` in `apps/web/.env.local` and Vercel;
- `http://localhost:3000` in the app's allowed origins;
- the live Vercel URL in the app's allowed origins;
- email login enabled;
- embedded wallets created for users without wallets;
- Avalanche Fuji configured as the supported/default chain.

Do not create a custom login form.

### thirdweb / x402 facilitator

Required before live payment testing:

- a thirdweb account;
- the current Fuji-compatible facilitator URL;
- a thirdweb secret key only if the facilitator requires authentication;
- the same server-only values configured in `apps/web/.env.local` and Vercel.

Do not commit the facilitator secret.

### Vercel

Required:

- the GitHub repository connected to the existing Vercel project;
- production branch set to `main`;
- the web app configured with `apps/web` as the application root if the existing project requires it;
- required environment variables present;
- preview mock disabled in production.

Do not create a second Vercel project unless the existing deployment cannot be recovered.

### WalletConnect

Optional for initial email-login testing. Required only for WalletConnect/Core mobile:

- WalletConnect project ID;
- `NEXT_PUBLIC_WALLETCONNECT_ID` in local and Vercel environments.

### Supabase

Supabase is not wired into the current code and is **not required to begin coding**. Do not create schemas or add Supabase code during setup. Record it as a later integration task.

---

## 7. Prepare Avalanche Fuji wallets and test funds

Use testnet assets only.

Required wallets:

1. **Owner/oracle wallet** — later deploys and owns `Suite` and `AccessPass`, and calls `distribute`.
2. **Demo user wallet** — signs x402 payments during the demo.
3. **Member recipient wallets** — may initially be controlled test addresses for the distribution demo.

Required balances:

- Owner/oracle wallet: enough Fuji AVAX for contract deployment and owner transactions.
- Demo user wallet: Fuji test USDC for x402 payments; a small Fuji AVAX balance is also useful for diagnostics even though the intended x402 path is gasless for the user.
- Member wallets: no starting balance is required, but their addresses must be recorded outside source code until the demo configuration is reviewed.

Verified Fuji USDC address:

```text
0x5425890298aed601595a70AB815c96711a31Bc65
```

Security rules:

- Never paste a seed phrase or raw private key into chat, source files, Markdown, shell history, or Git.
- Prefer a dedicated test-only wallet.
- Contract deployment is not part of this setup goal.
- If wallet creation, faucet claims, or balance verification require human interaction, report the exact action and continue with unrelated checks.

---

## 8. Run the pre-coding verification suite

### Contract tests

From the repository root:

```bash
cd contracts
forge test -vvv
cd ..
```

All existing `Suite` and `AccessPass` tests must pass.

### TypeScript checks

```bash
pnpm typecheck
```

### Production build

```bash
pnpm build
```

Do not fix product behaviour or add features as part of setup. Small configuration or dependency corrections needed solely to make the documented toolchain run may be proposed, but they must be reported before changing tracked source files.

### Local web smoke test

Start the app:

```bash
pnpm dev
```

Verify:

- the app starts on `http://localhost:3000`;
- the landing page renders;
- Privy loads when the App ID and allowed origin are configured;
- email login opens;
- a wallet address appears after login;
- `/api/protected` returns HTTP `402` when called without payment;
- no secret appears in browser-visible output or logs.

Stop the development server after verification.

A full paid settlement is not required to mark the local code toolchain ready when facilitator credentials or test funds are still human-blocked. It must be listed as a blocker before live payment work begins.

---

## 9. Confirm Git safety after setup

Run:

```bash
git status --short
```

Expected tracked-file state: clean.

Acceptable untracked or ignored local setup state includes:

- `apps/web/.env.local`;
- generated Foundry cache/output directories already covered by `.gitignore`;
- installed dependencies.

Do not commit:

- `.env.local`;
- private keys or seed phrases;
- `node_modules`;
- Foundry build output, cache, or broadcast secrets;
- generated credentials;
- faucet information tied to private wallet material.

---

## 10. Required final report

When the setup goal ends, return exactly these sections:

```text
STATUS: READY | BLOCKED

COMPLETED
- tool and version checks
- dependency installation
- tests/builds run and their results
- local files created

HUMAN ACTIONS
- missing accounts, credentials, allowed origins, wallet setup, or faucet funds
- exact dashboard or wallet action needed
- omit this section only when none remain

NOT CHANGED
- confirm no feature code, contracts, UI, or product behaviour was changed

NEXT DEVELOPMENT STEP
- state the first coding task from docs/HANDOFF.md, but do not begin it
```

The expected first development step after setup is ready is to create and test the Foundry deployment script for `Suite` and `AccessPass`. Do not start that task during this setup goal.
