"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PRODUCTS, Product } from "./products";
import { SubscribeModal } from "./subscribe-modal";
import "./kiwi-stack-marketplace.css";

/* ------------------------------------------------------------------ */
/* Configuration                                                       */
/* ------------------------------------------------------------------ */

/**
 * The preferred products shown in the premium tier. Everything else in
 * PRODUCTS falls into the free community tier. Edit this list to re-curate.
 */
const PREMIUM_CODES = [
  "SP-002", // Doorstep
  "SP-005", // Ledgerly
  "SP-006", // Cadence
  "SP-008", // Tally
  "SP-010", // Beacon
  "SP-012", // Sprocket
  "SP-014", // Sounding
  "SP-016", // Mailroom
  "SP-019", // Semaphore
  "SP-022", // Vellum
  "SP-026", // Glasshouse
  "SP-031", // FinalFix
];

/**
 * Avalanche Fuji testnet, so subscriptions are paid with test AVAX for now.
 * For mainnet, switch chainId to "0xa86a", chainName to "Avalanche C-Chain",
 * the RPC to https://api.avax.network/ext/bc/C/rpc and the explorer to
 * https://snowtrace.io/. Free test AVAX: https://core.app/tools/testnet-faucet
 */
const AVALANCHE_CHAIN = {
  chainId: "0xa869",
  chainName: "Avalanche Fuji C-Chain",
  nativeCurrency: { name: "Avalanche", symbol: "AVAX", decimals: 18 },
  rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
  blockExplorerUrls: ["https://testnet.snowtrace.io/"],
};

/** Monthly price per premium product, in USD. Staggered from $6 to $45. */
const PREMIUM_PRICES_USD: Record<string, number> = {
  "SP-002": 12, // Doorstep
  "SP-005": 18, // Ledgerly
  "SP-006": 8,  // Cadence
  "SP-008": 22, // Tally
  "SP-010": 15, // Beacon
  "SP-012": 10, // Sprocket
  "SP-014": 20, // Sounding
  "SP-016": 9,  // Mailroom
  "SP-019": 26, // Semaphore
  "SP-022": 30, // Vellum
  "SP-026": 45, // Glasshouse
  "SP-031": 6,  // FinalFix
};

function priceUsd(code: string): number {
  return PREMIUM_PRICES_USD[code] ?? 15;
}

const SEARCH_PLACEHOLDER =
  "Say what you need, let us find the perfect stack for you";

/* ------------------------------------------------------------------ */
/* Browser API typings (wallet + speech) not present in standard TS libs */
/* ------------------------------------------------------------------ */

interface EthereumProvider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on?(event: string, handler: (...args: unknown[]) => void): void;
  removeListener?(event: string, handler: (...args: unknown[]) => void): void;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onresult: ((event: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

declare global {
  interface Window {
    // Not `ethereum` here: viem already augments Window.ethereum globally
    // (as EIP1193Provider) and a conflicting redeclaration breaks the whole
    // app's typecheck. getEthereum() below casts locally instead.
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

/** window.ethereum, cast locally so this file doesn't fight viem's own
 *  global Window.ethereum augmentation (see the comment above). */
function getEthereum(): EthereumProvider | undefined {
  return (window as unknown as { ethereum?: EthereumProvider }).ethereum;
}

/* ------------------------------------------------------------------ */
/* Keyword search over product descriptions                            */
/* ------------------------------------------------------------------ */

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "but", "by", "can", "do", "for",
  "from", "get", "have", "i", "in", "is", "it", "me", "my", "need", "of",
  "on", "or", "our", "so", "some", "something", "that", "the", "them",
  "this", "to", "us", "want", "we", "what", "will", "with", "you", "your",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

/**
 * Scores a product against the query keywords. Name and category hits are
 * weighted above description hits; substring matches count for less than
 * whole-word matches so "invoice" still surfaces "invoiced".
 */
function scoreProduct(product: Product, keywords: string[]): number {
  if (keywords.length === 0) return 0;
  const name = product.name.toLowerCase();
  const category = product.category.toLowerCase();
  const descWords = tokenize(product.description);
  const descText = product.description.toLowerCase();

  let score = 0;
  for (const kw of keywords) {
    if (name.includes(kw)) score += 5;
    if (category.includes(kw)) score += 3;
    for (const word of descWords) {
      if (word === kw) score += 2;
      else if (word.startsWith(kw) || kw.startsWith(word)) score += 0.5;
    }
    if (descText.includes(kw)) score += 0.5;
  }
  return score;
}

/* ------------------------------------------------------------------ */
/* Wallet hook                                                         */
/* ------------------------------------------------------------------ */

type WalletStatus = "disconnected" | "connecting" | "connected";

function useAvalancheWallet() {
  const [status, setStatus] = useState<WalletStatus>("disconnected");
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const eth = getEthereum();
    if (!eth?.on) return;
    const onAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      const [first] = accounts;
      if (!first) {
        setStatus("disconnected");
        setAddress(null);
      } else {
        setAddress(first);
      }
    };
    eth.on("accountsChanged", onAccountsChanged);
    return () => eth.removeListener?.("accountsChanged", onAccountsChanged);
  }, []);

  const connect = useCallback(async () => {
    const eth = getEthereum();
    if (!eth) {
      setError(
        "No wallet found. Install Core or MetaMask to sign in with your wallet."
      );
      return;
    }
    setError(null);
    setStatus("connecting");
    try {
      const accounts = (await eth.request({
        method: "eth_requestAccounts",
      })) as string[];
      const [first] = accounts;
      if (!first) throw new Error("No account returned by the wallet.");
      try {
        await eth.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: AVALANCHE_CHAIN.chainId }],
        });
      } catch {
        // Chain not added to the wallet yet, so offer to add it.
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [AVALANCHE_CHAIN],
        });
      }
      setAddress(first);
      setStatus("connected");
    } catch {
      setStatus("disconnected");
      setError("Wallet connection was cancelled.");
    }
  }, []);

  return { status, address, error, connect };
}

