"use client";

import React, { useCallback, useState } from "react";
import { connectWallet as realConnectWallet, makeSendPayment } from "./suiteas-pay-client";

/** Suite as — Pay with Koha modal.
 *  Two networks: Avalanche C-Chain (real x402 settlement on Avalanche Fuji)
 *  and Base Sepolia (Fire Eyes developer track — simulated, no real Base
 *  backend exists). Fonts: Archivo (Google Fonts). Pass connectWallet/
 *  sendPayment to override the real wallet flow (e.g. for a scripted UI
 *  preview without a wallet). */

export type NetworkId = "avalanche" | "sepolia";
type Step = "idle" | "connecting" | "connected" | "paying" | "paid";

export interface SuiteasPayModalProps {
  merchant: string;
  /** Starting amount, e.g. 0.12. User can edit down to minAmount (default 0.001,
   *  for genuine micropayments) — but never below it, and up with no ceiling. */
  amount?: number;
  /** Floor for the editable amount. Defaults to 0.001. Set it to the sticker
   *  price for a fixed-price flow (e.g. a subscription) so users can tip more
   *  but can't underpay. */
  minAmount?: number;
  merchantLogo?: string;
  markSrc?: string;
  markOnDarkSrc?: string;
  avalancheIconSrc?: string;
  baseIconSrc?: string;
  /** Where payments settle — the hosted /api/pay route. Defaults to same-origin
   *  "/api/pay"; pass the full https://... URL when embedding on someone else's site. */
  payUrl?: string;
  /** Stablecoin ticker shown next to the amount */
  coinName?: string;
  /** Called with the tx hash, amount and network once settled */
  onPaid?: (result: { txHash: string; amount: number; network: NetworkId; simulated: boolean; address: string }) => void;
  onClose?: () => void;
  connectWallet?: (network: NetworkId) => Promise<{ address: string; balance: number }>;
  sendPayment?: (amount: number, network: NetworkId) => Promise<{ txHash: string; seconds: number }>;
}

const C = {
  paper: "#f3f2f2",
  ink: "#201e1d",
  kaha: "#ec3013",
  kaha100: "#fde8e3",
  kaha300: "#f5a08c",
  kaha600: "#c92810",
  kaha700: "#a1200d",
  n100: "#f3f2f2",
  n200: "#e5e3e1",
  n300: "#cfccc9",
  n400: "#a8a4a0",
  n500: "#7d7975",
  n600: "#5c5854",
  n700: "#403d3a",
  green: "#1a9c46",
  base: "#0052ff",
} as const;

const font = "'Archivo', sans-serif";

/** Scripted, walletless UI preview — pass these explicitly to demo the states
 *  without a real wallet. Not used by default; the real client is. */
export const previewConnect = (_network: NetworkId) =>
  new Promise<{ address: string; balance: number }>((r) =>
    setTimeout(() => r({ address: "0x7a3f...9e21", balance: 4.1 }), 1100)
  );
export const previewPay = (_amount: number, _network: NetworkId) =>
  new Promise<{ txHash: string; seconds: number }>((r) =>
    setTimeout(() => r({ txHash: "0x3c81...b4f7", seconds: 0.87 }), 1400)
  );

const keyframes = `
@keyframes suiteas-spin { to { transform: rotate(360deg); } }
@keyframes suiteas-pop { 0% { transform: scale(0.6); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
`;

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
        animation: "suiteas-spin 0.7s linear infinite",
      }}
    />
  );
}

function clamp(v: string, min: number): number {
  return Math.max(min, parseFloat(v) || 0);
}

