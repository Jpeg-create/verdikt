import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { xLayerTestnet } from "./chain";

/**
 * Injected-only (MetaMask, OKX Wallet, etc). No WalletConnect project id needed.
 * EIP-6963 wallets are auto-discovered via multiInjectedProviderDiscovery (default
 * on) regardless of window.ethereum; injected() below is just a fallback connector
 * for wallets that predate EIP-6963 and only set window.ethereum directly.
 */
export const wagmiConfig = createConfig({
  chains: [xLayerTestnet],
  connectors: [injected()],
  transports: {
    [xLayerTestnet.id]: http(),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
