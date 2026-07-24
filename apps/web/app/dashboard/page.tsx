"use client";

import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PoolFigure } from "@/components/pool-figure";
import { WalletStatus } from "@/components/wallet-status";
import { MOCK_POOL_USD, PREVIEW_MOCK } from "@/lib/config/preview";

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
          <h1 className="text-2xl font-semibold tracking-tight">Your Suiteas</h1>
          <p className="text-sm text-muted">One contribution, the whole bundle.</p>
        </div>
        <WalletStatus />
      </header>

      <PoolFigure usd={PREVIEW_MOCK ? MOCK_POOL_USD : undefined} />

      {/* The single primary action. Pay-what-you-can, zero allowed. */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          type="button"
          className="w-full max-w-sm rounded-xl bg-ink px-6 py-4 text-base font-medium text-paper transition hover:bg-ink/90"
          onClick={() => alert("Contribution flow (x402) is wired next.")}
        >
          Contribute koha
        </button>
        <p className="text-xs text-muted">Pay what you can — $0 still gets you in.</p>
        <p className="max-w-sm text-center text-xs text-muted">
          This wallet is your only identity here — no product in the bundle got your
          personal details.
        </p>
      </div>

      <p className="mt-12 text-xs text-muted">
        <Link href="/" className="underline">
          ← Home
        </Link>
      </p>
    </main>
  );
}
