"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { MOCK_ADDRESS, PREVIEW_MOCK } from "@/lib/config/preview";

function truncate(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/** Shows the connected/embedded wallet address once authenticated. */
export function WalletStatus() {
  const { user } = usePrivy();
  const { wallets } = useWallets();

  const address =
    wallets[0]?.address ??
    user?.wallet?.address ??
    (PREVIEW_MOCK ? MOCK_ADDRESS : undefined);

  if (!address) {
    return <p className="text-sm text-muted">No wallet yet…</p>;
  }

  return (
    <div className="flex items-center gap-2 rounded-full border border-ink/10 bg-ink/5 px-4 py-2 text-sm">
      <span className="h-2 w-2 rounded-full bg-green-500" />
      <span className="font-mono">{truncate(address)}</span>
    </div>
  );
}
