import { NextResponse, type NextRequest } from "next/server";
import { withX402 } from "x402-next";
import type { RouteConfig } from "x402/types";
import { X402_NETWORK, facilitatorConfig, payToAddress } from "@/lib/x402";

export const runtime = "nodejs";

/**
 * Public, cross-origin koha resource for the embeddable SuiteasPayModal.
 * Unlike /api/protected (fixed price, same-origin dashboard use), this route
 * is meant to be called from arbitrary third-party HTML pages that dropped
 * the widget in, so price is per-request (amount/merchant query params) and
 * CORS is wide open — it's a public paid resource, not an authenticated one.
 */

const ALLOWED_ORIGIN = process.env.X402_WIDGET_ALLOWED_ORIGIN ?? "*";
const MIN_AMOUNT = 0.001;
const MAX_AMOUNT = 1000;

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, X-PAYMENT");
  res.headers.set("Access-Control-Expose-Headers", "X-PAYMENT-RESPONSE");
  return res;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

function clampAmount(raw: string | null): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < MIN_AMOUNT) return 0.01;
  return Math.min(n, MAX_AMOUNT);
}

async function routeConfig(request: NextRequest): Promise<RouteConfig> {
  const amount = clampAmount(request.nextUrl.searchParams.get("amount"));
  const merchant = request.nextUrl.searchParams.get("merchant") ?? "widget";
  return {
    price: `$${amount.toFixed(3)}`,
    network: X402_NETWORK,
    config: { description: `Koha payment for ${merchant}` },
  };
}

async function handler(request: NextRequest) {
  const merchant = request.nextUrl.searchParams.get("merchant") ?? "Suiteas";
  return NextResponse.json({
    ok: true,
    resource: "koha-widget-payment",
    merchant,
    note: "Payment settled into the Suiteas pool.",
  });
}

const paid = withX402(handler, payToAddress(), routeConfig, facilitatorConfig());

export async function GET(request: NextRequest) {
  return withCors(await paid(request));
}
