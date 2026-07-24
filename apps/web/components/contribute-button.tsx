"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";
import { publicActions } from "viem";
import { useWalletClient } from "wagmi";
import { decodeXPaymentResponse, wrapFetchWithPayment } from "x402-fetch";

type State = "idle" | "paying" | "done" | "error";

/**
 * The one primary action: pay a koha over x402. Fetches /api/protected, which
 * returns 402; wrapFetchWithPayment signs an EIP-3009 authorization with the
 * connected wallet (gasless) and retries; the facilitator settles USDC into the
 * Suite pool. The live counter picks up the new balance on its next poll.
 */
export function ContributeButton({ onPaid }: { onPaid?: () => void }) {
  const { authenticated, login } = usePrivy();
  const { data: walletClient } = useWalletClient();
  const [state, setState] = useState<State>("idle");
  const [msg, setMsg] = useState("");

  async function pay() {
    if (!authenticated) {
      login();
      return;
    }
    if (!walletClient) {
      setState("error");
      setMsg("No connected wallet to sign the payment.");
      return;
    }
    try {
      setState("paying");
      setMsg("");
      // x402 needs a wallet client that also has public actions.
      const signer = walletClient.extend(publicActions);
      const fetchWithPay = wrapFetchWithPayment(fetch, signer);
      const res = await fetchWithPay("/api/protected", { method: "GET" });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);

      const header = res.headers.get("x-payment-response");
      if (header) {
        const settled = decodeXPaymentResponse(header);
        setMsg(settled?.transaction ? `Settled: ${settled.transaction.slice(0, 10)}…` : "");
      }
      setState("done");
      onPaid?.();
    } catch (e) {
      setState("error");
      setMsg(e instanceof Error ? e.message : "Payment failed.");
    }
  }

  const label =
    state === "paying" ? "Paying…" : state === "done" ? "Koha sent ✓" : "Contribute koha";

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-2">
      <button
        type="button"
        onClick={pay}
        disabled={state === "paying"}
        className="w-full rounded-xl bg-ink px-6 py-4 text-base font-medium text-paper transition hover:bg-ink/90 disabled:opacity-60"
      >
        {label}
      </button>
      {state === "error" && <p className="text-xs text-accent">{msg}</p>}
      {state === "done" && msg && <p className="text-xs text-muted">{msg}</p>}
    </div>
  );
}
