"use client";

import { useAccessPass } from "@/hooks/use-access-pass";
import { PREVIEW_MOCK } from "@/lib/config/preview";

/**
 * The AccessPass credential — makes the identity thesis tangible: a soulbound
 * membership pass bound to your wallet, no personal data attached. You're
 * identified by holding it, not by handing over your details.
 */
export function AccessPassCard() {
  const { hasPass, tokenId } = useAccessPass();

  const has = PREVIEW_MOCK ? true : hasPass;
  const id = PREVIEW_MOCK ? 1n : tokenId;

  return (
    <div className="mt-6 rounded-2xl border border-ink/10 p-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Suiteas AccessPass</span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            has ? "bg-green-100 text-green-700" : "bg-ink/5 text-muted"
          }`}
        >
          {has ? "Active" : "Not yet"}
        </span>
      </div>
      <p className="mt-2 text-sm text-muted">
        Your membership credential — soulbound to your wallet, no personal data
        attached. This is your identity across the bundle.
      </p>
      {has && id ? (
        <p className="mt-3 font-mono text-lg">Member #{id.toString().padStart(3, "0")}</p>
      ) : (
        <p className="mt-3 text-sm text-muted">Contribute a koha to mint your pass.</p>
      )}
    </div>
  );
}
