import { defineChain } from "viem";

/**
 * X Layer Testnet ("Terigon"), chain id 1952. Not preloaded in most wallets,
 * so useEnsureChain falls back to wallet_addEthereumChain when needed.
 */
export const xLayerTestnet = defineChain({
  id: 1952,
  name: "X Layer Testnet",
  nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testrpc.xlayer.tech/terigon"] },
  },
  blockExplorers: {
    default: {
      name: "OKX Explorer",
      url: "https://www.okx.com/web3/explorer/xlayer-test",
    },
  },
  testnet: true,
});

export function explorerAddressUrl(address: string) {
  return `${xLayerTestnet.blockExplorers.default.url}/address/${address}`;
}

export function explorerTxUrl(hash: string) {
  return `${xLayerTestnet.blockExplorers.default.url}/tx/${hash}`;
}
