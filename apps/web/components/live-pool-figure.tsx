"use client";

import { usePoolBalanceUsd } from "@/hooks/use-pool-balance";
import { MOCK_POOL_USD, PREVIEW_MOCK } from "@/lib/config/preview";
import { PoolFigure } from "./pool-figure";

/** Reads the live pool balance on-chain and renders the counter. */
export function LivePoolFigure() {
  const { usd } = usePoolBalanceUsd();
  return <PoolFigure usd={PREVIEW_MOCK ? MOCK_POOL_USD : usd} />;
}
