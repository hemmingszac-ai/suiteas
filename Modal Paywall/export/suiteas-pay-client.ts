/** Real wallet + x402 payment client for SuiteasPayModal.
 *  No Privy/wagmi — this has to work standalone on a bare HTML page, so it
 *  talks to whatever EIP-1193 wallet the page has (Core, MetaMask, etc) via
 *  window.ethereum, and settles through x402-fetch against a hosted koha
 *  resource route (see /api/pay in the main app). Chain is always Avalanche
 *  Fuji testnet — never mainnet. */

import {
  createPublicClient,
  createWalletClient,
  custom,
  formatUnits,
  http,
  publicActions,
  type Address,
} from "viem";
import { decodeXPaymentResponse, wrapFetchWithPayment } from "x402-fetch";
import type { NetworkId } from "./SuiteasPayModal";

export const FUJI_CHAIN_ID = 43_113;
const FUJI_CHAIN_ID_HEX = "0xa869";
const FUJI_RPC = "https://api.avax-test.network/ext/bc/C/rpc";
const FUJI_USDC = "0x5425890298aed601595a70AB815c96711a31Bc65" as Address;
// x402-fetch's wrapFetchWithPayment defaults to a 0.10 USDC cap — override it
// generously (USDC has 6 decimals): $100,000, effectively no ceiling here.
const MAX_PAYMENT_BASE_UNITS = 100_000_000_000n;

const fujiChain = {
  id: FUJI_CHAIN_ID,
  name: "Avalanche Fuji",
  nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
  rpcUrls: { default: { http: [FUJI_RPC] } },
} as const;

const balanceOfAbi = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

type Eip6963ProviderDetail = {
  info: { uuid: string; name: string; icon: string; rdns: string };
  provider: Eip1193Provider;
};

/** Modern wallets increasingly avoid claiming window.ethereum outright,
 *  especially with more than one wallet extension installed — they announce
 *  themselves via EIP-6963 instead so multiple wallets can coexist without
 *  clobbering each other. Checking window.ethereum alone misses those, which
 *  looks like "no wallet found" even with a real, unlocked wallet installed. */
function discoverEip6963Provider(): Promise<Eip1193Provider | undefined> {
  return new Promise((resolve) => {
    const found: Eip6963ProviderDetail[] = [];
    const onAnnounce = (event: Event) => {
      const detail = (event as CustomEvent<Eip6963ProviderDetail>).detail;
      if (detail?.provider) found.push(detail);
    };
    window.addEventListener("eip6963:announceProvider", onAnnounce);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    setTimeout(() => {
      window.removeEventListener("eip6963:announceProvider", onAnnounce);
      // Prefer Core (this project's primary wallet) if more than one answers.
      const core = found.find((d) => /core/i.test(d.info.name));
      resolve((core ?? found[0])?.provider);
    }, 250);
  });
}

async function getProvider(): Promise<Eip1193Provider> {
  const eip6963 = await discoverEip6963Provider();
  if (eip6963) return eip6963;
  const eth = (window as unknown as { ethereum?: Eip1193Provider }).ethereum;
  if (!eth) throw new Error("No wallet found — install Core or MetaMask to pay with koha.");
  return eth;
}

/** Wallet extensions can hang instead of rejecting (a popup opened off-screen,
 *  a stuck extension, a flaky public RPC) — without this, a hung call spins
 *  the "Waking your wallet..." step forever with no way out. */
function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });
}

async function ensureFuji(provider: Eip1193Provider) {
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: FUJI_CHAIN_ID_HEX }],
    });
  } catch (err) {
    const code = (err as { code?: number })?.code;
    if (code !== 4902) throw err;
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: FUJI_CHAIN_ID_HEX,
          chainName: "Avalanche Fuji Testnet",
          nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
          rpcUrls: [FUJI_RPC],
          blockExplorerUrls: ["https://testnet.snowtrace.io"],
        },
      ],
    });
  }
}

