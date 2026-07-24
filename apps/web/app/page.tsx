import Link from "next/link";
import { LoginButton } from "@/components/login-button";
import { isEnabled } from "@/lib/config/features";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="space-y-4">
        <p className="text-sm font-medium uppercase tracking-wide text-accent">Suiteas</p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
          Pay what you can.
          <br />
          Even&nbsp;$0.
        </h1>
        <p className="mx-auto max-w-xl text-lg text-muted">
          One subscription, every tool. Contribute whatever you like — nothing is
          fine — and get access to the whole bundle. What you pay is split on-chain
          between products by how much you actually use them, settling on Avalanche
          in about a second.
        </p>
      </div>

      <ul className="flex flex-col gap-2 text-sm text-muted sm:flex-row sm:gap-6">
        <li>✓ Pay what you can — even&nbsp;$0</li>
        <li>✓ One wallet, one identity — no personal details handed over</li>
        <li>✓ Split on-chain by usage</li>
      </ul>

      {isEnabled("login") ? (
        <LoginButton />
      ) : (
        <p className="text-sm text-muted">Login is currently disabled.</p>
      )}

      <p className="text-xs text-muted">
        Avalanche Fuji testnet · no real funds ·{" "}
        <Link href="/dashboard" className="underline">
          dashboard
        </Link>
      </p>
    </main>
  );
}
