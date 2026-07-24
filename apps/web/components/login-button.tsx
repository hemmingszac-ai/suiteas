"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { WalletStatus } from "./wallet-status";

export function LoginButton() {
  const { ready, authenticated, login, logout } = usePrivy();
  const router = useRouter();

  if (!ready) {
    return (
      <button
        disabled
        className="rounded-lg bg-ink/40 px-6 py-3 text-sm font-medium text-paper"
      >
        Loading…
      </button>
    );
  }

  if (authenticated) {
    return (
      <div className="flex flex-col items-center gap-4">
        <WalletStatus />
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg bg-ink px-6 py-3 text-sm font-medium text-paper transition hover:bg-ink/90"
          >
            Open dashboard
          </button>
          <button
            onClick={() => logout()}
            className="rounded-lg border border-ink/15 px-6 py-3 text-sm font-medium text-ink transition hover:bg-ink/5"
          >
            Log out
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => login()}
      className="rounded-lg bg-ink px-8 py-3 text-sm font-medium text-paper transition hover:bg-ink/90"
    >
      Log in / connect wallet
    </button>
  );
}
