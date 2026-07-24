import { createConfig } from "@privy-io/wagmi";
import { http } from "wagmi";
import { chain, rpcUrl } from "./chain";

/**
 * wagmi config bridged to Privy. Privy owns connectors (Core, MetaMask, etc.);
 * wagmi just gives us hooks for chain reads/writes.
 */
export const wagmiConfig = createConfig({
  chains: [chain],
  transports: {
    [chain.id]: http(rpcUrl),
  },
});
