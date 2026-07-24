import { avalancheFuji } from "viem/chains";

/**
 * The one chain this app targets. Fuji testnet — never mainnet.
 * Optionally override the RPC via NEXT_PUBLIC_FUJI_RPC_URL.
 */
export const chain = avalancheFuji;

export const rpcUrl =
  process.env.NEXT_PUBLIC_FUJI_RPC_URL || avalancheFuji.rpcUrls.default.http[0];
