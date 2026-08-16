import type { EvidenceBundle, MarketQuestion } from "../types.js";
import { gatherSportsEvidence } from "./sports.js";
import { gatherCryptoEvidence } from "./crypto.js";

export async function gatherEvidence(question: MarketQuestion): Promise<EvidenceBundle> {
  const items =
    question.category === "sports"
      ? await gatherSportsEvidence(question)
      : await gatherCryptoEvidence(question);

  return { marketId: question.marketId, items };
}
