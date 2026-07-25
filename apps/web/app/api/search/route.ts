import { NextResponse, type NextRequest } from "next/server";
import { searchProducts } from "@/lib/products";

export function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  return NextResponse.json({ results: searchProducts(q) });
}
