"use client";

import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AccessPassCard } from "@/components/access-pass-card";
import { ContributeButton } from "@/components/contribute-button";
import { LivePoolFigure } from "@/components/live-pool-figure";
import { WalletStatus } from "@/components/wallet-status";
import { PREVIEW_MOCK } from "@/lib/config/preview";

export default function Dashboard() {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (!PREVIEW_MOCK && ready && !authenticated) router.replace("/");
  }, [ready, authenticated, router]);

  if (!PREVIEW_MOCK && (!ready || !authenticated)) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 text-sm text-muted">Loading…</main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your Suite as</h1>
          <p className="text-sm text-muted">One contribution, the whole bundle.</p>
        </div>
        <WalletStatus />
      </header>

      <LivePoolFigure />

      {/* The single primary action: pay a koha over x402. */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <ContributeButton />
        <p className="text-xs text-muted">Pay what you can, $0 still gets you in.</p>
        <p className="max-w-sm text-center text-xs text-muted">
          This wallet is your only identity here, no product in the bundle got your
          personal details.
        </p>
      </div>

      <AccessPassCard />

      <p className="mt-12 text-xs text-muted">
        <Link href="/" className="underline">
          ← Home
        </Link>
      </p>
    </main>
  );
}
