#!/usr/bin/env node
// Merge a Foundry deployment artifact into packages/shared/src/addresses.json —
// the one source of truth the app reads. Never hardcode an address in code.
//
//   pnpm addresses            # default chain 43113 (Fuji)
//   pnpm addresses -- 31337   # a local anvil rehearsal
//
// Reads  contracts/deployments/<chainId>.json  (written by script/Deploy.s.sol)
// Writes packages/shared/src/addresses.json    (other keys left untouched)
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const chainId = process.argv[2] ?? "43113";

// Foundry writes EIP-55 checksummed addresses, and viem throws on a bad
// checksum at runtime, so pass them through verbatim rather than re-deriving.
const ADDRESS = /^0x[0-9a-fA-F]{40}$/;

// Artifact key -> addresses.json key. SettlementToken is what koha settles in
// (Fuji USDC for now, dNZD later); USDC stays as its own entry so existing
// frontend reads keep working.
const KEYS = {
  Suite: "Suite",
  AccessPass: "AccessPass",
  KohaRecord: "KohaRecord",
  SettlementToken: "SettlementToken",
};

const artifactPath = resolve(root, `contracts/deployments/${chainId}.json`);
const addressesPath = resolve(root, "packages/shared/src/addresses.json");

let artifact;
try {
  artifact = JSON.parse(readFileSync(artifactPath, "utf8"));
} catch {
  console.error(`no deployment artifact at ${artifactPath}`);
  console.error("run the deploy script with --broadcast first (see docs/DEPLOY.md)");
  process.exit(1);
}

const addresses = JSON.parse(readFileSync(addressesPath, "utf8"));
const forChain = addresses[chainId] ?? {};

for (const [from, to] of Object.entries(KEYS)) {
  const value = artifact[from];
  if (value === undefined) continue;
  if (!ADDRESS.test(value)) {
    console.error(`artifact ${from} is not an address: ${value}`);
    process.exit(1);
  }
  if (forChain[to] !== value) {
    console.log(`${to.padEnd(16)} ${forChain[to] ?? "(unset)"} -> ${value}`);
  }
  forChain[to] = value;
}

addresses[chainId] = forChain;
writeFileSync(addressesPath, `${JSON.stringify(addresses, null, 2)}\n`);
console.log(`wrote packages/shared/src/addresses.json (chain ${chainId})`);
