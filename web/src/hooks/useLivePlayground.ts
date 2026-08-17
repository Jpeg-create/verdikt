import { useEffect } from "react";
import { parseEther } from "viem";
import { useAccount, useReadContracts, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { DEMO_MARKET_ABI, isPlaygroundDeployed, PLAYGROUND_MARKET_ADDRESS } from "../lib/contracts";
import { xLayerTestnet } from "../lib/chain";
import { useStalled } from "./useStalled";

const REFRESH_MS = 8_000;
export const PLAYGROUND_STAKE_OKB = "0.001";

/** Live totals + a real stakeYes/stakeNo write flow against the playground market. */
export function useLivePlayground() {
  const { address } = useAccount();

  const { data, refetch, isError: isReadError } = useReadContracts({
    contracts: [
      {
        address: PLAYGROUND_MARKET_ADDRESS,
        abi: DEMO_MARKET_ABI,
        functionName: "totalYes",
        chainId: xLayerTestnet.id,
      },
      {
        address: PLAYGROUND_MARKET_ADDRESS,
        abi: DEMO_MARKET_ABI,
        functionName: "totalNo",
        chainId: xLayerTestnet.id,
      },
    ],
    query: { refetchInterval: REFRESH_MS, retry: 2, retryDelay: 1500, enabled: isPlaygroundDeployed },
  });

  const { writeContractAsync, data: txHash, isPending: isSubmitting, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: !!txHash },
  });

  useEffect(() => {
    if (isConfirmed) refetch();
  }, [isConfirmed, refetch]);

  const stalled = useStalled(!isPlaygroundDeployed || !!data);

  async function stake(side: "yes" | "no") {
    const hash = await writeContractAsync({
      address: PLAYGROUND_MARKET_ADDRESS,
      abi: DEMO_MARKET_ABI,
      functionName: side === "yes" ? "stakeYes" : "stakeNo",
      value: parseEther(PLAYGROUND_STAKE_OKB),
      chainId: xLayerTestnet.id,
    });
    return hash;
  }

  return {
    connectedAddress: address,
    isPlaygroundDeployed,
    totalYes: data?.[0]?.result ?? 0n,
    totalNo: data?.[1]?.result ?? 0n,
    isReadError: isReadError || stalled,
    stake,
    txHash,
    isSubmitting,
    isConfirming,
    isConfirmed,
    error,
    refetch,
  };
}
