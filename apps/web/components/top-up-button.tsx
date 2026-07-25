"use client";

import type { CSSProperties } from "react";
import { useContributeKoha, type KohaState } from "@/hooks/use-contribute-koha";

const C = { kaha700: "#a1200d", n600: "#5c5854" } as const;

function labelFor(state: KohaState): string {
  switch (state) {
    case "paying":
      return "Topping up…";
    case "done":
      return "Koha sent ✓";
    case "error":
      return "Try again";
    default:
      return "Top up wallet";
  }
}

/**
 * The wired "Top up wallet" CTA, shared by the nav's wallet modal and the
 * landing page's hero/final CTA. Logged out -> opens the Privy connect/login
 * modal. Logged in -> signs & settles a koha over x402 into the Suite pool
 * (same hook as the dashboard). `showStatus` surfaces the result/error under
 * the button where there's room. Styled via `style` to fit any slot.
 */
export function TopUpButton({
  style,
  showStatus = false,
}: {
  style: CSSProperties;
  showStatus?: boolean;
}) {
  const { pay, state, msg, ready } = useContributeKoha();
  const busy = !ready || state === "paying";

  const button = (
    <button
      type="button"
      onClick={() => pay()}
      disabled={busy}
      style={{ ...style, opacity: busy ? 0.7 : 1 }}
    >
      {ready ? labelFor(state) : "Loading…"}
    </button>
  );

  if (!showStatus) return button;

  return (
    <span style={{ display: "inline-flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
      {button}
      {state === "error" && (
        <span style={{ fontSize: 12, color: C.kaha700, maxWidth: 320 }}>{msg || "Top-up failed."}</span>
      )}
      {state === "done" && msg && (
        <span style={{ fontSize: 12, color: C.n600, maxWidth: 320 }}>{msg}</span>
      )}
    </span>
  );
}
