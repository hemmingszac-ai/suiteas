import type { Address } from "viem";
import type { ERC20TokenAmount, Price } from "x402/types";
import { getSettlementToken, type AuthorizationStandard } from "@suiteas/shared";

/**
 * Server-side settlement-token configuration for the x402 rail.
 *
 * The rail is token-agnostic: the exact-EVM scheme needs an address, decimals
 * and the token's EIP-712 domain, and nothing else. dNZD is the intended final
 * settlement currency; Fuji USDC is the fallback that proves the flow.
 *
 * Two modes:
 *
 *  1. **Fallback (no env set).** The price stays a money string ("$0.01") and
 *     x402 resolves the network's default asset — Fuji USDC. This is the
 *     current behaviour and it is what local testing uses.
 *
 *  2. **Explicit token (dNZD).** Set every X402_SETTLEMENT_TOKEN_* variable plus
 *     X402_PRICE_ATOMIC and the route quotes that token directly. Partial
 *     configuration is rejected loudly rather than silently falling back to
 *     USDC — settling in the wrong currency on stage is worse than a boot error.
 *
 * No dNZD values are guessed here. Every one of them is a human input, listed in
 * .env.example under "pending".
 *
 * Server-only: these are read from process.env with no NEXT_PUBLIC prefix, so
 * they never reach the browser bundle.
 */

const TOKEN_VARS = [
  "X402_SETTLEMENT_TOKEN_ADDRESS",
  "X402_SETTLEMENT_TOKEN_DECIMALS",
  "X402_SETTLEMENT_TOKEN_EIP712_NAME",
  "X402_SETTLEMENT_TOKEN_EIP712_VERSION",
  "X402_PRICE_ATOMIC",
] as const;

/**
 * x402's exact-EVM scheme relays EIP-3009 `transferWithAuthorization`, which is
 * also what makes the payment gasless. A token that does not implement EIP-3009
 * cannot settle over this rail — so the variable exists to be validated, not to
 * silently accept something the rail cannot honour.
 */
const SUPPORTED_AUTHORIZATION: readonly AuthorizationStandard[] = ["eip3009"];

const ADDRESS = /^0x[0-9a-fA-F]{40}$/;
const DIGITS = /^[0-9]+$/;

function env(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function fail(message: string): never {
  throw new Error(`x402 settlement config: ${message}`);
}

/** The authorisation standard the rail is configured to relay. */
export function authorizationStandard(): AuthorizationStandard {
  const configured = env("X402_SETTLEMENT_AUTHORIZATION") ?? getSettlementToken().authorization;
  if (!SUPPORTED_AUTHORIZATION.includes(configured as AuthorizationStandard)) {
    fail(
      `X402_SETTLEMENT_AUTHORIZATION="${configured}" is not supported. ` +
        `x402's exact-EVM scheme relays EIP-3009 transferWithAuthorization only ` +
        `(supported: ${SUPPORTED_AUTHORIZATION.join(", ")}). ` +
        `If the settlement token uses a different standard, the rail needs a new ` +
        `scheme — it is not a configuration change.`,
    );
  }
  return configured as AuthorizationStandard;
}

/**
 * The explicit ERC-20 price, or undefined when no token is configured (fallback
 * mode). Throws when the token is configured partially.
 */
function configuredTokenPrice(): ERC20TokenAmount | undefined {
  const present = TOKEN_VARS.filter((name) => env(name) !== undefined);
  if (present.length === 0) return undefined;
  if (present.length !== TOKEN_VARS.length) {
    const missing = TOKEN_VARS.filter((name) => env(name) === undefined);
    fail(
      `partially configured. Set all of ${TOKEN_VARS.join(", ")} or none of them. ` +
        `Missing: ${missing.join(", ")}.`,
    );
  }

  const address = env("X402_SETTLEMENT_TOKEN_ADDRESS") as string;
  if (!ADDRESS.test(address)) {
    fail(`X402_SETTLEMENT_TOKEN_ADDRESS="${address}" is not a 20-byte hex address.`);
  }

  const rawDecimals = env("X402_SETTLEMENT_TOKEN_DECIMALS") as string;
  const decimals = Number(rawDecimals);
  if (!DIGITS.test(rawDecimals) || !Number.isInteger(decimals) || decimals > 36) {
    fail(`X402_SETTLEMENT_TOKEN_DECIMALS="${rawDecimals}" must be an integer between 0 and 36.`);
  }

  // Atomic units, not dollars. A price is never converted across currencies
  // here: quoting dNZD from a USD figure would invent an exchange rate.
  const amount = env("X402_PRICE_ATOMIC") as string;
  if (!DIGITS.test(amount)) {
    fail(
      `X402_PRICE_ATOMIC="${amount}" must be a whole number of atomic units ` +
        `(the token's smallest unit), not a currency amount.`,
    );
  }

  authorizationStandard();

  return {
    amount,
    asset: {
      address: address as Address,
      decimals,
      eip712: {
        name: env("X402_SETTLEMENT_TOKEN_EIP712_NAME") as string,
        version: env("X402_SETTLEMENT_TOKEN_EIP712_VERSION") as string,
      },
    },
  };
}

/**
 * The price for one metered koha call, in whatever the rail settles in.
 * Falls back to the money-string price so local Fuji USDC testing is unchanged.
 */
export function settlementPrice(): Price {
  return configuredTokenPrice() ?? process.env.X402_PRICE ?? "$0.01";
}

/** One line for logs and docs — never includes a secret. */
export function settlementSummary(): string {
  const price = settlementPrice();
  if (typeof price === "string" || typeof price === "number") {
    const fallback = getSettlementToken();
    return `${price} in ${fallback.symbol} (x402 network default, ${fallback.status})`;
  }
  return `${price.amount} atomic units of ${price.asset.address} (${price.asset.decimals} dp)`;
}
