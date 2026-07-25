import type { Address } from "viem";
import type { Network, Resource, RouteConfig } from "x402-next";
import type { FacilitatorConfig } from "x402/types";
import { getAddress } from "@suiteas/shared";
import { settlementPrice } from "./settlement";

/** The one network koha settles on. */
export const X402_NETWORK: Network = "avalanche-fuji";

/**
 * Where koha lands: the Suite pool contract — this address is the x402 `payTo`.
 * Never a custom deposit function; x402 transfers straight to this address.
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
 * API call, not the pay-what-you-can subscribe flow (that allows $0).
 *
 * The settlement token is configurable — see lib/settlement.ts. With no
 * settlement-token variables set this is "$0.01" in Fuji USDC, exactly as
 * before; with them set it quotes dNZD (or any EIP-3009 token) directly.
 */
export const KOHA_ROUTE: RouteConfig = {
  price: settlementPrice(),
  network: X402_NETWORK,
  config: {
    description: "A metered koha call — settles into the Suiteas pool.",
  },
};
