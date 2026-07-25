import React from "react";
import SuiteasPayModal, { type SuiteasPayModalProps } from "./SuiteasPayModal";

/** Suite as — full payment section: the modal on the left, a "how it works"
 *  explainer on the right, black background. Drop this in instead of
 *  SuiteasPayModal directly when you want a whole site section (a pricing
 *  page, a checkout page) rather than just the card — e.g. a dedicated
 *  "Pay with Koha" section on your site, not slotted next to existing
 *  pricing plans. For that, use SuiteasPayModal on its own instead. */

export interface SuiteasPaySectionProps extends SuiteasPayModalProps {
  /** Section heading, above the "how it works" steps. */
  title?: string;
  /** Optional line under the heading. */
  subtitle?: string;
}

const C = {
  paper: "#f3f2f2",
  ink: "#201e1d",
  kaha: "#ec3013",
  n400: "#a8a4a0",
} as const;

const font = "'Archivo', sans-serif";

const STEPS: Array<[string, string, string]> = [
  ["01", "Connect a wallet", "One click, no forms, no card numbers."],
  ["02", "Set what to pay", "Editable down to $0.001 for genuine micropayments."],
  ["03", "Settles on Avalanche", "Real USDC, on-chain, in about a second."],
];

export default function SuiteasPaySection({
  title = "Pay with Koha.",
  subtitle,
  ...modalProps
}: SuiteasPaySectionProps) {
  return (
    <section style={{ background: C.ink, color: C.paper, fontFamily: font }}>
      <div
        style={{
          maxWidth: 1200,
          width: "100%",
          margin: "0 auto",
          boxSizing: "border-box",
          padding: "96px 48px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 64,
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <SuiteasPayModal {...modalProps} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <div>
            <h2
              style={{
                fontWeight: 800,
                fontSize: "clamp(32px, 4vw, 48px)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <p style={{ margin: "12px 0 0", fontSize: 15, color: C.n400, maxWidth: 480 }}>{subtitle}</p>
            )}
          </div>
          <div style={{ border: `2px solid ${C.paper}`, display: "flex", flexDirection: "column" }}>
            {STEPS.map(([n, stepTitle, body], i) => (
              <div
                key={n}
                style={{
                  display: "flex",
                  gap: 20,
                  padding: 24,
                  borderTop: i > 0 ? "1px solid rgba(243,242,242,0.25)" : undefined,
                }}
              >
                <span style={{ fontWeight: 800, fontSize: 28, color: C.kaha, lineHeight: 1.2, flexShrink: 0 }}>{n}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 17 }}>{stepTitle}</div>
                  <p style={{ margin: "4px 0 0", fontSize: 14, color: C.n400, lineHeight: 1.55 }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* Usage: <SuiteasPaySection merchant="PropertyUp" amount={0.12} payUrl="https://..." />
   Full-bleed section — put it directly in your page, no extra wrapper needed. */
