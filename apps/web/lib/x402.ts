import type { Address } from "viem";
import type { Network, Resource, RouteConfig } from "x402-next";
import type { FacilitatorConfig } from "x402/types";
import { getAddress } from "@suiteas/shared";

/** The one network koha settles on. x402 already knows Fuji USDC. */
export const X402_NETWORK: Network = "avalanche-fuji";

/**
 * Where koha lands: the Suite pool contract — this address is the x402 `payTo`.
 * Until the contract is deployed (addresses.json still zero), set X402_PAY_TO to
 * a dev wallet so the 402 flow can be smoke-tested end to end.
 */
export function payToAddress(): Address {
  const override = process.env.X402_PAY_TO;
  if (override) return override as Address;
  return getAddress("Suite"); // 0x000… until the deploy script writes addresses.json
}

/**
 * Facilitator that verifies + settles the payment.
 *
 * Undefined -> x402-next's default (x402.org, testnet). ARCHITECTURE.md picks the
 * thirdweb facilitator specifically because it settles Avalanche Fuji, so for a
 * real Fuji settlement set X402_FACILITATOR_URL to thirdweb's endpoint. If it
 * needs auth, extend this with `createAuthHeaders` using THIRDWEB_SECRET_KEY.
 */
export function facilitatorConfig(): FacilitatorConfig | undefined {
  const url = process.env.X402_FACILITATOR_URL;
  if (!url) return undefined;
  return { url: url as Resource };
}

/**
 * Per-request price for one metered koha call. This is a member charging for an
 * API call, not the pay-what-you-can subscribe flow (that allows $0). Override
 * with X402_PRICE.
 */
export const KOHA_ROUTE: RouteConfig = {
  price: process.env.X402_PRICE ?? "$0.01",
  network: X402_NETWORK,
  config: {
    description: "A metered koha call — settles USDC into the Suiteas pool.",
  },
};
