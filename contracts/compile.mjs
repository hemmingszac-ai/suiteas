// Compiles with solc-js since Foundry isn't installed on this machine (see
// docs/CONTRACTS.md — this repo has done solc-only verification before).
// Usage: node compile.mjs <ContractName> (e.g. AccessPass, Suite)
import solc from "solc";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contractName = process.argv[2];
if (!contractName) {
  console.error("Usage: node compile.mjs <ContractName>");
  process.exit(1);
}

const srcPath = `src/${contractName}.sol`;
const source = readFileSync(path.join(__dirname, srcPath), "utf8");

function findImport(importPath) {
  try {
    if (importPath.startsWith("@openzeppelin/contracts/")) {
      const resolved = path.join(__dirname, "node_modules", importPath);
      return { contents: readFileSync(resolved, "utf8") };
    }
    return { contents: readFileSync(path.join(__dirname, importPath), "utf8") };
  } catch (e) {
    return { error: `File not found: ${importPath}` };
  }
}

const input = {
  language: "Solidity",
  sources: { [srcPath]: { content: source } },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    evmVersion: "cancun", // OZ 5.1 uses mcopy; Avalanche C-Chain supports Cancun (Durango)
    outputSelection: {
      "*": { "*": ["abi", "evm.bytecode.object"] },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImport }));

const errors = (output.errors ?? []).filter((e) => e.severity === "error");
if (errors.length > 0) {
  for (const e of errors) console.error(e.formattedMessage);
  process.exit(1);
}
for (const w of (output.errors ?? []).filter((e) => e.severity === "warning")) {
  console.warn(w.formattedMessage);
}

const compiled = output.contracts[srcPath][contractName];
mkdirSync(path.join(__dirname, "out"), { recursive: true });
const artifact = {
  abi: compiled.abi,
  bytecode: "0x" + compiled.evm.bytecode.object,
};
const outPath = path.join(__dirname, "out", `${contractName}.json`);
writeFileSync(outPath, JSON.stringify(artifact, null, 2));
console.log(`Compiled ${contractName} -> ${outPath} (bytecode ${artifact.bytecode.length / 2 - 1} bytes)`);