export default function SuiteasPayModal({
  merchant,
  amount = 0.12,
  minAmount = 0.001,
  merchantLogo,
  markSrc = "/assets/logo/suiteas-mark.svg",
  markOnDarkSrc = "/assets/logo/suiteas-mark-on-dark.svg",
  avalancheIconSrc = "/assets/avalanche-icon.png",
  baseIconSrc = "/assets/base-icon.png",
  payUrl = "/api/pay",
  coinName = "dNZD",
  onPaid,
  onClose,
  connectWallet = (_network: NetworkId) => realConnectWallet(),
  sendPayment = makeSendPayment(payUrl, merchant),
}: SuiteasPayModalProps) {
  const [step, setStep] = useState<Step>("idle");
  const [network, setNetwork] = useState<NetworkId>("avalanche");
  const [showPicker, setShowPicker] = useState(false);
  const [amountStr, setAmountStr] = useState(amount.toFixed(2));
  const [wallet, setWallet] = useState<{ address: string; balance: number } | null>(null);
  const [receipt, setReceipt] = useState<{ txHash: string; seconds: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isSepolia = network === "sepolia";
  const amountNum = clamp(amountStr, minAmount);
  const amountDisplay = `$${amountNum.toFixed(2)}`;
  const networkLabel = isSepolia ? "Base Sepolia" : "Avalanche C-Chain";

  const handleConnect = useCallback(async () => {
    setErrorMsg(null);
    setStep("connecting");
    try {
      setWallet(await connectWallet(network));
      setStep("connected");
    } catch (err) {
      setStep("idle");
      setErrorMsg(err instanceof Error ? err.message : "Couldn't connect a wallet.");
    }
  }, [connectWallet, network]);

  const handlePay = useCallback(async () => {
    setErrorMsg(null);
    setStep("paying");
    try {
      const r = await sendPayment(amountNum, network);
      setReceipt(r);
      setStep("paid");
      onPaid?.({ txHash: r.txHash, amount: amountNum, network, simulated: isSepolia, address: wallet?.address ?? "" });
    } catch (err) {
      setStep("connected");
      setErrorMsg(err instanceof Error ? err.message : "Payment failed.");
    }
  }, [sendPayment, onPaid, amountNum, network]);

  const primaryBtn: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    padding: 14,
    border: "none",
    borderRadius: 10,
    fontFamily: font,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  };

  return (
    <div
      style={{
        width: 440,
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

      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 20px", borderBottom: `1px solid ${C.n200}` }}>
        <img src={markSrc} width={22} height={22} alt="" />
        <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.01em" }}>Pay with Koha</span>
        <span style={{ flex: 1 }} />
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.n500} strokeWidth={2}>
          <rect x={3} y={11} width={18} height={11} rx={2} />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, color: C.n500 }}>secure</span>
      </div>

      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 18 }}>
        {/* merchant + amount */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {merchantLogo ? (
            <img src={merchantLogo} width={38} height={38} alt="" style={{ borderRadius: 10, objectFit: "cover" }} />
          ) : (
            <span style={{ width: 38, height: 38, borderRadius: 10, background: C.ink, color: C.paper, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16 }}>
              {merchant.charAt(0)}
            </span>
          )}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 13, color: C.n500 }}>Paying</span>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{merchant}</span>
          </div>
          <span style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", border: `1px solid ${C.n300}`, borderRadius: 10, padding: "6px 10px", gap: 2 }}>
              <span style={{ fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em" }}>$</span>
              <input
                type="number"
                step={0.001}
                min={minAmount}
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                onBlur={() => setAmountStr(clamp(amountStr, minAmount).toFixed(2))}
                style={{ width: 64, border: "none", outline: "none", fontFamily: font, fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", color: C.ink, background: "transparent", padding: 0 }}
              />
            </div>
            <span style={{ fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", color: C.n500 }}>{coinName}</span>
          </div>
        </div>

        {/* network row */}
        <div style={{ border: `1px solid ${C.n200}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2px 14px", fontSize: 12 }}>
            <span style={{ fontWeight: 600, fontSize: 15, display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>
              <img src={isSepolia ? baseIconSrc : avalancheIconSrc} width={isSepolia ? 26 : 36} height={isSepolia ? 26 : 36} alt="" style={{ display: "block", flexShrink: 0 }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{networkLabel}</span>
            </span>
            <button onClick={() => setShowPicker((v) => !v)} style={{ background: "none", border: "none", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: C.kaha700, cursor: "pointer", padding: "6px 0", flexShrink: 0, whiteSpace: "nowrap" }}>
              Change
            </button>
          </div>
        </div>

        {/* network picker */}
        {showPicker && (
          <div style={{ border: `1px solid ${C.n300}`, borderRadius: 10, overflow: "hidden" }}>
            <button
              onClick={() => { setNetwork("avalanche"); setShowPicker(false); }}
              style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", textAlign: "left", padding: 16, background: !isSepolia ? C.kaha100 : "transparent", border: "none", borderBottom: `1px solid ${C.n200}`, cursor: "pointer" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <RadioDot on={!isSepolia} />
                <img src={avalancheIconSrc} width={34} height={34} alt="" style={{ display: "block" }} />
                <span style={{ fontWeight: 700, fontSize: 17 }}>Avalanche C-Chain</span>
                <span style={{ flex: 1 }} />
                <Badge tone="kaha">Live production</Badge>
              </div>
              <div style={{ fontSize: 12, color: C.n500, paddingLeft: 44, lineHeight: 1.6 }}>
                Settles real {coinName} stablecoin instantly<br />Showcases the active retail payment pipeline
              </div>
            </button>
            <button
              onClick={() => { setNetwork("sepolia"); setShowPicker(false); }}
              style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", textAlign: "left", padding: 16, background: isSepolia ? "rgba(0,82,255,0.08)" : "transparent", border: "none", cursor: "pointer" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <RadioDot on={isSepolia} />
                <img src={baseIconSrc} width={34} height={34} alt="" style={{ display: "block" }} />
                <span style={{ fontWeight: 700, fontSize: 17 }}>Base Sepolia</span>
                <span style={{ flex: 1 }} />
                <Badge tone="neutral">Dev testnet</Badge>
              </div>
              <div style={{ fontSize: 12, color: C.n500, paddingLeft: 44, lineHeight: 1.6 }}>
                Fire Eyes integration testing environment<br />Simulates smart contract reward payouts
              </div>
            </button>
          </div>
        )}

        {errorMsg && (
          <div style={{ padding: "10px 14px", background: "#fdecea", border: "1px solid #f5c6c0", borderRadius: 10, fontSize: 12, color: C.kaha700 }}>
            {errorMsg}
          </div>
        )}

        {/* step states, fixed-height so the card doesn't resize between them */}
        <div style={{ minHeight: 170, display: "flex", flexDirection: "column", gap: 18, justifyContent: "flex-start" }}>
          {step === "idle" && (
            <>
              <button onClick={handleConnect} style={{ ...primaryBtn, background: C.ink, color: C.paper }}>
                <img src={markOnDarkSrc} width={18} height={18} alt="" />
                Connect Suite as wallet
              </button>
              <div style={{ fontSize: 11, color: C.n500, textAlign: "center" }}>One click. No forms, no card numbers.</div>
            </>
          )}

          {step === "connecting" && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: 14, border: `1px solid ${C.n200}`, borderRadius: 10, fontSize: 14, fontWeight: 600, color: C.n600 }}>
              <Spinner ring={C.n300} top={C.kaha} />
              Waking your wallet...
            </div>
          )}

          {step === "connected" && wallet && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: C.n100, borderRadius: 10, fontSize: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.green }} />
                <span style={{ fontWeight: 700 }}>{wallet.address}</span>
                <span style={{ color: C.n500 }}>connected</span>
                <span style={{ flex: 1 }} />
                <span style={{ fontWeight: 700 }}>
                  ${wallet.balance.toFixed(2)} <span style={{ fontWeight: 400, color: C.n500 }}>{coinName}</span>
                </span>
              </div>
              <button onClick={handlePay} style={{ ...primaryBtn, background: C.kaha, color: "#fff" }}>
                {isSepolia ? "Simulate Dev Pipeline" : "Pay with Koha"} · {amountDisplay}
              </button>
            </>
          )}

          {step === "paying" && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: 14, background: C.kaha100, borderRadius: 10, fontSize: 14, fontWeight: 600, color: C.kaha700 }}>
              <Spinner ring={C.kaha300} top={C.kaha700} />
              Settling on {networkLabel}...
            </div>
          )}

          {step === "paid" && receipt && (
            <>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "18px 14px", background: C.n100, borderRadius: 10, animation: "suiteas-pop 0.25s ease-out" }}>
                <span style={{ width: 40, height: 40, borderRadius: "50%", background: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3}>
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                <span style={{ fontWeight: 800, fontSize: 16 }}>{isSepolia ? "Simulated Koha sent" : "Koha sent"}</span>
                <span style={{ fontSize: 12, color: C.n500 }}>
                  {amountDisplay} {coinName} to {merchant} · settled in {receipt.seconds}s
                </span>
                {!isSepolia && receipt.txHash.startsWith("0x") && (
                  <a
                    href={`https://testnet.snowtrace.io/tx/${receipt.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: 11, fontWeight: 600, color: C.kaha700 }}
                  >
                    View on Snowtrace: {receipt.txHash.slice(0, 10)}…
                  </a>
                )}
                {isSepolia && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.kaha700 }}>
                    View on explorer: {receipt.txHash}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setStep("idle");
                  setWallet(null);
                  setReceipt(null);
                  onClose?.();
                }}
                style={{ width: "100%", padding: 10, background: "none", border: `1px solid ${C.n300}`, borderRadius: 10, fontFamily: font, fontSize: 12, fontWeight: 600, color: C.n600, cursor: "pointer" }}
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>

      {/* footer */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", borderTop: `1px solid ${C.n200}`, background: C.n100 }}>
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

function RadioDot({ on }: { on: boolean }) {
  return (
    <span
      style={{
        width: 14,
        height: 14,
        borderRadius: "50%",
        border: `2px solid ${on ? C.kaha : C.n400}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: on ? `radial-gradient(circle, ${C.kaha} 40%, transparent 41%)` : undefined,
      }}
    />
  );
}

function Badge({ tone, children }: { tone: "kaha" | "neutral"; children: React.ReactNode }) {
  const bg = tone === "kaha" ? C.kaha100 : C.n200;
  const fg = tone === "kaha" ? C.kaha700 : C.n700;
  return (
    <span style={{ fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 700, background: bg, color: fg, padding: "3px 7px", borderRadius: 5 }}>
      {children}
    </span>
  );
}

/* Usage — real Fuji settlement, no wallet SDK needed:
  <SuiteasPayModal
    merchant="PropertyUp"
    merchantLogo="/assets/products/propertyup.png"
    amount={0.12}
    payUrl="https://your-suiteas-deploy.vercel.app/api/pay"
    onPaid={({ txHash, amount, network, simulated, address }) => console.log(txHash, amount, network, simulated, address)}
  />

  Pass connectWallet/sendPayment only to override the real client (e.g.
  previewConnect/previewPay from this file, for a walletless UI demo).
*/
