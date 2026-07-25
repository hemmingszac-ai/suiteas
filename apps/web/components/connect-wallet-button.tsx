"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { WalletStatus } from "./wallet-status";

/**
 * The nav's outlined "Connect Wallet" pill.
 * Before auth: opens Privy. After auth: shows the wallet chip + a route into the dashboard.
 */
export function ConnectWalletButton() {
  const { ready, authenticated, login } = usePrivy();
  const router = useRouter();

  const pill =
    "rounded-full border border-ink/15 px-5 py-2 text-sm font-medium text-ink transition hover:border-ink/30 hover:bg-ink/5";

  if (!ready) {
    return (
      <button disabled className={`${pill} opacity-60`}>
        Connect Wallet
      </button>
    );
  }

  if (authenticated) {
    return (
      <div className="flex items-center gap-3">
        <WalletStatus />
        <button onClick={() => router.push("/dashboard")} className={pill}>
          Dashboard
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => login()} className={pill}>
      Connect Wallet
    </button>
  );
}
