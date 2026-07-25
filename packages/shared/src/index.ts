import addressesJson from "./addresses.json";
import settlementJson from "./settlement.json";

/**
 * Contracts we deploy + tokens we read. Keys match addresses.json.
 *
 * `SettlementToken` is what koha settles in — dNZD in the end state, Fuji USDC
 * for now. `USDC` is kept as its own entry so it stays addressable while it is
 * the fallback; prefer SettlementToken in new code.
 */
export type ContractName = "Suite" | "AccessPass" | "KohaRecord" | "SettlementToken" | "USDC";

export type Address = `0x${string}`;

const addresses = addressesJson as Record<string, Partial<Record<ContractName, Address>>>;

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

/**
 * The authorisation standard the x402 rail relays. Only EIP-3009
 * (`transferWithAuthorization`) is supported by x402's exact-EVM scheme, which
 * is also what makes koha gasless for the payer. dNZD must support it to settle
 * over x402 — that is an open question for New Money, not something to assume.
 */
export type AuthorizationStandard = "eip3009";

/** Everything about the settlement token except its address (see addresses.json). */
export interface SettlementTokenMeta {
  symbol: string;
  decimals: number;
  /** EIP-712 domain of the token contract — the payer signs against this. */
  eip712: { name: string; version: string };
  authorization: AuthorizationStandard;
  /** "fallback" = a stand-in for proving the flow. "live" = the real currency. */
  status: "fallback" | "live";
}

export interface SettlementToken extends SettlementTokenMeta {
  address: Address;
}

const settlement = settlementJson as unknown as Record<string, SettlementTokenMeta | undefined>;

/**
 * The token koha settles in, for reads and formatting. Never assume 6 decimals:
 * dNZD's decimals are not known yet, so read them from here.
 */
export function getSettlementToken(chainId: number = FUJI_CHAIN_ID): SettlementToken {
  const meta = settlement[String(chainId)];
  if (!meta) throw new Error(`No settlement token metadata for chain ${chainId}`);
  const forChain = addresses[String(chainId)];
  // SettlementToken is authoritative; USDC covers a config that predates it.
  const address = forChain?.SettlementToken ?? forChain?.USDC;
  if (!address) throw new Error(`No settlement token address for chain ${chainId}`);
  return { ...meta, address };
}

/** Atomic units -> a display number, using the settlement token's own decimals. */
export function fromSettlementUnits(atomic: bigint, chainId: number = FUJI_CHAIN_ID): number {
  const { decimals } = getSettlementToken(chainId);
  return Number(atomic) / 10 ** decimals;
}

export { addresses };
