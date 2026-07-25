"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

/** For-developers page — restyled to match the landing page's design system
 *  (paper/ink/kaha, 2px borders, uppercase kickers, bold Archivo headings). */

const C = {
  paper: "#f3f2f2",
  ink: "#201e1d",
  kaha: "#ec3013",
  kaha700: "#a1200d",
  n200: "#e5e3e1",
  n500: "#7d7975",
  n600: "#5c5854",
} as const;

const label: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  fontWeight: 600,
  color: C.kaha700,
};

const h2: React.CSSProperties = {
  fontWeight: 800,
  fontSize: "clamp(28px, 3.5vw, 40px)",
  lineHeight: 1.1,
  letterSpacing: "-0.02em",
  margin: "4px 0 0",
};

const btnPrimary: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: "0.02em",
  textTransform: "uppercase",
  padding: "12px 20px",
  border: "2px solid transparent",
  cursor: "pointer",
  textDecoration: "none",
  fontFamily: "var(--font-sans)",
  background: C.ink,
  color: C.paper,
};

const PLACEHOLDER_ORIGIN = "https://your-suiteas-deploy.example";

const VARIABLES: Array<{ attr: string; required: boolean; description: string }> = [
  { attr: "data-merchant", required: true, description: "Name shown in the modal, e.g. \"PropertyUp\"." },
  {
    attr: "data-pay-url",
    required: true,
    description: "Full URL to a Suiteas /api/pay endpoint. On someone else's site this must be the absolute deployed URL — same-origin \"/api/pay\" only works when the widget is hosted on this app itself.",
  },
  { attr: "data-amount", required: false, description: "Starting amount in USD, e.g. \"0.12\". Visitors can edit it down to $0.001. Defaults to $0.01." },
  { attr: "data-merchant-logo", required: false, description: "Logo URL shown next to the merchant name. Falls back to a monogram if omitted." },
  { attr: "data-coin-name", required: false, description: "Ticker shown next to the amount. Defaults to \"USDC\"." },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      style={{
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.02em",
        padding: "8px 14px",
        border: `2px solid ${C.paper}`,
        background: "none",
        color: C.paper,
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
      }}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function DeveloperGuide() {
  const [origin, setOrigin] = useState(PLACEHOLDER_ORIGIN);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const snippet = `<div
  data-suiteas-pay
  data-merchant="Your Product"
  data-amount="0.12"
  data-pay-url="${origin}/api/pay"
></div>
<script src="${origin}/widget/suiteas-pay.js"></script>`;

  return (
    <div style={{ background: C.paper, color: C.ink, fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <div
        style={{
          borderBottom: `2px solid ${C.ink}`,
          padding: "64px 48px",
          maxWidth: 1200,
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        <span style={label}>For developers</span>
        <h1 style={h2}>Add &ldquo;Pay with Koha&rdquo; to any site.</h1>
        <p style={{ marginTop: 12, maxWidth: 640, fontSize: 16, color: C.n600 }}>
          One script tag, no build step, real x402 settlement on Avalanche Fuji testnet.
        </p>
      </div>

      {/* Live demo */}
      <section style={{ borderBottom: `2px solid ${C.ink}`, padding: "64px 48px", maxWidth: 1200, margin: "0 auto", boxSizing: "border-box" }}>
        <span style={label}>Live demo</span>
        <p style={{ margin: "4px 0 0", maxWidth: 640, fontSize: 14, color: C.n600 }}>
          This is the real widget, not a mockup — it calls this site&apos;s own /api/pay.
          Needs a browser wallet (Core or MetaMask) on Avalanche Fuji to actually pay.
        </p>
        <div style={{ marginTop: 24, display: "flex", justifyContent: "center", border: `2px solid ${C.ink}`, padding: 48, background: "#fff" }}>
          <div
            data-suiteas-pay
            data-merchant="Suiteas Demo"
            data-amount="0.12"
            data-pay-url="/api/pay"
          />
        </div>
        <Script src="/widget/suiteas-pay.js" strategy="afterInteractive" />
      </section>

      {/* Download */}
      <section style={{ borderBottom: `2px solid ${C.ink}`, padding: "64px 48px", maxWidth: 1200, margin: "0 auto", boxSizing: "border-box" }}>
        <span style={label}>Get the file</span>
        <p style={{ margin: "4px 0 0", maxWidth: 640, fontSize: 14, color: C.n600 }}>
          Brand assets are inlined — this one file is everything the widget needs.
        </p>
        <a href="/widget/suiteas-pay.js" download style={{ ...btnPrimary, marginTop: 20 }}>
          Download suiteas-pay.js
        </a>
      </section>

      {/* Snippet */}
      <section style={{ borderBottom: `2px solid ${C.ink}`, background: C.ink, color: C.paper, padding: "64px 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <span style={{ ...label, color: C.kaha }}>Drop it in</span>
              <p style={{ margin: "4px 0 0", maxWidth: 640, fontSize: 14, color: "#cfccc9" }}>
                Paste this where you want the modal to appear. That&apos;s the whole integration.
              </p>
            </div>
            <CopyButton text={snippet} />
          </div>
          <pre
            style={{
              marginTop: 24,
              overflowX: "auto",
              border: `1px solid ${C.n200}`,
              padding: 20,
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            <code>{snippet}</code>
          </pre>
        </div>
      </section>

      {/* Variables */}
      <section style={{ borderBottom: `2px solid ${C.ink}`, padding: "64px 48px", maxWidth: 1200, margin: "0 auto", boxSizing: "border-box" }}>
        <span style={label}>Variables</span>
        <div style={{ marginTop: 20, border: `2px solid ${C.ink}`, display: "grid" }}>
          {VARIABLES.map((v, i) => (
            <div
              key={v.attr}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                padding: 20,
                borderTop: i > 0 ? `1px solid ${C.n200}` : undefined,
              }}
            >
              <code style={{ fontSize: 13, fontWeight: 700 }}>
                {v.attr}
                {v.required && <span style={{ marginLeft: 6, color: C.kaha }}>*</span>}
              </code>
              <p style={{ margin: 0, fontSize: 13, color: C.n600, maxWidth: 640 }}>{v.description}</p>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 8, fontSize: 12, color: C.n500 }}>* required</p>
      </section>

      {/* Already in React */}
      <section style={{ padding: "64px 48px", maxWidth: 1200, margin: "0 auto", boxSizing: "border-box" }}>
        <span style={label}>Already in React?</span>
        <p style={{ margin: "4px 0 0", maxWidth: 640, fontSize: 14, color: C.n600 }}>
          Skip the script tag and import <code style={{ fontSize: 13 }}>SuiteasPayModal</code> directly
          from the <code style={{ fontSize: 13 }}>Modal Paywall/export</code> package instead — same
          component, same real settlement, full control over props and styling.
        </p>
      </section>
    </div>
  );
}
