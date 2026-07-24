"use client";

import { useAccount, useReadContract } from "wagmi";
import { FUJI_CHAIN_ID, getAddress } from "@suiteas/shared";

const ZERO = "0x0000000000000000000000000000000000000000";

// Minimal ABI (const-typed for wagmi inference); full ABI in @suiteas/shared/abis.
const accessPassAbi = [
  {
    type: "function",
    name: "passOf",
    stateMutability: "view",
    inputs: [{ name: "holder", type: "address" }],
    outputs: [{ name: "tokenId", type: "uint256" }],
  },
] as const;

/**
 * The connected wallet's AccessPass. tokenId 0 / hasPass false = no pass yet.
 * Undefined until the AccessPass contract is deployed or while reading.
 */
export function useAccessPass(): { hasPass: boolean | undefined; tokenId: bigint | undefined } {
  const { address } = useAccount();
  const pass = getAddress("AccessPass");
  const enabled = pass.toLowerCase() !== ZERO && Boolean(address);

  const { data } = useReadContract({
    address: pass,
    abi: accessPassAbi,
    functionName: "passOf",
    args: address ? [address] : undefined,
    chainId: FUJI_CHAIN_ID,
    query: { enabled },
  });

  const tokenId = data as bigint | undefined;
  return { hasPass: tokenId === undefined ? undefined : tokenId > 0n, tokenId };
}
