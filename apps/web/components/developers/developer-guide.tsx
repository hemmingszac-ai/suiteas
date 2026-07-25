"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

/** For-developers page, restyled to match the landing page's design system
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
  fontSize: 12,
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

const h3: React.CSSProperties = {
  fontWeight: 800,
  fontSize: "clamp(22px, 2.8vw, 30px)",
  lineHeight: 1.1,
  letterSpacing: "-0.02em",
  margin: "4px 0 0",
};

const body: React.CSSProperties = {
  fontSize: 16,
  lineHeight: 1.6,
  color: C.n600,
};

const btnPrimary: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  fontSize: 14,
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
    description: "Full URL to a Suiteas /api/pay endpoint. On someone else's site this must be the absolute deployed URL. Same-origin \"/api/pay\" only works when the widget is hosted on this app itself.",
  },
  { attr: "data-amount", required: false, description: "Starting amount in USD, e.g. \"0.12\". Visitors can edit it down to $0.001. Defaults to $0.01." },
  { attr: "data-merchant-logo", required: false, description: "Logo URL shown next to the merchant name. Falls back to a monogram if omitted." },
  { attr: "data-coin-name", required: false, description: "Ticker shown next to the amount. Defaults to \"dNZD\"." },
];

const SECTION_ONLY_VARIABLES: Array<{ attr: string; required: boolean; description: string }> = [
  { attr: "data-title", required: false, description: "Section heading next to the \"how it works\" steps. Defaults to \"Pay with Koha.\"" },
  { attr: "data-subtitle", required: false, description: "Optional line under the heading." },
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
        fontSize: 13,
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

function VariableList({ items }: { items: typeof VARIABLES }) {
  return (
    <div style={{ marginTop: 20, border: `2px solid ${C.ink}`, display: "grid" }}>
      {items.map((v, i) => (
        <div
          key={v.attr}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            padding: 20,
            borderTop: i > 0 ? `1px solid ${C.n200}` : undefined,
          }}
        >
          <code style={{ fontSize: 15, fontWeight: 700 }}>
            {v.attr}
            {v.required && <span style={{ marginLeft: 6, color: C.kaha }}>*</span>}
          </code>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: C.n600, maxWidth: 640 }}>{v.description}</p>
        </div>
      ))}
    </div>
  );
}

export function DeveloperGuide() {
  const [origin, setOrigin] = useState(PLACEHOLDER_ORIGIN);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const modalSnippet = `<div
  data-suiteas-pay
  data-merchant="Your Product"
  data-amount="0.12"
  data-pay-url="${origin}/api/pay"
></div>
<script src="${origin}/widget/suiteas-pay.js"></script>`;

  const sectionSnippet = `<div
  data-suiteas-pay-section
  data-merchant="Your Product"
  data-amount="0.12"
  data-pay-url="${origin}/api/pay"
  data-title="Pay with Koha."
></div>
<script src="${origin}/widget/suiteas-pay-section.js"></script>`;

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
        <p style={{ ...body, marginTop: 12, maxWidth: 640 }}>
          One script tag, no build step, real x402 settlement on Avalanche Fuji testnet.
          Two files, two jobs. Pick whichever fits where you&apos;re dropping it.
        </p>
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10, maxWidth: 640 }}>
          <div style={{ display: "flex", gap: 12, fontSize: 16, color: C.n600 }}>
            <strong style={{ color: C.ink, flexShrink: 0 }}>The modal:</strong>
            <span>Just the card. Slot it next to your existing pricing plans.</span>
          </div>
          <div style={{ display: "flex", gap: 12, fontSize: 16, color: C.n600 }}>
            <strong style={{ color: C.ink, flexShrink: 0 }}>The section:</strong>
            <span>Modal plus a &ldquo;how it works&rdquo; explainer, side by side. A whole page section, ready to drop in as-is.</span>
          </div>
        </div>
      </div>

      {/* ============ Option 1: the modal ============ */}
      <div style={{ borderBottom: `2px solid ${C.ink}`, padding: "48px 48px 0", maxWidth: 1200, margin: "0 auto", boxSizing: "border-box" }}>
        <span style={label}>Option 1</span>
        <h2 style={h3}>The modal</h2>
        <p style={{ ...body, margin: "8px 0 0", maxWidth: 640 }}>
          For slotting next to pricing plans you already have.
        </p>
      </div>

      <section style={{ borderBottom: `2px solid ${C.ink}`, padding: "32px 48px 64px", maxWidth: 1200, margin: "0 auto", boxSizing: "border-box" }}>
        <span style={label}>Live demo</span>
        <p style={{ ...body, margin: "4px 0 0", maxWidth: 640 }}>
          Real, not a mockup: it calls this site&apos;s own /api/pay. You&apos;ll need a browser
          wallet (Core or MetaMask) on Avalanche Fuji to actually pay.
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

        <a href="/widget/suiteas-pay.js" download style={{ ...btnPrimary, marginTop: 24 }}>
          Download suiteas-pay.js
        </a>

        <div style={{ marginTop: 32, background: C.ink, color: C.paper, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <span style={{ ...label, color: C.kaha }}>Drop it in</span>
            <CopyButton text={modalSnippet} />
          </div>
          <pre style={{ marginTop: 16, overflowX: "auto", border: `1px solid ${C.n200}`, padding: 20, fontSize: 15, lineHeight: 1.7 }}>
            <code>{modalSnippet}</code>
          </pre>
        </div>

        <VariableList items={VARIABLES} />
        <p style={{ marginTop: 10, fontSize: 14, color: C.n500 }}>* required</p>
      </section>

      {/* ============ Option 2: the section ============ */}
      <div style={{ borderBottom: `2px solid ${C.ink}`, padding: "48px 48px 0", maxWidth: 1200, margin: "0 auto", boxSizing: "border-box" }}>
        <span style={label}>Option 2</span>
        <h2 style={h3}>The section</h2>
        <p style={{ ...body, margin: "8px 0 0", maxWidth: 640 }}>
          A whole payment section: the modal on the left, a &ldquo;how it works&rdquo; explainer on
          the right, black background. Drop it straight into a page, no pricing plans required.
        </p>
      </div>

      <section style={{ borderBottom: `2px solid ${C.ink}`, padding: "32px 0 64px", maxWidth: 1200, margin: "0 auto", boxSizing: "border-box" }}>
        <div style={{ padding: "0 48px" }}>
          <span style={label}>Live demo</span>
          <p style={{ ...body, margin: "4px 0 0", maxWidth: 640 }}>
            Same real widget as Option 1, same /api/pay. Just the full-section layout.
          </p>
        </div>
        <div style={{ marginTop: 24, border: `2px solid ${C.ink}`, borderLeft: "none", borderRight: "none" }}>
          <div
            data-suiteas-pay-section
            data-merchant="Suiteas Demo"
            data-amount="0.12"
            data-pay-url="/api/pay"
            data-title="Pay with Koha."
          />
        </div>
        <Script src="/widget/suiteas-pay-section.js" strategy="afterInteractive" />

        <div style={{ padding: "0 48px" }}>
          <a href="/widget/suiteas-pay-section.js" download style={{ ...btnPrimary, marginTop: 24 }}>
            Download suiteas-pay-section.js
          </a>

          <div style={{ marginTop: 32, background: C.ink, color: C.paper, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <span style={{ ...label, color: C.kaha }}>Drop it in</span>
              <CopyButton text={sectionSnippet} />
            </div>
            <pre style={{ marginTop: 16, overflowX: "auto", border: `1px solid ${C.n200}`, padding: 20, fontSize: 15, lineHeight: 1.7 }}>
              <code>{sectionSnippet}</code>
            </pre>
          </div>

          <span style={label}>Extra variables</span>
          <p style={{ ...body, margin: "4px 0 0", maxWidth: 640 }}>
            Everything from Option 1 works here too, plus:
          </p>
          <VariableList items={SECTION_ONLY_VARIABLES} />
        </div>
      </section>

      {/* Already in React */}
      <section style={{ padding: "64px 48px", maxWidth: 1200, margin: "0 auto", boxSizing: "border-box" }}>
        <span style={label}>Already in React?</span>
        <p style={{ ...body, margin: "4px 0 0", maxWidth: 640 }}>
          Skip the script tag and import <code style={{ fontSize: 15 }}>SuiteasPayModal</code> or{" "}
          <code style={{ fontSize: 15 }}>SuiteasPaySection</code> directly from the{" "}
          <code style={{ fontSize: 15 }}>Modal Paywall/export</code> package instead. Same
          components, same real settlement, full control over props and styling.
        </p>
      </section>
    </div>
  );
}
