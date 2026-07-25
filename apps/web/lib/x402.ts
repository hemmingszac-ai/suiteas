import type { Address } from "viem";
import type { Network, RouteConfig } from "x402-next";
import type { FacilitatorConfig } from "x402/types";
import { createThirdwebClient } from "thirdweb";
import { facilitator as thirdwebFacilitator } from "thirdweb/x402";
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
 * thirdweb's `facilitator()` (thirdweb/x402) returns an object compatible with
 * x402-next's FacilitatorConfig directly — no facilitator URL to hunt down. It
 * settles gaslessly (EIP-7702) using THIRDWEB_SERVER_WALLET_ADDRESS as the
 * sponsor, funded with Fuji AVAX for gas. Both env vars come from the thirdweb
 * dashboard (Settings -> API Keys for the secret key; Engine/server wallets for
 * the address). Undefined -> x402-next's default (x402.org, testnet-only,
 * likely not Fuji) — fine for exercising the 402 flow, not for a real
 * settlement.
 */
export function facilitatorConfig(): FacilitatorConfig | undefined {
  const secretKey = process.env.THIRDWEB_SECRET_KEY;
  const serverWalletAddress = process.env.THIRDWEB_SERVER_WALLET_ADDRESS;
  if (!secretKey || !serverWalletAddress) return undefined;
  const client = createThirdwebClient({ secretKey });
  return thirdwebFacilitator({ client, serverWalletAddress });
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
