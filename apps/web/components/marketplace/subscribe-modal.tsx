"use client";

import SuiteasPayModal from "@/components/pay-modal/suiteas-pay-modal";
import type { Product } from "./products";

/** Opens when a marketplace product's Subscribe button is clicked: product
 *  info (logo, name, description) stacked on the left as one big modal,
 *  the real SuiteasPayModal — wallet-as-identity connect + real x402
 *  settlement on Avalanche Fuji — on the right. Replaces the old hand-rolled
 *  eth_sendTransaction AVAX transfer (CLAUDE.md: never write a custom
 *  payment function; x402 handles payment). */

const C = {
  paper: "#f3f2f2",
  ink: "#201e1d",
  n400: "#a8a4a0",
} as const;

export function SubscribeModal({
  product,
  priceUsd,
  onClose,
  onSubscribed,
}: {
  product: Product;
  priceUsd: number;
  onClose: () => void;
  /** Fires once the real payment settles (SuiteasPayModal's onPaid), with the
   *  wallet address that paid — used to mint that wallet's AccessPass. */
  onSubscribed?: (product: Product, address: string) => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Subscribe to ${product.name}`}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(32,30,29,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 24,
          maxWidth: "min(880px, 100%)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Left: fixed-size card — icon top-left, title spaced below it,
            description pinned to the bottom regardless of its length. */}
        <div
          style={{
            width: 280,
            height: 480,
            flexShrink: 0,
            background: C.ink,
            color: C.paper,
            borderRadius: 16,
            boxShadow: "0 24px 64px rgba(32,30,29,0.28), 0 2px 8px rgba(32,30,29,0.12)",
            padding: 24,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <style>{".subscribe-icon svg { width: 100%; height: 100%; display: block; }"}</style>

          <div>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <span
                aria-hidden="true"
                className="subscribe-icon"
                style={{ width: 48, height: 48, flexShrink: 0 }}
                dangerouslySetInnerHTML={{ __html: product.iconSvg }}
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 22,
                  lineHeight: 1,
                  color: C.n400,
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: C.n400 }}>
                {product.category}
              </div>
              <h2 style={{ margin: "6px 0 0", fontSize: 22, fontWeight: 800, letterSpacing: "-0.01em" }}>{product.name}</h2>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#cfccc9" }}>{product.description}</p>
        </div>

        {/* Right: the real payment modal */}
        <div style={{ flexShrink: 0 }}>
          <SuiteasPayModal
            merchant={product.name}
            amount={priceUsd}
            minAmount={priceUsd}
            payUrl="/api/pay"
            onPaid={(result) => onSubscribed?.(product, result.address)}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
}
