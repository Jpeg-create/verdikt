import { useReadContracts } from "wagmi";
import { ORACLE_ABI, ORACLE_ADDRESS, PROOF_MARKET_ID, RESOLUTION_STATUS } from "../lib/contracts";
import { xLayerTestnet } from "../lib/chain";
import { useStalled } from "./useStalled";

const REFRESH_MS = 15_000;

/** Live-reads the real proof question + resolution from VerdiktOracle on X Layer testnet. */
export function useLiveOracle() {
  const { data, isLoading, isError } = useReadContracts({
    contracts: [
      {
        address: ORACLE_ADDRESS,
        abi: ORACLE_ABI,
        functionName: "questions",
        args: [PROOF_MARKET_ID],
        chainId: xLayerTestnet.id,
      },
      {
        address: ORACLE_ADDRESS,
        abi: ORACLE_ABI,
        functionName: "resolutions",
        args: [PROOF_MARKET_ID],
        chainId: xLayerTestnet.id,
      },
    ],
    query: { refetchInterval: REFRESH_MS, retry: 2, retryDelay: 1500 },
  });

  const question = data?.[0]?.result;
  const resolution = data?.[1]?.result;
  const stalled = useStalled(!!question);

  return {
    isLoading,
    isError: isError || stalled,
    question: question
      ? {
          category: question[0] === 0 ? ("sports" as const) : ("crypto" as const),
          questionText: question[1],
          resolutionCriteria: question[2],
          createdAt: question[3],
          resolveBy: question[4],
        }
      : null,
    resolution: resolution
      ? {
          outcome: resolution[0],
          confidenceBps: resolution[1],
          justification: resolution[2],
          evidenceHash: resolution[3],
          proposedAt: resolution[4],
          disputeDeadline: resolution[5],
          status: RESOLUTION_STATUS[resolution[6]],
        }
      : null,
  };
}
