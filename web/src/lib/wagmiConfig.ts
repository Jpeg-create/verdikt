import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { xLayerTestnet } from "./chain";

/** Injected-only (MetaMask, OKX Wallet, etc). No WalletConnect project id needed. */
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
