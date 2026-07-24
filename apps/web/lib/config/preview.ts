/**
 * Preview/demo mock. When enabled, auth-gated screens render without a real
 * Privy login, using placeholder wallet + pool values. For local previews and
 * the stage-demo backup only — NEVER enable in production (it bypasses the auth
 * guard). Toggle with NEXT_PUBLIC_PREVIEW_MOCK=1.
 */
export const PREVIEW_MOCK = process.env.NEXT_PUBLIC_PREVIEW_MOCK === "1";

/** Fake connected wallet shown in preview mode. */
export const MOCK_ADDRESS = "0x1234AbCd5678Ef901234abcd5678eF901234AbCd";

/** Sample pool figure so the counter looks alive in preview mode. */
export const MOCK_POOL_USD = 1287.34;
