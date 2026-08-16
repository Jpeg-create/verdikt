import type { AiVerdict, EvidenceItem, MarketQuestion } from "../types.js";

/**
 * Canned evidence + verdicts so the entire pipeline (evidence -> AI verdict
 * -> on-chain proposal) can be demoed by judges with zero credentials:
 * no DeepSeek API key, no funded wallet, no live data source calls.
 *
 * Set MOCK_MODE=false and fill in real keys to switch to live resolution.
 */

export function mockSportsEvidence(question: MarketQuestion): EvidenceItem[] {
  return [
    {
      source: "mock:official-results-feed",
      fetchedAt: Date.now(),
      content: `Final result: Team A defeated Team B, 2-1. Match completed and confirmed by the official league results feed. Question: "${question.questionText}"`,
    },
    {
      source: "mock:secondary-sports-wire",
      fetchedAt: Date.now(),
      content: "Independent wire report corroborates the 2-1 final score, no disputes or postponements noted.",
    },
  ];
}

export function mockCryptoEvidence(question: MarketQuestion): EvidenceItem[] {
  return [
    {
      source: "mock:price-index-a",
      fetchedAt: Date.now(),
      content: `Index price at resolution time: $101,240. Question: "${question.questionText}"`,
    },
    {
      source: "mock:price-index-b",
      fetchedAt: Date.now(),
      content: "Secondary index confirms price within 0.1% of index A at the same timestamp.",
    },
  ];
}

export function mockVerdictFor(question: MarketQuestion): AiVerdict {
  if (question.category === "sports") {
    return {
      outcome: true,
      confidenceBps: 9700,
      justification:
        "Two independent sources confirm Team A won 2-1 with no disputes; this satisfies the resolution criteria.",
    };
  }

  return {
    outcome: true,
    confidenceBps: 9100,
    justification:
      "Two independent price indices agree the threshold was met at the resolution timestamp within a tight tolerance.",
  };
}