/* ------------------------------------------------------------------ */
/* Voice search hook                                                   */
/* ------------------------------------------------------------------ */

function useVoiceSearch(onTranscript: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [supported] = useState(
    () =>
      typeof window !== "undefined" &&
      Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition)
  );
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const toggle = useCallback(() => {
    if (!supported) return;
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition!;
    const recognition = new Ctor();
    recognition.lang = "en-NZ";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const result = event.results[0]?.[0];
      if (result) onTranscript(result.transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }, [supported, listening, onTranscript]);

  return { listening, supported, toggle };
}

/* ------------------------------------------------------------------ */
/* Components                                                          */
/* ------------------------------------------------------------------ */

interface ProductCardProps {
  product: Product;
  premium: boolean;
  walletConnected: boolean;
  onSubscribe: (product: Product) => void;
  onConnect: () => void;
  isMatch?: boolean;
}

function ProductCard({
  product,
  premium,
  walletConnected,
  onSubscribe,
  onConnect,
  isMatch,
}: ProductCardProps) {
  return (
    <article
      className={`ksm-card ${premium ? "ksm-card--premium" : ""}`}
      data-code={product.code}
    >
      <div className="ksm-card-head">
        <span
          className="ksm-card-icon"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: product.iconSvg }}
        />
        <div>
          <h3 className="ksm-card-name">{product.name}</h3>
          <span className="ksm-card-category">{product.category}</span>
        </div>
        {isMatch && <span className="ksm-badge ksm-badge--match">Match</span>}
      </div>
      <p className="ksm-card-desc">{product.description}</p>
      <div className="ksm-card-actions">
        {premium ? (
          <button
            type="button"
            className="ksm-btn ksm-btn--avax"
            onClick={() => onSubscribe(product)}
          >
            Subscribe for ${priceUsd(product.code)}/mo
          </button>
        ) : walletConnected ? (
          <button type="button" className="ksm-btn ksm-btn--free">
            Try for free, pay with koha
          </button>
        ) : (
          <button
            type="button"
            className="ksm-btn ksm-btn--locked"
            onClick={onConnect}
          >
            Sign in with wallet to unlock
          </button>
        )}
      </div>
    </article>
  );
}

