import type { PrivyClientConfig } from "@privy-io/react-auth";

/**
 * Login / wallet options, in the order shown to the user.
 * This is the single place to add or remove a login method.
 *
 * - `loginMethod` drives Privy's top-level `loginMethods` (email, google, ...).
 * - `wallet` entries drive Privy's `appearance.walletList`.
 *
 * Avalanche Core is the primary wallet. It injects as a browser wallet, so
 * "detected_wallets" surfaces it automatically; WalletConnect covers Core mobile.
 */

type WalletListEntry = NonNullable<
  NonNullable<PrivyClientConfig["appearance"]>["walletList"]
>[number];

type LoginMethod = NonNullable<PrivyClientConfig["loginMethods"]>[number];

export interface WalletOption {
  id: string;
  label: string;
  /** A non-wallet Privy login method (email, google, sms...). */
  loginMethod?: LoginMethod;
  /** A wallet entry for Privy's wallet list. */
  wallet?: WalletListEntry;
  enabled: boolean;
}

export const walletOptions: WalletOption[] = [
  // Hero path: email -> embedded Avalanche wallet, no seed phrase. Zero-payer
  // friendly and the fastest on-stage login.
  { id: "email", label: "Email", loginMethod: "email", enabled: true },
  // Primary wallet: Avalanche Core (detected as an injected wallet). Sponsor.
  { id: "core", label: "Avalanche Core", wallet: "detected_wallets", enabled: true },
  // Catch-all for every other wallet, incl. Core mobile.
  { id: "walletconnect", label: "WalletConnect", wallet: "wallet_connect", enabled: true },
  // Add a sponsor-specific wallet back ONLY if a prize track requires it, e.g.:
  // { id: "coinbase", label: "Coinbase Wallet", wallet: "coinbase_wallet", enabled: false },
];

const enabled = walletOptions.filter((o) => o.enabled);

/** Privy `loginMethods` derived from the config above. */
export const loginMethods: LoginMethod[] = Array.from(
  new Set([
    ...enabled.filter((o) => o.loginMethod).map((o) => o.loginMethod as LoginMethod),
    // If any wallet option is enabled, enable wallet login.
    ...(enabled.some((o) => o.wallet) ? (["wallet"] as LoginMethod[]) : []),
  ]),
);

/** Privy `appearance.walletList` derived from the config above. */
export const walletList: WalletListEntry[] = Array.from(
  new Set(enabled.filter((o) => o.wallet).map((o) => o.wallet as WalletListEntry)),
);
