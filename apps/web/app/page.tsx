import Link from "next/link";
import { LoginButton } from "@/components/login-button";
import { isEnabled } from "@/lib/config/features";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Suiteas</h1>
        <p className="mx-auto max-w-xl text-lg text-muted">
          One subscription, every tool. Pay what you can — micropayments split
          on-chain by usage, settling on Avalanche in about a second.
        </p>
      </div>

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
