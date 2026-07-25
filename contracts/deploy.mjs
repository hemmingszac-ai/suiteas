// Deploys a compiled contract to Avalanche Fuji and writes the address into
// packages/shared/src/addresses.json. No Foundry on this machine, so this
// uses viem directly against the artifact from compile.mjs.
//
// Usage: DEPLOYER_PRIVATE_KEY=0x... node deploy.mjs <ContractName> [ctorArg1 ctorArg2 ...]
// Example: DEPLOYER_PRIVATE_KEY=0x... node deploy.mjs AccessPass 0xOwnerAddress
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const contractName = process.argv[2];
const ctorArgs = process.argv.slice(3);
if (!contractName) {
  console.error("Usage: DEPLOYER_PRIVATE_KEY=0x... node deploy.mjs <ContractName> [ctorArgs...]");
  process.exit(1);
}

const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
if (!privateKey) {
  console.error("Set DEPLOYER_PRIVATE_KEY (a Fuji-funded wallet — this pays the deploy gas).");
  process.exit(1);
}

const FUJI_CHAIN_ID = 43_113;
const FUJI_RPC = process.env.FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc";
const fujiChain = {
  id: FUJI_CHAIN_ID,
  name: "Avalanche Fuji",
  nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
  rpcUrls: { default: { http: [FUJI_RPC] } },
};

const artifactPath = path.join(__dirname, "out", `${contractName}.json`);
const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));

const account = privateKeyToAccount(privateKey);
const publicClient = createPublicClient({ chain: fujiChain, transport: http(FUJI_RPC) });
const walletClient = createWalletClient({ account, chain: fujiChain, transport: http(FUJI_RPC) });

console.log(`Deploying ${contractName} from ${account.address} to Fuji...`);
console.log(`Constructor args: ${JSON.stringify(ctorArgs)}`);

const balance = await publicClient.getBalance({ address: account.address });
if (balance === 0n) {
  console.error(`Deployer ${account.address} has 0 AVAX on Fuji — fund it first (see SETUP.md faucets).`);
  process.exit(1);
}

const hash = await walletClient.deployContract({
  abi: artifact.abi,
  bytecode: artifact.bytecode,
  args: ctorArgs,
});
console.log(`Tx: https://testnet.snowtrace.io/tx/${hash}`);

const receipt = await publicClient.waitForTransactionReceipt({ hash });
if (!receipt.contractAddress) {
  console.error("No contract address in receipt — deployment failed.");
  process.exit(1);
}
console.log(`Deployed ${contractName} at ${receipt.contractAddress}`);

// Write into packages/shared/src/addresses.json
const addressesPath = path.join(__dirname, "..", "packages", "shared", "src", "addresses.json");
const addresses = JSON.parse(readFileSync(addressesPath, "utf8"));
addresses[String(FUJI_CHAIN_ID)][contractName] = receipt.contractAddress;
writeFileSync(addressesPath, JSON.stringify(addresses, null, 2) + "\n");
console.log(`Wrote ${contractName} address into ${addressesPath}`);
