"use client";

import { useContributeKoha } from "@/hooks/use-contribute-koha";

/**
 * The dashboard's primary action: pay a koha over x402. Thin wrapper around
 * useContributeKoha (shared with the landing "Top up wallet" CTA) so the whole
 * app pays through one code path.
 */
export function ContributeButton({ onPaid }: { onPaid?: () => void }) {
  const { pay, state, msg } = useContributeKoha(onPaid);

  const label =
    state === "paying" ? "Paying…" : state === "done" ? "Koha sent ✓" : "Contribute koha";

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => pay()}
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
