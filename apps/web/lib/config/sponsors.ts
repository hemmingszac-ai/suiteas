/**
 * Sponsor + prize-track registry.
 *
 * The whole app is meant to be tailored to these. Keep this list honest:
 *  - status "confirmed": load-bearing in the repo docs / verified for this event.
 *  - status "likely":    sponsored a sibling Web3NZ event or strongly implied.
 *  - status "todo":      fill in from the event slides (prize deck).
 *
 * Editing this list is how you re-tailor the demo to the prizes. `walletFor`
 * and the dashboard read from here, so a sponsor added here surfaces in the UI.
 */

export type SponsorStatus = "confirmed" | "likely" | "todo";

export interface Sponsor {
  id: string;
  name: string;
  status: SponsorStatus;
  /** What they provide that we use. */
  tech: string;
  /** Prize-track name, if they run one. Fill from the slides. */
  track?: string;
  /** One line: how Suiteas already targets this track. */
  howWeHitIt: string;
  /** True if their tech is already core to the build (not bolt-on). */
  loadBearing: boolean;
  /** Optional wallet-option id (see wallets.ts) this sponsor maps to. */
  walletId?: string;
}

export const sponsors: Sponsor[] = [
  {
    id: "avalanche",
    name: "Avalanche",
    status: "confirmed",
    tech: "Fuji testnet (43113), Core wallet, ~1s finality",
    track: "Best on Avalanche",
    howWeHitIt:
      "Entire app runs on Fuji; Core is the primary wallet; sub-second settlement is the demo's money shot.",
    loadBearing: true,
    walletId: "core",
  },
  {
    id: "thirdweb",
    name: "thirdweb",
    status: "confirmed",
    tech: "x402 facilitator (x402-next middleware)",
    track: "x402 / agentic payments",
    howWeHitIt:
      "Koha IS x402 — per-request micropayments over HTTP 402. This is the core mechanic, not a feature.",
    loadBearing: true,
  },
  {
    id: "circle",
    name: "Circle",
    status: "confirmed",
    tech: "USDC (native Fuji USDC, EIP-3009 gasless)",
    track: "Best use of USDC / stablecoin payments",
    howWeHitIt:
      "Every payment settles in USDC; zero-amount contributions still mint access — stablecoin UX thesis.",
    loadBearing: true,
  },
  {
    id: "privy",
    name: "Privy",
    status: "confirmed",
    tech: "Email/social login -> embedded Avalanche wallet",
    track: "Best consumer UX / onboarding",
    howWeHitIt:
      "No-seed-phrase login; email users get an embedded wallet and can pay koha in under 3s.",
    loadBearing: true,
    walletId: "email",
  },
  {
    id: "base",
    name: "Base / Coinbase",
    status: "likely",
    tech: "Coinbase Wallet connector",
    track: "TODO — confirm from slides",
    howWeHitIt: "Coinbase Wallet is offered on the login screen.",
    loadBearing: false,
    walletId: "coinbase",
  },
  // TODO: add remaining sponsors + real prize tracks from the event slides.
  // Template:
  // { id: "", name: "", status: "todo", tech: "", track: "", howWeHitIt: "", loadBearing: false },
];

/** Sponsors whose tech is core to the build — lead with these in the pitch. */
export const loadBearingSponsors = sponsors.filter((s) => s.loadBearing);
