"use client";

import Link from "next/link";
import SuiteasPayModalDemo from "@/components/suiteas-pay-modal-demo";
import { TopUpButton } from "@/components/top-up-button";

/** Suiteas landing page — the design, wired to the real Privy wallet + x402 flow. */

const C = {
  paper: "#f3f2f2",
  ink: "#201e1d",
  kaha: "#ec3013",
  kaha100: "#fde8e3",
  kaha300: "#f5a08c",
  kaha700: "#a1200d",
  n200: "#e5e3e1",
  n400: "#a8a4a0",
  n500: "#7d7975",
  n600: "#5c5854",
} as const;

const weaveKeyframes = `
@keyframes weave-from-top { 0%,4%{transform:translateY(-240px)} 16%,60%{transform:translateY(0)} 74%,100%{transform:translateY(-240px)} }
@keyframes weave-from-bottom { 0%,4%{transform:translateY(240px)} 16%,60%{transform:translateY(0)} 74%,100%{transform:translateY(240px)} }
@keyframes weave-from-right { 0%,4%{transform:translateX(240px)} 16%,60%{transform:translateX(0)} 74%,100%{transform:translateX(240px)} }
@keyframes weave-through-right { 0%,22%{transform:translateX(-240px)} 36%,60%{transform:translateX(0)} 74%,100%{transform:translateX(240px)} }
.weave-strand { animation-duration: 5.5s; animation-iteration-count: infinite; animation-timing-function: cubic-bezier(0.2,0.8,0.2,1); }
.weave-top { animation-name: weave-from-top; }
.weave-bottom { animation-name: weave-from-bottom; }
.weave-right { animation-name: weave-from-right; }
.weave-left { animation-name: weave-through-right; }
@media (prefers-reduced-motion: reduce) { .weave-strand { animation: none; } }
`;

/** The woven "suite as" mark. `animated` off = a static logo for the nav. */
function Mark({ size = 320, animated = true }: { size?: number; animated?: boolean }) {
  const cls = (name: string) => (animated ? `weave-strand ${name}` : undefined);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      role="img"
      aria-label="suite as"
      style={{ maxWidth: "100%" }}
    >
      <g className={cls("weave-top")} fill={C.ink}>
        <rect x={60} y={12} width={24} height={98} />
        <rect x={60} y={146} width={24} height={42} />
      </g>
      <g className={cls("weave-bottom")} fill={C.ink}>
        <rect x={116} y={12} width={24} height={42} />
        <rect x={116} y={90} width={24} height={98} />
      </g>
      <g className={cls("weave-right")} fill={C.ink}>
        <rect x={12} y={60} width={42} height={24} />
        <rect x={90} y={60} width={98} height={24} />
      </g>
      <g className={cls("weave-left")} fill={C.kaha}>
        <rect x={12} y={116} width={98} height={24} />
        <rect x={146} y={116} width={42} height={24} />
      </g>
    </svg>
  );
}

const btnBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: "0.02em",
  textTransform: "uppercase",
  padding: "10px 16px",
  border: "2px solid transparent",
  cursor: "pointer",
  textDecoration: "none",
  fontFamily: "var(--font-sans)",
  lineHeight: 1.1,
};

const btnPrimary: React.CSSProperties = { ...btnBase, background: C.kaha, color: C.paper };
const btnSecondary: React.CSSProperties = { ...btnBase, borderColor: C.ink, color: C.ink };

const label: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  fontWeight: 600,
};

const h2: React.CSSProperties = {
  fontWeight: 800,
  fontSize: "clamp(36px, 5vw, 60px)",
  lineHeight: 1.05,
  letterSpacing: "-0.02em",
  margin: "0 0 64px",
  maxWidth: 800,
  textWrap: "balance" as never,
};

interface TrustProps {
  title: string;
  body: string;
}
function TrustCell({ title, body }: TrustProps) {
  return (
    <div
      style={{
        padding: 32,
        borderRight: `2px solid ${C.ink}`,
        borderBottom: `2px solid ${C.ink}`,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 19 }}>{title}</div>
      <p style={{ margin: 0, fontSize: 15, color: C.n600, lineHeight: 1.55 }}>{body}</p>
    </div>
  );
}

