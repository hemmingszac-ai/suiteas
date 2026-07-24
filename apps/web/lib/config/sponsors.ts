/**
 * Prize-track registry — what Suiteas is judged against at Web3NZ 2026.
 *
 * This is the source of truth for how the build maps to prizes. Editing it is
 * how we re-tailor the demo. `fit` is our honest current relevance; `todo` is
 * the smallest move to strengthen it.
 *
 * Amounts are filled where known. Sponsor-track $ amounts still need the slides.
 */

export type TrackFit =
  | "core" // the build IS this track
  | "strong" // strong, mostly framing/polish away
  | "partial" // half there; a real but small build closes it
  | "stretch" // off-thesis; only if we finish early
  | "meta"; // non-code (content, commit count)

export interface PrizeTrack {
  id: string;
  name: string;
  sponsor?: string;
  prize?: string;
  fit: TrackFit;
  /** How Suiteas targets it today. */
  howWeHitIt: string;
  /** Smallest move to strengthen / what's still missing. */
  todo?: string;
}

export const prizeTracks: PrizeTrack[] = [
  {
    id: "avalanche",
    name: "Avalanche C-Chain",
    sponsor: "Avalanche",
    fit: "core",
    howWeHitIt:
      "Entire app on Fuji (C-Chain): Core wallet, native USDC, Suite pool contract, x402 settlement in ~1s. The anchor track.",
  },
  {
    id: "overall",
    name: "Overall — 1st / 2nd / 3rd",
    prize: "$1300 / $650 / $400",
    fit: "strong",
    howWeHitIt:
      "x402 micropayments + trustless on-chain split + the koha story is differentiated and technically real.",
    todo: "Get the full loop working live: pay -> pool -> distribute() -> counter.",
  },
  {
    id: "kiwiana",
    name: "Cryptocurrency NZ / Kiwiana",
    sponsor: "Cryptocurrency NZ",
    fit: "strong",
    howWeHitIt:
      "'Koha' is te reo Māori — gift / reciprocity. Pay-what-you-can (incl. $0) into a collective bundle is a kiwiana thesis, already baked in.",
    todo: "Lean into it: framing, copy, te reo in the UI.",
  },
  {
    id: "lumin-identity",
    name: "Lumin — Digital Identity",
    sponsor: "Lumin",
    fit: "strong",
    howWeHitIt:
      "One wallet = one identity across every product in the bundle. You don't hand personal data to each SaaS — you log in with your Avalanche wallet (Privy email -> embedded wallet). Self-sovereign, pseudonymous, portable.",
    todo: "Make the AccessPass the on-chain membership credential; optionally add a verifiable-credential/attestation layer to go deeper than sign-in-with-wallet.",
  },
  {
    id: "lumin-payments-identity",
    name: "Lumin — Payments + Identity",
    sponsor: "Lumin",
    fit: "strong",
    howWeHitIt:
      "Payments (x402/USDC) and identity (wallet-as-login, no PII shared) in one flow: your identity authorises the payment, the payment grants access — no signup form, no data handed over.",
    todo: "Tie the AccessPass credential to the payment so identity + payment are visibly one act.",
  },
  {
    id: "dnzd",
    name: "New Money — Digital NZD",
    sponsor: "(Digital NZD sponsor)",
    fit: "partial",
    howWeHitIt:
      "The x402 rail is token-agnostic — koha can settle in a NZD stablecoin instead of / alongside USDC.",
    todo: "Point the x402 asset at the DNZD Fuji test token (config change). Need its address.",
  },
  {
    id: "fireeyes",
    name: "FireEyes — Governance",
    sponsor: "FireEyes",
    fit: "stretch",
    howWeHitIt:
      "Not a governance project. Weak angle: member governance over split parameters / the oracle wallet.",
    todo: "Skip unless we finish early — pulls against the thesis.",
  },
  {
    id: "content",
    name: "Best content creation",
    prize: "$200",
    fit: "meta",
    howWeHitIt: "Non-code. Demo video of the money-shot + write-up; docs are strong source material.",
  },
  {
    id: "commits",
    name: "Most commits",
    prize: "$200",
    fit: "meta",
    howWeHitIt: "Small, frequent commits (already our style per CLAUDE.md). Don't sacrifice quality to game it.",
  },
];

/** Tracks the build already nails or is close on — lead with these. */
export const winnableTracks = prizeTracks.filter((t) =>
  ["core", "strong"].includes(t.fit),
);
