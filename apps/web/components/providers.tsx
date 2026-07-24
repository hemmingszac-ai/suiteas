"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { chain } from "@/lib/chain";
import { loginMethods, walletList } from "@/lib/config/wallets";
import { wagmiConfig } from "@/lib/wagmi";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  // Fail loud in dev if the key is missing rather than a blank screen.
  if (!appId) {
    return (
      <div className="mx-auto max-w-md p-8 text-sm text-muted">
        <p className="font-medium text-ink">Missing NEXT_PUBLIC_PRIVY_APP_ID</p>
        <p className="mt-2">
          Copy <code>.env.example</code> to <code>.env.local</code> and add your Privy
          app id. See <code>SETUP.md</code>.
        </p>
      </div>
    );
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods,
        defaultChain: chain,
        supportedChains: [chain],
        // Provision an embedded Avalanche wallet for email/social users.
        embeddedWallets: { createOnLogin: "users-without-wallets" },
        appearance: {
          theme: "light",
          accentColor: "#e84142",
          walletList,
          logo: undefined,
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
