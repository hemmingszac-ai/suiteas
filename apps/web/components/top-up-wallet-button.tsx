"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

/** The one nav CTA: log in if needed, otherwise straight into the top-up flow. */
export function TopUpWalletButton() {
  const { ready, authenticated, login } = usePrivy();
  const router = useRouter();

  function onClick() {
    if (!authenticated) {
      login();
      return;
    }
    router.push("/dashboard");
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!ready}
      className="rounded-full border border-ink/15 px-5 py-2 text-sm font-medium text-ink transition hover:border-ink/30 hover:bg-ink/5 disabled:opacity-60"
    >
      Top up wallet
    </button>
  );
}
