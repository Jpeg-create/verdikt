import { createPublicClient, createWalletClient, http, defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { config } from "../config.js";

export const xLayer = defineChain({
  id: config.chain.chainId,
  name: config.chain.chainId === 196 ? "X Layer" : "X Layer Testnet (Terigon)",
  nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
  rpcUrls: {
    default: { http: [config.chain.rpcUrl] },
  },
});

export const publicClient = createPublicClient({
  chain: xLayer,
  transport: http(),
});

export function getWalletClient() {
  if (!config.chain.resolverPrivateKey) {
    throw new Error(
      "RESOLVER_PRIVATE_KEY is not set. Set MOCK_MODE=true to skip on-chain submission."
    );
  }

  const account = privateKeyToAccount(config.chain.resolverPrivateKey);

  return createWalletClient({
    account,
    chain: xLayer,
    transport: http(),
  });
}
