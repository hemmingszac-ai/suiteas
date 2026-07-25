#!/usr/bin/env node
// Copy compiled ABIs from Foundry output into packages/shared so the frontend
// reads one canonical ABI per contract. Run after `forge build`.
//
//   pnpm abis
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CONTRACTS = ["Suite", "AccessPass", "KohaRecord"];

for (const name of CONTRACTS) {
  const artifactPath = resolve(root, `contracts/out/${name}.sol/${name}.json`);
  let artifact;
  try {
    artifact = JSON.parse(readFileSync(artifactPath, "utf8"));
  } catch {
    console.error(`missing artifact ${artifactPath} — run \`forge build\` in contracts/ first`);
    process.exit(1);
  }
  const out = resolve(root, `packages/shared/src/abis/${name}.json`);
  writeFileSync(out, `${JSON.stringify(artifact.abi, null, 2)}\n`);
  console.log(`abi  ${name} -> packages/shared/src/abis/${name}.json`);
}
