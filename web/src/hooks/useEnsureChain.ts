import { useCallback } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { xLayerTestnet } from "../lib/chain";

/**
 * X Layer testnet isn't preloaded in most wallets. switchChain() fails with
 * error code 4902 if the wallet has never seen the chain; fall back to
 * wallet_addEthereumChain directly in that case.
 */
export function useEnsureChain() {
  const { chainId, connector } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const ensureChain = useCallback(async () => {
    if (chainId === xLayerTestnet.id) return;

    try {
      await switchChainAsync({ chainId: xLayerTestnet.id });
    } catch (error) {
      const code = (error as { code?: number; cause?: { code?: number } })?.code
        ?? (error as { cause?: { code?: number } })?.cause?.code;

      if (code !== 4902) throw error;

      const provider = (await connector?.getProvider?.()) as
        | { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> }
        | undefined;
      if (!provider) throw error;

      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x${xLayerTestnet.id.toString(16)}`,
            chainName: xLayerTestnet.name,
            nativeCurrency: xLayerTestnet.nativeCurrency,
            rpcUrls: xLayerTestnet.rpcUrls.default.http,
            blockExplorerUrls: [xLayerTestnet.blockExplorers.default.url],
          },
        ],
      });
    }
  }, [chainId, connector, switchChainAsync]);

  return { ensureChain, isWrongChain: !!chainId && chainId !== xLayerTestnet.id };
}
