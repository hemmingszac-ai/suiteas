"use client";

import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { WalletStatus } from "@/components/wallet-status";
import { features } from "@/lib/config/features";

/**
 * "Manage everything" home. Each panel is gated by a feature flag, so this
 * page grows as flags flip on — no routing changes needed.
 */
const panels: { flag: keyof typeof features; title: string; body: string }[] = [
  { flag: "topUp", title: "Top up", body: "Add funds to the shared pool (koha)." },
  { flag: "launchCoin", title: "Launch coin", body: "Mint and launch a token." },
  { flag: "explorer", title: "Explorer", body: "Watch the pool split live." },
];

export default function Dashboard() {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && !authenticated) router.replace("/");
  }, [ready, authenticated, router]);

  if (!ready || !authenticated) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-sm text-muted">Loading…</main>
    );
  }

  const active = panels.filter((p) => features[p.flag]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted">Manage your Suiteas account.</p>
        </div>
        <WalletStatus />
      </header>

      {active.length === 0 ? (
        <div className="rounded-xl border border-ink/10 p-8 text-sm text-muted">
          No features enabled yet. Flip a flag in{" "}
          <code>lib/config/features.ts</code> to light up a panel here.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {active.map((p) => (
            <div key={p.flag} className="rounded-xl border border-ink/10 p-6">
              <h2 className="font-medium">{p.title}</h2>
              <p className="mt-1 text-sm text-muted">{p.body}</p>
            </div>
          ))}
        </div>
      )}

      <p className="mt-10 text-xs text-muted">
        <Link href="/" className="underline">
          ← Home
        </Link>
      </p>
    </main>
  );
}
