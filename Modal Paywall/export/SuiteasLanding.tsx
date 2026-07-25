import React, { useEffect, useRef, useState } from "react";

/** Suiteas landing page, converted from the design component.
 *  Fonts: Archivo (Google Fonts, weights 400-900).
 *  Assets: copy assets/logo/ and the three product logos, adjust the paths below. */

export interface SuiteasLandingProps {
  /** Show the "search the bundle" hint in the demo search bar */
  showSearchHint?: boolean;
  /** Show the "in your bundle" badge on the top result */
  showBundleBadge?: boolean;
  markSrc?: string;
  propertyUpLogo?: string;
  rentyLogo?: string;
  propManagerLogo?: string;
}

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

const SEARCH_QUERY = "Property management tool";

function useSearchDemo() {
  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [caretOn, setCaretOn] = useState(true);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const caret = setInterval(() => setCaretOn((v) => !v), 520);
    const after = (ms: number, fn: () => void) =>
      timeouts.current.push(setTimeout(fn, ms));

    const typeInto = (text: string, speed: number, done: () => void) => {
      let i = 0;
      const step = () => {
        i++;
        setSearch(text.slice(0, i));
        if (i < text.length)
          timeouts.current.push(setTimeout(step, speed + Math.random() * 40));
        else done();
      };
      step();
    };

    const runLoop = () => {
      timeouts.current.forEach(clearTimeout);
      timeouts.current = [];
      setSearch("");
      setShowResults(false);
      after(800, () =>
        typeInto(SEARCH_QUERY, 65, () => after(500, () => setShowResults(true)))
      );
    };

    runLoop();
    const loop = setInterval(runLoop, 12000);
    return () => {
      clearInterval(caret);
      clearInterval(loop);
      timeouts.current.forEach(clearTimeout);
    };
  }, []);

  return { search, showResults, caretOn };
}

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

function AnimatedMark({ size = 320 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" role="img" aria-label="suite as" style={{ maxWidth: "100%" }}>
      <g className="weave-strand weave-top" fill={C.ink}>
        <rect x={60} y={12} width={24} height={98} />
        <rect x={60} y={146} width={24} height={42} />
      </g>
      <g className="weave-strand weave-bottom" fill={C.ink}>
        <rect x={116} y={12} width={24} height={42} />
        <rect x={116} y={90} width={24} height={98} />
      </g>
      <g className="weave-strand weave-right" fill={C.ink}>
        <rect x={12} y={60} width={42} height={24} />
        <rect x={90} y={60} width={98} height={24} />
      </g>
      <g className="weave-strand weave-left" fill={C.kaha}>
        <rect x={12} y={116} width={98} height={24} />
        <rect x={146} y={116} width={42} height={24} />
      </g>
    </svg>
  );
}

const btnBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: 8,
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: "0.02em",
  textTransform: "uppercase",
  padding: "10px 16px",
  border: "2px solid transparent",
  cursor: "pointer",
  textDecoration: "none",
  fontFamily: "'Archivo', sans-serif",
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

interface StepProps { n: string; title: string; body: string; style?: React.CSSProperties; }
function Step({ n, title, body, style }: StepProps) {
  return (
    <div style={{ padding: 32, display: "flex", flexDirection: "column", gap: 12, ...style }}>
      <div style={{ fontWeight: 800, fontSize: 48, color: C.kaha, lineHeight: 1 }}>{n}</div>
      <div style={{ fontWeight: 700, fontSize: 19 }}>{title}</div>
      <p style={{ margin: 0, fontSize: 15, color: C.n600, lineHeight: 1.55 }}>{body}</p>
    </div>
  );
}

interface TrustProps { title: string; body: string; }
function TrustCell({ title, body }: TrustProps) {
  return (
    <div style={{ padding: 32, borderRight: `2px solid ${C.ink}`, borderBottom: `2px solid ${C.ink}`, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontWeight: 700, fontSize: 19 }}>{title}</div>
      <p style={{ margin: 0, fontSize: 15, color: C.n600, lineHeight: 1.55 }}>{body}</p>
    </div>
  );
}

