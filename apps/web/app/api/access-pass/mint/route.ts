import { NextResponse, type NextRequest } from "next/server";
import { createPublicClient, createWalletClient, http, isAddress, type Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { FUJI_CHAIN_ID, getAddress } from "@suiteas/shared";

export const runtime = "nodejs";

/**
 * Mints the caller a Suiteas AccessPass — the soulbound membership credential
 * (contracts/src/AccessPass.sol) — after a real payment settles. Called from
 * the marketplace's subscribe flow once SuiteasPayModal's onPaid fires.
 * mint() is onlyOwner, so this runs server-side with the deploy/owner wallet;
 * it can't be called from the payer's own wallet.
 *
 * Always resolves 200 with { minted: boolean } — a failed/skipped mint never
 * blocks the payment that already succeeded.
 */

const ZERO = "0x0000000000000000000000000000000000000000";
const FUJI_RPC = process.env.NEXT_PUBLIC_FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc";

const fujiChain = {
  id: FUJI_CHAIN_ID,
  name: "Avalanche Fuji",
  nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
  rpcUrls: { default: { http: [FUJI_RPC] } },
} as const;

const accessPassAbi = [
  {
    type: "function",
    name: "passOf",
    stateMutability: "view",
    inputs: [{ name: "holder", type: "address" }],
    outputs: [{ name: "tokenId", type: "uint256" }],
  },
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [{ name: "to", type: "address" }],
    outputs: [{ name: "tokenId", type: "uint256" }],
  },
] as const;

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { address?: string } | null;
  const to = body?.address;
  if (!to || !isAddress(to)) {
    return NextResponse.json({ minted: false, reason: "invalid_address" }, { status: 400 });
  }

  const accessPass = getAddress("AccessPass");
  if (accessPass.toLowerCase() === ZERO) {
    return NextResponse.json({ minted: false, reason: "not_deployed" });
  }

  const publicClient = createPublicClient({ chain: fujiChain, transport: http(FUJI_RPC) });

  const existing = await publicClient.readContract({
    address: accessPass,
    abi: accessPassAbi,
    functionName: "passOf",
    args: [to as Address],
  });
  if (existing > 0n) {
    return NextResponse.json({ minted: false, reason: "already_has_pass", tokenId: existing.toString() });
  }

  const ownerKey = process.env.ACCESS_PASS_OWNER_PRIVATE_KEY;
  if (!ownerKey) {
    return NextResponse.json({ minted: false, reason: "owner_key_not_configured" });
  }

  try {
    const account = privateKeyToAccount(ownerKey as `0x${string}`);
    const walletClient = createWalletClient({ account, chain: fujiChain, transport: http(FUJI_RPC) });
    const hash = await walletClient.writeContract({
      address: accessPass,
      abi: accessPassAbi,
      functionName: "mint",
      args: [to as Address],
    });
    await publicClient.waitForTransactionReceipt({ hash });
    return NextResponse.json({ minted: true, txHash: hash });
  } catch (err) {
    return NextResponse.json({
      minted: false,
      reason: "mint_failed",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
