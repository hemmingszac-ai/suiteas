import addressesJson from "./addresses.json";

/** Contracts we deploy + tokens we read. Keys match addresses.json. */
export type ContractName = "Suite" | "AccessPass" | "KohaRecord" | "USDC";

export type Address = `0x${string}`;

const addresses = addressesJson as Record<string, Record<ContractName, Address>>;

/** Avalanche Fuji. The only chain this project targets. */
export const FUJI_CHAIN_ID = 43113 as const;

/**
 * Resolve a deployed address. Never hardcode an address in a component —
 * the deploy script writes addresses.json and this reads it.
 */
export function getAddress(name: ContractName, chainId: number = FUJI_CHAIN_ID): Address {
  const forChain = addresses[String(chainId)];
  if (!forChain) throw new Error(`No addresses for chain ${chainId}`);
  const addr = forChain[name];
  if (!addr) throw new Error(`No address for ${name} on chain ${chainId}`);
  return addr;
}

export { addresses };
