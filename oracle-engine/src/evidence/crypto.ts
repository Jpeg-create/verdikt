import { config } from "../config.js";
import type { EvidenceItem, MarketQuestion } from "../types.js";
import { mockCryptoEvidence } from "../mock/fixtures.js";

/**
 * Gathers evidence for a crypto price/threshold question
 * (e.g. "was BTC >= $X at time T").
 *
 * TODO (post-hackathon): wire to a real price feed / index API using
 * CRYPTO_PRICE_API_KEY. Left as a clean seam so a real provider can be
 * dropped in without touching the resolution engine or contract layer.
 */
export async function gatherCryptoEvidence(question: MarketQuestion): Promise<EvidenceItem[]> {
  if (config.mockMode || !config.evidence.cryptoApiKey) {
    return mockCryptoEvidence(question);
  }

  throw new Error("Live crypto evidence source not yet wired up — set MOCK_MODE=true for now.");
}
