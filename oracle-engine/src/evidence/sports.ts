import { config } from "../config.js";
import type { EvidenceItem, MarketQuestion } from "../types.js";
import { mockSportsEvidence } from "../mock/fixtures.js";

/**
 * Gathers evidence for a sports outcome question.
 *
 * TODO (post-hackathon): wire to a real sports data API (final scores /
 * official results feed) using SPORTS_DATA_API_KEY. Left as a clean seam
 * so a real provider can be dropped in without touching the resolution
 * engine or contract layer.
 */
export async function gatherSportsEvidence(question: MarketQuestion): Promise<EvidenceItem[]> {
  if (config.mockMode || !config.evidence.sportsApiKey) {
    return mockSportsEvidence(question);
  }

  // Real implementation goes here once a sports data provider is picked.
  throw new Error("Live sports evidence source not yet wired up — set MOCK_MODE=true for now.");
}
