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
  // Primary: Avalanche Core (detected as an injected wallet).
  { id: "core", label: "Avalanche Core", wallet: "detected_wallets", enabled: true },
  // Email -> embedded Avalanche wallet, no seed phrase. Zero-payer friendly.
  { id: "email", label: "Email", loginMethod: "email", enabled: true },
  { id: "metamask", label: "MetaMask", wallet: "metamask", enabled: true },
  { id: "walletconnect", label: "WalletConnect", wallet: "wallet_connect", enabled: true },
  { id: "coinbase", label: "Coinbase Wallet", wallet: "coinbase_wallet", enabled: true },
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
