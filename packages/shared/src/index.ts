import addressesJson from "./addresses.json";
import settlementJson from "./settlement.json";

/**
 * Contracts we deploy + tokens we read. Keys match addresses.json.
 *
 * `SettlementToken` is what koha settles in — dNZD in the end state, Fuji USDC
 * for now. `USDC` is kept as its own entry so it stays addressable while it is
 * the fallback; prefer SettlementToken in new code.
 */
export type ContractName =
  | "Suite"
  | "AccessPass"
  | "KohaRecord"
  | "SettlementToken"
  | "USDC"
  | "DNZD";

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
 * How a token authorises a gasless, signature-based transfer.
 *
 * Only `eip3009` can settle over x402: its exact-EVM scheme calls
 * `transferWithAuthorization` on the asset, which both moves the tokens and
 * verifies the signature in one transaction. `eip2612` is included because dNZD
 * implements it (verified on-chain) — but `permit` only grants an allowance, so
 * it still needs a second, gas-paying transaction and is NOT a substitute.
 * See docs/DNZD.md.
 */
export type AuthorizationStandard = "eip3009" | "eip2612";

/** The subset of standards the x402 rail can actually settle. */
export const X402_SETTLEABLE: readonly AuthorizationStandard[] = ["eip3009"];

/**
 * "fallback" = a stand-in for proving the flow. "live" = the real currency.
 * "pending" = verified on-chain but not usable on the rail yet.
 */
export type TokenStatus = "fallback" | "live" | "pending";

/** Everything about the settlement token except its address (see addresses.json). */
export interface SettlementTokenMeta {
  symbol: string;
  decimals: number;
  /** EIP-712 domain of the token contract — the payer signs against this. */
  eip712: { name: string; version: string };
  authorization: AuthorizationStandard;
  status: TokenStatus;
}

export interface SettlementToken extends SettlementTokenMeta {
  address: Address;
}

/**
 * A token verified on-chain but not settling yet, with the reason recorded.
 * dNZD is one: its metadata is confirmed, its EIP-3009 support is not there.
 */
export interface SettlementCandidate extends SettlementTokenMeta {
  chainId: number;
  address: Address;
  status: "pending";
  blocker: string;
}

interface SettlementFile {
  candidates?: Record<string, SettlementCandidate | undefined>;
  [chainId: string]: unknown;
}

const settlementFile = settlementJson as unknown as SettlementFile;
const settlement = settlementFile as unknown as Record<string, SettlementTokenMeta | undefined>;

/**
 * Tokens that have been inspected on-chain but cannot settle over the rail yet.
 * Read this before claiming a token is usable — `blocker` says why it is not.
 */
export function getSettlementCandidate(symbol: string): SettlementCandidate | undefined {
  return settlementFile.candidates?.[symbol];
}

/**
 * The token koha settles in, for reads and formatting. Never assume 6 decimals —
 * read them from here, since the settlement token is not fixed.
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
