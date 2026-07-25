"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TopUpButton } from "@/components/top-up-button";
import { MOCK_ADDRESS, PREVIEW_MOCK } from "@/lib/config/preview";

/** Persistent site nav — present on every page (wired into app/layout.tsx),
 *  so links between pages (and the wallet modal) are always reachable. */

const C = {
  paper: "#f3f2f2",
  ink: "#201e1d",
  kaha: "#ec3013",
  kaha700: "#a1200d",
  n200: "#e5e3e1",
  n500: "#7d7975",
} as const;

const navLink: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.02em",
  textDecoration: "none",
  color: C.ink,
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
  padding: "10px 16px",
  border: "2px solid transparent",
  cursor: "pointer",
  fontFamily: "var(--font-sans)",
  lineHeight: 1.1,
  background: C.kaha,
  color: C.paper,
};

/** Static "suite as" mark for the nav — no weave animation, just the logo. */
function NavMark() {
  return (
    <svg width={30} height={30} viewBox="0 0 200 200" role="img" aria-label="suite as">
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

function truncate(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function useWalletAddress(): string | undefined {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  return wallets[0]?.address ?? user?.wallet?.address ?? (PREVIEW_MOCK ? MOCK_ADDRESS : undefined);
}

function WalletModal({ onClose }: { onClose: () => void }) {
  const { logout } = usePrivy();
  const address = useWalletAddress();
  const router = useRouter();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="My Wallet"
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
          width: "min(420px, 100%)",
          maxHeight: "85vh",
          overflowY: "auto",
          background: C.paper,
          color: C.ink,
          border: `2px solid ${C.ink}`,
          fontFamily: "var(--font-sans)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 20px",
            borderBottom: `2px solid ${C.ink}`,
          }}
        >
          <span style={{ fontWeight: 800, fontSize: 18 }}>My Wallet</span>
          <span style={{ flex: 1 }} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, lineHeight: 1, color: C.ink }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 20 }}>
          {address ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#1a9d4b" }} />
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{truncate(address)}</span>
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: 13, color: C.n500 }}>Not connected yet.</p>
          )}

          <TopUpButton style={btnPrimary} showStatus />

          <div>
            <span
              style={{
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: 600,
                color: C.n500,
              }}
            >
              Your subscriptions
            </span>
            <div
              style={{
                marginTop: 8,
                display: "flex",
                alignItems: "center",
                gap: 12,
                border: `1px solid ${C.n200}`,
                padding: 12,
              }}
            >
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "#000",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 13,
                  flexShrink: 0,
                }}
              >
                F
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>finalfix.dev</div>
                <div style={{ fontSize: 12, color: C.n500 }}>Premium — $6/mo</div>
              </div>
            </div>
            <Link
              href="/marketplace"
              onClick={onClose}
              style={{ display: "inline-block", marginTop: 8, fontSize: 12, color: C.kaha700, textDecoration: "underline" }}
            >
              More info on the marketplace →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, borderTop: `1px solid ${C.n200}`, paddingTop: 16 }}>
            <span
              style={{
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: 600,
                color: C.n500,
              }}
            >
              Settings
            </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push("/dashboard");
              }}
              style={{ ...navLink, textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
              }}
              style={{ ...navLink, textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SiteNav() {
  const [walletOpen, setWalletOpen] = useState(false);

  return (
    <>
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: "20px 48px",
          borderBottom: `2px solid ${C.ink}`,
          flexWrap: "wrap",
          background: C.paper,
          fontFamily: "var(--font-sans)",
        }}
      >
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: C.ink }}
        >
          <NavMark />
          <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.02em" }}>suite as</span>
        </Link>
        <span style={{ flex: 1 }} />
        <Link href="/marketplace" style={navLink}>Find a product</Link>
        <Link href="/#trust" style={navLink}>About</Link>
        <Link href="/developers" style={navLink}>For developers</Link>
        <button type="button" onClick={() => setWalletOpen(true)} style={btnPrimary}>
          My Wallet
        </button>
      </nav>

      {walletOpen && <WalletModal onClose={() => setWalletOpen(false)} />}
    </>
  );
}