export default function KiwiStackMarketplace() {
  const [query, setQuery] = useState("");
  const [subscribeNotice, setSubscribeNotice] = useState<string | null>(null);
  const [subscribeProduct, setSubscribeProduct] = useState<Product | null>(null);
  const wallet = useAvalancheWallet();
  const voice = useVoiceSearch((transcript) => setQuery(transcript));
  const inputRef = useRef<HTMLInputElement>(null);

  const premiumProducts = useMemo(
    () =>
      PREMIUM_CODES.map((code) =>
        PRODUCTS.find((p) => p.code === code)
      ).filter((p): p is Product => Boolean(p)),
    []
  );
  const freeProducts = useMemo(
    () => PRODUCTS.filter((p) => !PREMIUM_CODES.includes(p.code)),
    []
  );

  const keywords = useMemo(() => tokenize(query), [query]);
  const matches = useMemo(() => {
    if (keywords.length === 0) return [];
    return PRODUCTS.map((product) => ({
      product,
      score: scoreProduct(product, keywords),
    }))
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [keywords]);

  const walletConnected = wallet.status === "connected";

  /** Opens the real subscribe modal (wallet-as-identity + x402 settlement on
   *  Avalanche Fuji) instead of hand-rolling a payment transfer here. */
  const handleSubscribe = useCallback((product: Product) => {
    setSubscribeProduct(product);
  }, []);

  const handleSubscribed = useCallback((product: Product, address: string) => {
    setSubscribeNotice(`Subscribed to ${product.name}. Welcome aboard.`);
    if (product.url) window.open(product.url, "_blank", "noopener");
    // Wallet-as-identity: mint the AccessPass soulbound credential for this
    // wallet if it doesn't already have one. Best-effort — a failed/skipped
    // mint (e.g. AccessPass not deployed yet) never blocks the subscription
    // that already succeeded.
    if (address) {
      fetch("/api/access-pass/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      }).catch(() => {});
    }
  }, []);

  return (
    <div className="ksm-page">
      {/* ---------------- Search bar across the top ---------------- */}
      <header className="ksm-header">
        <div className={`ksm-search ${voice.listening ? "ksm-search--listening" : ""}`}>
          <svg className="ksm-search-glass" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              d="M10.5 3a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15Zm5.8 13.3L21 21"
            />
          </svg>
          <input
            ref={inputRef}
            type="search"
            className="ksm-search-input"
            placeholder={SEARCH_PLACEHOLDER}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search the suite"
          />
          <button
            type="button"
            className={`ksm-mic ${voice.listening ? "ksm-mic--on" : ""}`}
            onClick={voice.toggle}
            disabled={!voice.supported}
            title={
              voice.supported
                ? voice.listening
                  ? "Stop listening"
                  : "Talk to us, describe what you need"
                : "Voice search is not supported in this browser"
            }
            aria-label="Voice search"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.93V21h2v-3.07A7 7 0 0 0 19 11h-2Z"
              />
            </svg>
          </button>
        </div>
        {voice.listening && (
          <p className="ksm-listening-hint">Listening. Say what you need.</p>
        )}
      </header>

      <main className="ksm-main">
        {wallet.error && <p className="ksm-notice">{wallet.error}</p>}
        {subscribeNotice && (
          <p className="ksm-notice">
            {subscribeNotice}{" "}
            <button
              type="button"
              className="ksm-notice-dismiss"
              onClick={() => setSubscribeNotice(null)}
            >
              Dismiss
            </button>
          </p>
        )}

        {/* ---------------- Search results ---------------- */}
        {keywords.length > 0 && (
          <section className="ksm-section">
            <span className="ksm-kicker">Best matches</span>
            <h2 className="ksm-section-title">
              {matches.length > 0
                ? "Your recommended stack"
                : "No matches, try different words"}
            </h2>
            {matches.length > 0 && (
              <p className="ksm-section-sub">
                Strongest keyword matches for "{query.trim()}".
              </p>
            )}
            <div className="ksm-grid">
              {matches.map(({ product }) => (
                <ProductCard
                  key={product.code}
                  product={product}
                  premium={PREMIUM_CODES.includes(product.code)}
                  walletConnected={walletConnected}
                  onSubscribe={handleSubscribe}
                  onConnect={wallet.connect}
                  isMatch
                />
              ))}
            </div>
          </section>
        )}

        {/* ---------------- Premium tier ---------------- */}
        <section className="ksm-section">
          <span className="ksm-kicker">Premium</span>
          <h2 className="ksm-section-title">Our preferred picks</h2>
          <p className="ksm-section-sub">Hand picked SaaS from startups across Aotearoa.</p>
          <div className="ksm-grid">
            {premiumProducts.map((product) => (
              <ProductCard
                key={product.code}
                product={product}
                premium
                walletConnected={walletConnected}
                onSubscribe={handleSubscribe}
                onConnect={wallet.connect}
              />
            ))}
          </div>
        </section>

        {/* ---------------- Free community tier ---------------- */}
        <section className="ksm-section">
          <span className="ksm-kicker">Community</span>
          <h2 className="ksm-section-title">Free with your wallet</h2>
          <p className="ksm-section-sub">
            Sign in with your wallet and use these free. Your koha lands in the
            pool and splits across every product you used.
          </p>
          <div className="ksm-grid">
            {freeProducts.map((product) => (
              <ProductCard
                key={product.code}
                product={product}
                premium={false}
                walletConnected={walletConnected}
                onSubscribe={handleSubscribe}
                onConnect={wallet.connect}
              />
            ))}
          </div>
        </section>
      </main>

      <footer className="ksm-footer">
        <p className="ksm-footer-line">
          He waka eke noa. We are all in this together.
        </p>
        <p className="ksm-footer-small">
          Built by startups, for startups, in Aotearoa. Subscriptions settle over
          x402 on Avalanche C-Chain.
        </p>
      </footer>

      {subscribeProduct && (
        <SubscribeModal
          product={subscribeProduct}
          priceUsd={priceUsd(subscribeProduct.code)}
          onClose={() => setSubscribeProduct(null)}
          onSubscribed={handleSubscribed}
        />
      )}
    </div>
  );
}
