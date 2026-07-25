import { NextResponse, type NextRequest } from "next/server";
import { withX402 } from "x402-next";
import { KOHA_ROUTE, facilitatorConfig, payToAddress } from "@/lib/x402";

export const runtime = "nodejs";

/**
 * A paid "member API" endpoint. This is the x402 smoke test from SETUP.md:
 * an unpaid GET returns HTTP 402 with payment requirements; once the client
 * signs an EIP-3009 authorization, the facilitator settles USDC to the Suite
 * pool (payTo) and this handler runs. withX402 only settles AFTER a <400
 * response, so payment and delivery stay atomic.
 */
async function handler(_request: NextRequest) {
  // Reachable only after payment settled. This is where a real member would
  // record a usage attestation (Supabase) that later feeds Suite.distribute().
  return NextResponse.json({
    ok: true,
    resource: "premium-koha-content",
    note: "Payment settled into the Suite as pool.",
  });
}

export const GET = withX402(
  handler,
  payToAddress(),
  KOHA_ROUTE,
  facilitatorConfig(),
);
