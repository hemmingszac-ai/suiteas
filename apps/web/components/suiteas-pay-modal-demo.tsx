"use client";

import { useEffect, useRef, useState } from "react";

/** Suite as — Pay with Koha, autoplaying end-to-end demo.
 *  Loops through: connect -> connected -> settling -> paid, on Avalanche
 *  C-Chain, then again on Base Sepolia (Fire Eyes dev track, simulated),
 *  forever. No clicks required — for showing the product working on a
 *  marketing/landing page. Matches Modal Paywall/export/SuiteasPayModal.tsx. */

type NetworkId = "avalanche" | "sepolia";
type Step = "idle" | "connecting" | "connected" | "paying" | "paid";

export interface SuiteasPayModalDemoProps {
  merchant?: string;
  merchantLogo?: string;
  avalancheIconSrc?: string;
  baseIconSrc?: string;
  coinName?: string;
  amount?: number;
}

const C = {
  paper: "#f3f2f2",
  ink: "#201e1d",
  kaha: "#ec3013",
  kaha100: "#fde8e3",
  kaha300: "#f5a08c",
  kaha700: "#a1200d",
  n100: "#f3f2f2",
  n200: "#e5e3e1",
  n300: "#cfccc9",
  n400: "#a8a4a0",
  n500: "#7d7975",
  n600: "#5c5854",
  green: "#1a9c46",
  base: "#0052ff",
} as const;

const font = "'Archivo', sans-serif";

const keyframes = `
@keyframes suiteas-demo-spin { to { transform: rotate(360deg); } }
@keyframes suiteas-demo-pop { 0% { transform: scale(0.6); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
@keyframes suiteas-demo-fadein { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
`;

function MarkDark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true" style={{ flexShrink: 0 }}>
      <rect x={60} y={12} width={24} height={98} fill={C.ink} />
      <rect x={60} y={146} width={24} height={42} fill={C.ink} />
      <rect x={116} y={12} width={24} height={42} fill={C.ink} />
      <rect x={116} y={90} width={24} height={98} fill={C.ink} />
      <rect x={12} y={60} width={42} height={24} fill={C.ink} />
      <rect x={90} y={60} width={98} height={24} fill={C.ink} />
      <rect x={12} y={116} width={98} height={24} fill={C.kaha} />
      <rect x={146} y={116} width={42} height={24} fill={C.kaha} />
    </svg>
  );
}

function MarkLight({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true" style={{ flexShrink: 0 }}>
      <rect x={60} y={12} width={24} height={98} fill={C.paper} />
      <rect x={60} y={146} width={24} height={42} fill={C.paper} />
      <rect x={116} y={12} width={24} height={42} fill={C.paper} />
      <rect x={116} y={90} width={24} height={98} fill={C.paper} />
      <rect x={12} y={60} width={42} height={24} fill={C.paper} />
      <rect x={90} y={60} width={98} height={24} fill={C.paper} />
      <rect x={12} y={116} width={98} height={24} fill={C.kaha} />
      <rect x={146} y={116} width={42} height={24} fill={C.kaha} />
    </svg>
  );
}

function Spinner({ ring, top }: { ring: string; top: string }) {
  return (
    <span
      style={{
        width: 16,
        height: 16,
        border: `2px solid ${ring}`,
        borderTopColor: top,
        borderRadius: "50%",
        display: "inline-block",
        animation: "suiteas-demo-spin 0.7s linear infinite",
      }}
    />
  );
}

/** Drives the idle -> connecting -> connected -> paying -> paid loop,
 *  alternating network each full pass. */
function useAutoplayDemo() {
  const [step, setStep] = useState<Step>("idle");
  const [network, setNetwork] = useState<NetworkId>("avalanche");
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const after = (ms: number, fn: () => void) => timeouts.current.push(setTimeout(fn, ms));

    const playNetwork = (net: NetworkId, onDone: () => void) => {
      setNetwork(net);
      setStep("idle");
      after(1400, () => {
        setStep("connecting");
        after(1200, () => {
          setStep("connected");
          after(1500, () => {
            setStep("paying");
            after(1500, () => {
              setStep("paid");
              after(2200, onDone);
            });
          });
        });
      });
    };

    const loop = () => playNetwork("avalanche", () => playNetwork("sepolia", loop));
    loop();

    return () => timeouts.current.forEach(clearTimeout);
  }, []);

  return { step, network };
}