export function SuiteasLanding() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.paper,
        color: C.ink,
        fontFamily: "var(--font-sans)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{weaveKeyframes}</style>

      <main
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "center",
          gap: 48,
          padding: "64px 48px",
          maxWidth: 1200,
          width: "100%",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "flex-start" }}>
          <h1
            style={{
              fontWeight: 800,
              fontSize: "clamp(48px, 7vw, 88px)",
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              margin: 0,
              textWrap: "balance" as never,
            }}
          >
            All of your tools,
            <br />
            paid by <span style={{ color: C.kaha }}>Koha</span>.
          </h1>
          <p style={{ fontSize: 20, color: C.n600, margin: 0 }}>Safe, secure, flexible.</p>
          <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap", alignItems: "flex-start" }}>
            <TopUpButton style={btnPrimary} showStatus />
            <Link href="/marketplace" style={btnSecondary}>Find a product</Link>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            padding: 24,
          }}
        >
          <Mark />
        </div>
      </main>

      <section style={{ borderTop: `2px solid ${C.ink}`, background: C.ink, color: C.paper }}>
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
            <SuiteasPayModalDemo />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <h2 style={{ ...h2, margin: 0, color: C.paper }}>
              Use everything free. Return the favour with Koha.
            </h2>
            <div style={{ border: `2px solid ${C.paper}`, display: "flex", flexDirection: "column" }}>
              {(
                [
                  ["01", "Join once", "One account opens every product in the bundle. Notes, analytics, timetables, all of it. No paywalls, no trials."],
                  ["02", "Use what you like", "The network quietly tallies what you actually use. No invoices, no meters in your face."],
                  ["03", "Koha settles itself", "Your wallet pays what you can, in stablecoin. It splits across the builders by usage, in about a second."],
                ] as const
              ).map(([n, title, body], i) => (
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
                    <div style={{ fontWeight: 700, fontSize: 17 }}>{title}</div>
                    <p style={{ margin: "4px 0 0", fontSize: 14, color: C.n400, lineHeight: 1.55 }}>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="trust"
        style={{
          borderTop: `2px solid ${C.ink}`,
          padding: "96px 48px",
          maxWidth: 1200,
          width: "100%",
          margin: "0 auto",
          boxSizing: "border-box",
          scrollMarginTop: 80,
        }}
      >
        <h2 style={h2}>Nothing hidden. That is the point.</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", borderTop: `2px solid ${C.ink}`, borderLeft: `2px solid ${C.ink}` }}>
          <TrustCell title="Every split is public" body="Koha settles on-chain in stablecoin. Anyone can audit where every cent went, any time." />
          <TrustCell title="Pay what you can" body="Koha means the amount is yours to set. Students give cents, funded teams give more. Access is the same." />
          <TrustCell title="No lock-in, ever" body="Your data exports from every product, and your wallet is yours. Leave whenever you like, take everything with you." />
          <TrustCell title="Built here, owned here" body="Every product is an independent Aotearoa startup. The bundle is the co-op, not the landlord. He waka eke noa." />
        </div>
      </section>

      <section style={{ borderTop: `2px solid ${C.ink}`, background: C.kaha, color: C.paper, padding: "120px 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32, alignItems: "flex-start" }}>
          <h2 style={{ ...h2, margin: 0, fontSize: "clamp(44px, 6vw, 76px)", maxWidth: 900 }}>Many strands, one fabric.</h2>
          <TopUpButton style={{ ...btnBase, background: C.paper, color: C.ink }} showStatus />
        </div>
      </section>

      <footer style={{ borderTop: `2px solid ${C.ink}`, padding: "20px 48px", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <span style={{ ...label, color: C.n600 }}>Built by startups, for startups, in Aotearoa</span>
        <span style={{ flex: 1 }} />
        <span style={{ ...label, color: C.kaha700 }}>he waka eke noa</span>
      </footer>
    </div>
  );
}
