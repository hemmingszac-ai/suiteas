#!/usr/bin/env node
// Record deployed contract addresses into the two files that matter:
//
//   contracts/deployments/<chainId>.json   (Distribute.s.sol reads this)
//   packages/shared/src/addresses.json     (the app's source of truth)
//
//   pnpm addresses            # default chain 43113 (Fuji)
//   pnpm addresses -- 31337   # a local anvil rehearsal
//
// WHY THIS READS BROADCAST RECEIPTS AND NOT THE SCRIPT'S OUTPUT
// ------------------------------------------------------------
// Deploy.s.sol used to write deployments/<chainId>.json itself, from the
// addresses its own *simulation* produced. That is unsafe under `--resume`.
//
// On resume, forge re-runs the script to rebuild the transaction list, but the
// simulation starts from current on-chain state — where the sender's nonce has
// already advanced past the transactions that landed. CREATE addresses derive
// from the sender + nonce, so every `new Foo()` in the re-simulation predicts the
// address of the NEXT slot, and the whole record shifts.
//
// That happened on the 2026-07-25 Fuji deploy: the first attempt timed out after
// Suite was mined, the resumed run re-simulated from nonce 1, and the artifact
// was rewritten as Suite=<AccessPass's address>, AccessPass=<KohaRecord's
// address>, KohaRecord=<an address with no code at all>.
//
// That is not a cosmetic bug. X402_PAY_TO is the Suite address, so koha would
// have settled into the AccessPass contract — an ERC-721 with no way to move an
// ERC-20 out. The funds would have been unrecoverable.
//
// Broadcast receipts cannot shift: `contractAddress` in a receipt is what the
// chain actually created. So receipts are the source, and every address is
// checked for bytecode before it is written.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const chainId = process.argv[2] ?? "43113";

const ADDRESS = /^0x[0-9a-fA-F]{40}$/;
const ZERO = "0x0000000000000000000000000000000000000000";

// Contracts Deploy.s.sol creates, in the order it creates them. Anything else in
// the broadcast file is ignored rather than blindly recorded.
const DEPLOYED = ["Suite", "AccessPass", "KohaRecord"];

const die = (msg) => {
  console.error(`\n  ✗ ${msg}\n`);
  process.exit(1);
};

/** EIP-55 checksum via cast, so viem never throws on a bad-checksum address. */
const checksum = (addr) =>
  execFileSync("cast", ["to-check-sum-address", addr], { encoding: "utf8" }).trim();

function rpcUrl() {
  if (process.env.FUJI_RPC_URL) return process.env.FUJI_RPC_URL;
  const envFile = resolve(root, "contracts/.env");
  if (existsSync(envFile)) {
    const m = readFileSync(envFile, "utf8").match(/^FUJI_RPC_URL=(.+)$/m);
    if (m?.[1]?.trim()) return m[1].trim();
  }
  return chainId === "31337"
    ? "http://127.0.0.1:8545"
    : "https://api.avax-test.network/ext/bc/C/rpc";
}