export default function SuiteasPayModalDemo({
  merchant = "PropertyUp",
  merchantLogo = "/pay-demo/propertyup.png",
  avalancheIconSrc = "/pay-demo/avalanche-icon.png",
  baseIconSrc = "/pay-demo/base-icon.png",
  coinName = "dNZD",
  amount = 0.12,
}: SuiteasPayModalDemoProps) {
  const { step, network } = useAutoplayDemo();
  const isSepolia = network === "sepolia";
  const networkLabel = isSepolia ? "Base Sepolia" : "Avalanche C-Chain";
  const amountDisplay = `$${amount.toFixed(2)}`;

  return (
    <div
      style={{
        width: 440,
        maxWidth: "100%",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 24px 64px rgba(32,30,29,0.28), 0 2px 8px rgba(32,30,29,0.12)",
        overflow: "hidden",
        color: C.ink,
        fontFamily: font,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{keyframes}</style>

      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 20px", borderBottom: `1px solid ${C.n200}` }}>
        <MarkDark size={22} />
        <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.01em" }}>Pay with Koha</span>
        <span style={{ flex: 1 }} />
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.n500} strokeWidth={2}>
          <rect x={3} y={11} width={18} height={11} rx={2} />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, color: C.n500 }}>secure</span>
      </div>

      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={merchantLogo} width={38} height={38} alt="" style={{ borderRadius: 10, objectFit: "cover" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 13, color: C.n500 }}>Paying</span>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{merchant}</span>
          </div>
          <span style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", border: `1px solid ${C.n300}`, borderRadius: 10, padding: "6px 10px", gap: 2 }}>
              <span style={{ fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em" }}>${amount.toFixed(2)}</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", color: C.n500 }}>{coinName}</span>
          </div>
        </div>

        <div style={{ border: `1px solid ${C.n200}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2px 14px", fontSize: 12 }}>
            <span style={{ fontWeight: 600, fontSize: 15, display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>
              <img src={isSepolia ? baseIconSrc : avalancheIconSrc} width={isSepolia ? 26 : 36} height={isSepolia ? 26 : 36} alt="" style={{ display: "block", flexShrink: 0 }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{networkLabel}</span>
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: C.n400 }}>Auto</span>
          </div>
        </div>

        <div style={{ minHeight: 190, display: "flex", flexDirection: "column", gap: 18, justifyContent: "flex-start" }}>
          {step === "idle" && (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", boxSizing: "border-box", padding: 14, background: C.ink, color: C.paper, borderRadius: 10, fontSize: 15, fontWeight: 700, animation: "suiteas-demo-fadein 0.3s ease-out" }}>
                <MarkLight size={18} />
                Connect Suite as wallet
              </div>
              <div style={{ fontSize: 11, color: C.n500, textAlign: "center" }}>One click. No forms, no card numbers.</div>
            </>
          )}

          {step === "connecting" && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxSizing: "border-box", padding: 14, border: `1px solid ${C.n200}`, borderRadius: 10, fontSize: 14, fontWeight: 600, color: C.n600, animation: "suiteas-demo-fadein 0.3s ease-out" }}>
              <Spinner ring={C.n300} top={C.kaha} />
              Waking your wallet...
            </div>
          )}

          {step === "connected" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18, animation: "suiteas-demo-fadein 0.3s ease-out" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: C.n100, borderRadius: 10, fontSize: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.green }} />
                <span style={{ fontWeight: 700 }}>0x7a3f...9e21</span>
                <span style={{ color: C.n500 }}>connected</span>
                <span style={{ flex: 1 }} />
                <span style={{ fontWeight: 700 }}>
                  $4.10 <span style={{ fontWeight: 400, color: C.n500 }}>{coinName}</span>
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", boxSizing: "border-box", padding: 14, background: C.kaha, color: "#fff", borderRadius: 10, fontSize: 15, fontWeight: 700 }}>
                {isSepolia ? "Simulate Dev Pipeline" : "Pay with Koha"} · {amountDisplay}
              </div>
            </div>
          )}

          {step === "paying" && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxSizing: "border-box", padding: 14, background: C.kaha100, borderRadius: 10, fontSize: 14, fontWeight: 600, color: C.kaha700, animation: "suiteas-demo-fadein 0.3s ease-out" }}>
              <Spinner ring={C.kaha300} top={C.kaha700} />
              Settling on {networkLabel}...
            </div>
          )}

          {step === "paid" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "suiteas-demo-fadein 0.3s ease-out" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "18px 14px", background: C.n100, borderRadius: 10, animation: "suiteas-demo-pop 0.25s ease-out" }}>
                <span style={{ width: 40, height: 40, borderRadius: "50%", background: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3}>
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                <span style={{ fontWeight: 800, fontSize: 16 }}>{isSepolia ? "Simulated Koha sent" : "Koha sent"}</span>
                <span style={{ fontSize: 12, color: C.n500 }}>
                  {amountDisplay} {coinName} to {merchant} · settled in 0.87s
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: C.kaha700 }}>View on explorer: 0x3c81...b4f7</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, padding: "12px 20px", borderTop: `1px solid ${C.n200}`, background: C.n100 }}>
        <span style={{ fontSize: 10, color: C.n500 }}>
          Micropayments on <b>{networkLabel}</b> · {coinName} by <b>New Zealand Dollar Digital</b>
        </span>
        <span style={{ flex: 1 }} />
      </div>

      {isSepolia && (
        <div style={{ padding: "10px 20px", background: C.base, color: "#fff", fontSize: 11, fontWeight: 600, textAlign: "center" }}>
          Connected to Fire Eyes Developer Track: transactions are simulated
        </div>
      )}
    </div>
  );
}

/* Usage: <SuiteasPayModalDemo /> — no props required, autoplays on mount and
   loops forever. Drop it into a hero section or feature card to show the
   payment flow working. */
