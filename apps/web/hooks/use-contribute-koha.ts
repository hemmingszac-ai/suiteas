"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";
import { publicActions } from "viem";
import { useWalletClient } from "wagmi";
import { decodeXPaymentResponse, wrapFetchWithPayment } from "x402-fetch";

export type KohaState = "idle" | "paying" | "done" | "error";

/**
 * The one primary action, as a hook so the landing CTA and the dashboard button
 * drive the exact same flow. Fetches /api/protected, which returns 402;
 * wrapFetchWithPayment signs an EIP-3009 authorization with the connected wallet
 * (gasless) and retries; the facilitator settles USDC into the Suite pool.
 *
 * `pay()` gates on auth: if the user isn't logged in it opens the Privy
 * connect/login modal instead of paying, so a single button handles both.
 */
export function useContributeKoha(onPaid?: () => void) {
  const { ready, authenticated, login } = usePrivy();
  const { data: walletClient } = useWalletClient();
  const [state, setState] = useState<KohaState>("idle");
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

  return { pay, state, msg, ready, authenticated };
}
