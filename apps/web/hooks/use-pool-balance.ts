"use client";

import { erc20Abi } from "viem";
import { useReadContract } from "wagmi";
import { FUJI_CHAIN_ID, getAddress, getSettlementToken } from "@suiteas/shared";

const ZERO = "0x0000000000000000000000000000000000000000";

/**
 * Live settlement-token balance of the Suite pool, as a display number. Polls
 * every 4s so the counter ticks up as koha settles. Returns undefined until the
 * Suite contract is deployed (addresses.json still zero) or while the first read
 * is in flight.
 *
 * Decimals come from the settlement config, not a hardcoded 6, because the
 * settlement token is not fixed. (Fuji USDC and dNZD are both 6 dp today.)
 */
export function usePoolBalanceUsd(): { usd: number | undefined; refetch: () => void } {
  const suite = getAddress("Suite");
  const token = getSettlementToken();
  const enabled = suite.toLowerCase() !== ZERO;

  const { data, refetch } = useReadContract({
    address: token.address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [suite],
    chainId: FUJI_CHAIN_ID,
    query: { enabled, refetchInterval: 4000 },
  });

  const usd = data === undefined ? undefined : Number(data) / 10 ** token.decimals;
  return { usd, refetch: () => void refetch() };
}