async function rpc(method, params) {
  const res = await fetch(rpcUrl(), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const body = await res.json();
  if (body.error) throw new Error(`${method}: ${body.error.message}`);
  return body.result;
}

/**
 * Pair each CREATE transaction with its receipt by hash and take the address the
 * chain reported. A reverted or unmatched transaction is fatal, not skipped —
 * silently omitting one is how a stale address survives into the app.
 */
function fromBroadcast() {
  const path = resolve(root, `contracts/broadcast/Deploy.s.sol/${chainId}/run-latest.json`);
  if (!existsSync(path)) return null;

  const run = JSON.parse(readFileSync(path, "utf8"));
  const receipts = new Map((run.receipts ?? []).map((r) => [r.transactionHash, r]));
  const found = {};

  for (const tx of run.transactions ?? []) {
    if (tx.transactionType !== "CREATE") continue;
    if (!DEPLOYED.includes(tx.contractName)) continue;

    const receipt = receipts.get(tx.hash);
    if (!receipt) die(`${tx.contractName}: no receipt for ${tx.hash} — the deploy may still be in flight`);
    if (receipt.status !== "0x1") die(`${tx.contractName}: transaction ${tx.hash} reverted (status ${receipt.status})`);
    if (!ADDRESS.test(receipt.contractAddress ?? "")) die(`${tx.contractName}: receipt has no contractAddress`);

    found[tx.contractName] = checksum(receipt.contractAddress);
  }

  return Object.keys(found).length ? { source: path, addresses: found } : null;
}

/** Fall back to whatever is already recorded — e.g. a hand-corrected artifact. */
function fromExistingArtifact() {
  const path = resolve(root, `contracts/deployments/${chainId}.json`);
  if (!existsSync(path)) return null;
  const artifact = JSON.parse(readFileSync(path, "utf8"));
  const addresses = {};
  for (const name of DEPLOYED) {
    if (ADDRESS.test(artifact[name] ?? "")) addresses[name] = checksum(artifact[name]);
  }
  return Object.keys(addresses).length ? { source: path, addresses } : null;
}

const resolved = fromBroadcast() ?? fromExistingArtifact();
if (!resolved) {
  die(
    `no deployment found for chain ${chainId}\n` +
      `    looked for contracts/broadcast/Deploy.s.sol/${chainId}/run-latest.json\n` +
      `    and       contracts/deployments/${chainId}.json\n` +
      `    run the deploy with --broadcast first (see docs/DEPLOY.md)`,
  );
}

const { source, addresses: deployed } = resolved;
console.log(`source  ${source.replace(`${root}/`, "")}`);

const missing = DEPLOYED.filter((n) => !deployed[n]);
if (missing.length) die(`missing from the deployment record: ${missing.join(", ")}`);

// --- Guard 1: every address must actually be a contract on this chain. ---
// This is what would have caught the shifted record: the bogus KohaRecord
// address had no bytecode at all.
for (const [name, addr] of Object.entries(deployed)) {
  let code;
  try {
    code = await rpc("eth_getCode", [addr, "latest"]);
  } catch (err) {
    die(`could not reach ${rpcUrl()} to verify ${name}: ${err.message}`);
  }
  const bytes = (code.length - 2) / 2;
  if (bytes === 0) {
    die(
      `${name} ${addr} has NO BYTECODE on chain ${chainId}.\n` +
        `    Refusing to record an address that is not a contract. If a resumed\n` +
        `    deploy shifted the addresses, delete the bad artifact and re-run this\n` +
        `    against contracts/broadcast/.../run-latest.json.`,
    );
  }
  console.log(`code    ${name.padEnd(11)} ${addr}  ${bytes} bytes`);
}

// --- Guard 2: Suite must agree with itself. ---
// Reading settlementToken() off the deployed Suite is both a cross-check that
// the Suite slot really holds a Suite, and the authoritative source for the
// token address — better than trusting a constructor argument we recorded.
/** Decode an ABI-encoded address. Some RPCs answer a reverted call with "0x"
 *  instead of an error, so a short result must be rejected rather than sliced
 *  into a plausible-looking address. */
const abiAddress = (hex) => {
  if (typeof hex !== "string" || hex.length < 42) {
    throw new Error(`expected an ABI-encoded address, got ${JSON.stringify(hex)}`);
  }
  return checksum(`0x${hex.slice(-40)}`);
};
let settlementToken;
try {
  settlementToken = abiAddress(
    await rpc("eth_call", [{ to: deployed.Suite, data: "0x7b9e618d" }, "latest"]), // settlementToken()
  );
  const owner = abiAddress(await rpc("eth_call", [{ to: deployed.Suite, data: "0x8da5cb5b" }, "latest"])); // owner()
  if (settlementToken === ZERO) die(`Suite ${deployed.Suite} reports a zero settlement token`);
  if (owner === ZERO) die(`Suite ${deployed.Suite} reports a zero owner`);
  console.log(`suite   settlementToken=${settlementToken} owner=${owner}`);
} catch (err) {
  die(
    `Suite ${deployed.Suite} did not answer settlementToken()/owner(): ${err.message}\n` +
      `    That address is probably not a Suite — check for a shifted deployment record.`,
  );
}

// --- Write the deployment artifact (Distribute.s.sol reads this). ---
const artifactPath = resolve(root, `contracts/deployments/${chainId}.json`);
const artifact = { chainId: Number(chainId), ...deployed, SettlementToken: settlementToken };
writeFileSync(artifactPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`wrote   contracts/deployments/${chainId}.json`);

// --- Merge into the app's source of truth, leaving unrelated keys alone. ---
const addressesPath = resolve(root, "packages/shared/src/addresses.json");
const all = JSON.parse(readFileSync(addressesPath, "utf8"));
const forChain = all[chainId] ?? {};

for (const [name, addr] of Object.entries({ ...deployed, SettlementToken: settlementToken })) {
  if (forChain[name] !== addr) console.log(`  ${name.padEnd(16)} ${forChain[name] ?? "(unset)"} -> ${addr}`);
  forChain[name] = addr;
}

all[chainId] = forChain;
writeFileSync(addressesPath, `${JSON.stringify(all, null, 2)}\n`);
console.log(`wrote   packages/shared/src/addresses.json (chain ${chainId})`);