/** Connects the injected wallet, switches to Fuji, and reads the USDC balance.
 *  The wallet popup steps get a generous timeout (a human has to click
 *  something); the balance read gets a short one and never blocks a
 *  successful connection — it's informational, not required to pay. */
export async function connectWallet(): Promise<{ address: string; balance: number }> {
  const provider = await getProvider();
  const accounts = await withTimeout(
    provider.request({ method: "eth_requestAccounts" }) as Promise<string[]>,
    45_000,
    "Wallet didn't respond. Check for a wallet popup (it may be behind this window), or try again.",
  );
  const [address] = accounts;
  if (!address) throw new Error("No account returned by the wallet.");

  await withTimeout(
    ensureFuji(provider),
    45_000,
    "Wallet didn't respond to the network switch. Check for a wallet popup, or switch to Avalanche Fuji manually and try again.",
  );

  let balance = 0;
  try {
    const publicClient = createPublicClient({
      chain: fujiChain,
      transport: http(FUJI_RPC, { timeout: 8_000, retryCount: 1 }),
    });
    const raw = await withTimeout(
      publicClient.readContract({
        address: FUJI_USDC,
        abi: balanceOfAbi,
        functionName: "balanceOf",
        args: [address as Address],
      }) as Promise<bigint>,
      10_000,
      "Balance read timed out",
    );
    balance = Number(formatUnits(raw, 6));
  } catch {
    // Fuji's public RPC is occasionally slow/rate-limited. The balance shown
    // is informational only — don't block a successful wallet connection over it.
  }

  return { address, balance };
}

/** Base Sepolia has no real facilitator/contract wired up here — the network
 *  option exists as the Fire Eyes developer-track sandbox, always simulated. */
function simulatePayment(): Promise<{ txHash: string; seconds: number }> {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ txHash: "0x3c81…b4f7", seconds: 0.87 }), 1400),
  );
}

/** Builds a sendPayment for a given hosted /api/pay endpoint + merchant.
 *  Only "avalanche" actually settles — "sepolia" simulates (see above). */
export function makeSendPayment(payUrl: string, merchant: string) {
  return async function sendPayment(
    amount: number,
    network: NetworkId,
  ): Promise<{ txHash: string; seconds: number }> {
    if (network === "sepolia") return simulatePayment();

    const provider = await getProvider();
    await withTimeout(ensureFuji(provider), 45_000, "Wallet didn't respond to the network switch. Check for a wallet popup, or try again.");
    const accounts = await withTimeout(
      provider.request({ method: "eth_requestAccounts" }) as Promise<string[]>,
      45_000,
      "Wallet didn't respond. Check for a wallet popup (it may be behind this window), or try again.",
    );
    const [address] = accounts;
    if (!address) throw new Error("No account returned by the wallet.");

    const walletClient = createWalletClient({
      account: address as Address,
      chain: fujiChain,
      transport: custom(provider),
    }).extend(publicActions);

    // wrapFetchWithPayment defaults maxValue to 0.10 USDC — way below a real
    // subscription price. No real ceiling for this demo; users should be able
    // to pay more than the sticker price, just not less (see minAmount).
    const fetchWithPay = wrapFetchWithPayment(fetch, walletClient, MAX_PAYMENT_BASE_UNITS);
    const url = new URL(payUrl, window.location.href);
    url.searchParams.set("amount", amount.toFixed(3));
    url.searchParams.set("merchant", merchant);
    url.searchParams.set("track", network);

    const started = performance.now();
    const res = await fetchWithPay(url.toString(), { method: "GET" });
    if (!res.ok) throw new Error(`Payment failed (${res.status})`);

    const header = res.headers.get("x-payment-response");
    const settled = header ? decodeXPaymentResponse(header) : undefined;
    const seconds = Math.round(((performance.now() - started) / 1000) * 100) / 100;
    return { txHash: settled?.transaction ?? "settled", seconds };
  };
}
