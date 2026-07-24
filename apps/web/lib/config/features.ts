/**
 * Feature flags. Flip a value to add or remove a feature across the app —
 * nav links and routes read from here, so nothing else needs touching.
 * Keep new-but-unbuilt features `false` so half-done work never ships.
 */
export const features = {
  login: true, // Privy login + wallet connect
  dashboard: true, // "manage everything" home once logged in
  topUp: false, // add funds to the pool (koha) — coming
  launchCoin: false, // launch/mint a token — coming
  explorer: false, // live pool + money-flow view — coming
} as const;

export type FeatureName = keyof typeof features;

export function isEnabled(name: FeatureName): boolean {
  return features[name];
}
