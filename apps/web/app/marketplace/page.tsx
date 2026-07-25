import type { Metadata } from "next";
import KiwiStackMarketplace from "@/components/marketplace/kiwi-stack-marketplace";

export const metadata: Metadata = {
  title: "Suiteas — Marketplace",
  description: "Search the whole Suiteas bundle, subscribe to premium picks, use the rest free with your wallet.",
};

export default function MarketplacePage() {
  return <KiwiStackMarketplace />;
}