function Caret({ on }: { on: boolean }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 2,
        height: "1.1em",
        verticalAlign: "text-bottom",
        marginLeft: 1,
        background: on ? C.kaha : "transparent",
      }}
    />
  );
}

export default function SuiteasLanding({
  showSearchHint = false,
  showBundleBadge = false,
  markSrc = "/assets/logo/suiteas-mark.svg",
  propertyUpLogo = "/assets/products/propertyup.png",
  rentyLogo = "/assets/products/renty.png",
  propManagerLogo = "/assets/products/propmanager.png",
}: SuiteasLandingProps) {
  const { search, showResults, caretOn } = useSearchDemo();

  return (
    <div style={{ minHeight: "100vh", background: C.paper, color: C.ink, fontFamily: "'Archivo', sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{weaveKeyframes}</style>

      <nav style={{ display: "flex", alignItems: "center", gap: 32, padding: "20px 48px", borderBottom: `2px solid ${C.ink}` }}>
        <a href="#" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: C.ink }}>
          <img src={markSrc} width={30} height={30} alt="" />
          <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.02em" }}>suite as</span>
        </a>
        <span style={{ flex: 1 }} />
        <a href="#" style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.02em", textDecoration: "none", color: C.ink }}>Find a product</a>
        <a href="#" style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.02em", textDecoration: "none", color: C.ink }}>About</a>
        <a href="#" style={btnPrimary}>Top up wallet</a>
      </nav>

      <main style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 48, padding: "64px 48px", maxWidth: 1200, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "flex-start" }}>
          <h1 style={{ fontWeight: 800, fontSize: "clamp(48px, 7vw, 88px)", lineHeight: 1.02, letterSpacing: "-0.02em", margin: 0, textWrap: "balance" as never }}>
            All of your tools,<br />paid by <span style={{ color: C.kaha }}>Koha</span>.
          </h1>
          <p style={{ fontSize: 20, color: C.n600, margin: 0 }}>Safe, secure, flexible.</p>
          <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
            <a href="#" style={btnPrimary}>Top up wallet</a>
            <a href="#" style={btnSecondary}>Find a product</a>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: 24 }}>
          <AnimatedMark />
        </div>
      </main>

      <section style={{ borderTop: `2px solid ${C.ink}`, padding: "96px 48px", maxWidth: 1200, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        <h2 style={h2}>Use everything free. Return the favour with Koha.</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", borderTop: `2px solid ${C.ink}` }}>
          <Step n="01" title="Join once" style={{ paddingLeft: 0, borderRight: `2px solid ${C.ink}` }}
            body="One account opens every product in the bundle. Notes, analytics, timetables, all of it. No paywalls, no trials." />
          <Step n="02" title="Use what you like" style={{ borderRight: `2px solid ${C.ink}` }}
            body="The network quietly tallies what you actually use. No invoices, no meters in your face." />
          <Step n="03" title="Koha settles itself" style={{ paddingRight: 0 }}
            body="Your wallet pays what you can, in stablecoin. It splits across the builders by usage, in about a second." />
        </div>
      </section>

      <section style={{ borderTop: `2px solid ${C.ink}`, background: C.ink, color: C.paper }}>
        <div style={{ padding: "96px 48px 110px", maxWidth: 1200, margin: "0 auto", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 48, alignItems: "center" }}>
          <h2 style={{ ...h2, margin: 0, textAlign: "center", maxWidth: 720, fontSize: "clamp(32px, 4vw, 48px)" }}>
            Whatever you need, it is already in your bundle.
          </h2>
          <div style={{ width: "min(680px, 100%)", position: "relative", minHeight: 420 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, background: "#fff", color: C.ink, border: `2px solid ${C.ink}`, padding: "18px 20px" }}>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.kaha} strokeWidth={2.5}>
                <circle cx={11} cy={11} r={7} />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <span style={{ fontSize: 19, fontWeight: 600, minHeight: "1.4em" }}>
                {search}
                <Caret on={caretOn} />
              </span>
              <span style={{ flex: 1 }} />
              {showSearchHint && <span style={{ ...label, fontSize: 10, color: C.n400 }}>search the bundle</span>}
            </div>

            {showResults && (
              <div style={{ position: "absolute", left: 0, right: 0, top: 66, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ background: "#fff", color: C.ink, border: `3px solid ${C.kaha}`, borderRadius: 14, overflow: "hidden", boxShadow: "0 16px 48px rgba(0,0,0,0.45)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: `1px solid ${C.n200}` }}>
                    <img src={propertyUpLogo} width={34} height={34} alt="" style={{ borderRadius: 8, objectFit: "contain" }} />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: 800, fontSize: 16 }}>PropertyUp</span>
                      <span style={{ fontSize: 12, color: C.n500 }}>Property management for small landlords and flats</span>
                    </div>
                    <span style={{ flex: 1 }} />
                    {showBundleBadge && (
                      <span style={{ ...label, fontSize: 10, background: C.kaha100, color: C.kaha700, padding: "4px 8px", borderRadius: 6 }}>in your bundle</span>
                    )}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", background: C.paper }}>
                    <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8, borderRight: `1px solid ${C.n200}`, fontSize: 11, fontWeight: 600, color: C.n600 }}>
                      <span style={{ color: C.ink, background: "#fff", padding: "6px 8px", borderRadius: 6, fontWeight: 700 }}>Properties</span>
                      <span style={{ padding: "6px 8px" }}>Tenants</span>
                      <span style={{ padding: "6px 8px" }}>Rent ledger</span>
                      <span style={{ padding: "6px 8px" }}>Maintenance</span>
                    </div>
                    <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "flex", gap: 10 }}>
                        {([
                          ["Occupied", "7 / 8", C.ink],
                          ["Rent this week", "$3,240", C.ink],
                          ["Open jobs", "2", C.kaha],
                        ] as const).map(([k, v, color]) => (
                          <div key={k} style={{ flex: 1, background: "#fff", borderRadius: 8, padding: "10px 12px" }}>
                            <div style={{ ...label, fontSize: 10, color: C.n500 }}>{k}</div>
                            <div style={{ fontWeight: 800, fontSize: 20, color }}>{v}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ background: "#fff", borderRadius: 8, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontWeight: 600 }}>14 Aro St, Poneke</span>
                          <span style={{ color: C.n500 }}>paid · Tue</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontWeight: 600 }}>2/61 Kilmore St, Otautahi</span>
                          <span style={{ color: C.kaha700, fontWeight: 600 }}>leaky tap · plumber booked</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontWeight: 600 }}>8 Matai Rd, Tamaki</span>
                          <span style={{ color: C.n500 }}>paid · Mon</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {([
                    [rentyLogo, "Renty", "Shared timetables and inspections scheduling"],
                    [propManagerLogo, "PropManager", "Notes and documents, tenancy agreements included"],
                  ] as const).map(([logo, name, desc]) => (
                    <div key={name} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.08)", color: C.paper, padding: "12px 16px", borderRadius: 10 }}>
                      <img src={logo} width={26} height={26} alt="" style={{ borderRadius: 6, objectFit: "contain", background: "#fff" }} />
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{name}</span>
                      <span style={{ fontSize: 12, color: C.n400 }}>{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section style={{ borderTop: `2px solid ${C.ink}`, padding: "96px 48px", maxWidth: 1200, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
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
          <a href="#" style={{ ...btnBase, background: C.paper, color: C.ink }}>Top up wallet</a>
        </div>
      </section>

      <footer style={{ borderTop: `2px solid ${C.ink}`, padding: "20px 48px", display: "flex", alignItems: "center", gap: 24 }}>
        <span style={{ ...label, color: C.n600 }}>Built by startups, for startups, in Aotearoa</span>
        <span style={{ flex: 1 }} />
        <span style={{ ...label, color: C.kaha700 }}>he waka eke noa</span>
      </footer>
    </div>
  );
}
