import type { Metadata } from "next";
import { DeveloperGuide } from "@/components/developers/developer-guide";

export const metadata: Metadata = {
  title: "Suiteas: For developers",
  description: "Drop Pay with Koha into any HTML page. One script tag, real x402 settlement on Avalanche Fuji.",
};

export default function DevelopersPage() {
  return <DeveloperGuide />;
}
