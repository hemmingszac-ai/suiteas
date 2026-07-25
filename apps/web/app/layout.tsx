import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "@/components/providers";
import { SiteNav } from "@/components/site-nav";
import "./globals.css";

// Archivo is self-hosted via @font-face in globals.css (files in public/fonts).
// We deliberately don't use next/font/google here: it fetches from Google at
// build time, which this network blocks intermittently (ETIMEDOUT). Self-hosting
// keeps the build hermetic and the font available offline.

export const metadata: Metadata = {
  title: "Suiteas — All of your tools, paid by Koha",
  description: "One subscription, every tool. Pay-what-you-can, split on-chain.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <SiteNav />
          {children}
        </Providers>
      </body>
    </html>
  );
}
