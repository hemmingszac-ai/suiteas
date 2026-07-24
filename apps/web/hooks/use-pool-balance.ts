"use client";

import { erc20Abi } from "viem";
import { useReadContract } from "wagmi";
import { FUJI_CHAIN_ID, getAddress } from "@suiteas/shared";

const ZERO = "0x0000000000000000000000000000000000000000";

/**
 * Live USDC balance of the Suite pool, in USD. Polls every 4s so the counter
 * ticks up as koha settles. Returns undefined until the Suite contract is
 * deployed (addresses.json still zero) or while the first read is in flight.
 */
export function usePoolBalanceUsd(): { usd: number | undefined; refetch: () => void } {
  const suite = getAddress("Suite");
  const usdc = getAddress("USDC");
  const enabled = suite.toLowerCase() !== ZERO;

  const { data, refetch } = useReadContract({
    address: usdc,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [suite],
    chainId: FUJI_CHAIN_ID,
    query: { enabled, refetchInterval: 4000 },
  });

  const usd = data === undefined ? undefined : Number(data) / 1e6; // USDC is 6 dp
  return { usd, refetch: () => void refetch() };
}
