import { keccak256, toHex, stringToHex } from "viem";
import { config } from "../config.js";
import { verdiktOracleAbi } from "./abi.js";
import { publicClient, getWalletClient } from "./client.js";
import type { EvidenceBundle, ResolutionResult } from "../types.js";

export function hashEvidence(bundle: EvidenceBundle): `0x${string}` {
  const serialized = JSON.stringify(bundle.items);
  return keccak256(stringToHex(serialized));
}

/**
 * Submits a resolved verdict to VerdiktOracle.proposeResolution.
 * In mock mode, this logs what WOULD be submitted instead of sending a
 * real transaction — lets the full pipeline run without a funded wallet.
 */
export async function submitResolution(result: ResolutionResult): Promise<string | null> {
  if (config.mockMode || !config.chain.resolverPrivateKey || !config.chain.oracleAddress) {
    console.log("[mock] Would submit to VerdiktOracle.proposeResolution:", {
      marketId: result.marketId,
      outcome: result.verdict.outcome,
      confidenceBps: result.verdict.confidenceBps,
      justification: result.verdict.justification,
      evidenceHash: result.evidenceHash,
    });
    return null;
  }

  const wallet = getWalletClient();

  const hash = await wallet.writeContract({
    address: config.chain.oracleAddress,
    abi: verdiktOracleAbi,
    functionName: "proposeResolution",
    args: [
      result.marketId as `0x${string}`,
      result.verdict.outcome,
      result.verdict.confidenceBps,
      result.verdict.justification,
      result.evidenceHash,
    ],
  });

  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}
