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
import type { NetworkId } from "./suiteas-pay-modal";

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

function getProvider(): Eip1193Provider {
  const eth = (window as unknown as { ethereum?: Eip1193Provider }).ethereum;
  if (!eth) throw new Error("No wallet found — install Core or MetaMask to pay with koha.");
  return eth;
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

/** Connects the injected wallet, switches to Fuji, and reads the USDC balance. */
export async function connectWallet(): Promise<{ address: string; balance: number }> {
  const provider = getProvider();
  const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
  const [address] = accounts;
  if (!address) throw new Error("No account returned by the wallet.");
  await ensureFuji(provider);
  const publicClient = createPublicClient({ chain: fujiChain, transport: http(FUJI_RPC) });
  const raw = (await publicClient.readContract({
    address: FUJI_USDC,
    abi: balanceOfAbi,
    functionName: "balanceOf",
    args: [address as Address],
  })) as bigint;
  return { address, balance: Number(formatUnits(raw, 6)) };
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

    const provider = getProvider();
    await ensureFuji(provider);
    const [address] = (await provider.request({ method: "eth_requestAccounts" })) as string[];

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
