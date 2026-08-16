import type { Category, Verdict } from "../types";

// Mirrors oracle-engine/src/mock/fixtures.ts so the frontend demo tells the
// same story as the actual backend's mock mode, without needing it running.
export async function resolveMock(category: Category, question: string): Promise<Verdict> {
  // Simulate evidence-gathering + AI latency for a realistic demo feel.
  await new Promise((r) => setTimeout(r, 1200));

  if (category === "sports") {
    return {
      outcome: true,
      confidenceBps: 9700,
      justification: `Two independent sources confirm the result satisfies the resolution criteria for: "${question}"`,
      evidence: [
        { source: "official-results-feed", content: "Final result confirmed by official league results feed." },
        { source: "secondary-sports-wire", content: "Independent wire report corroborates the final result." },
      ],
    };
  }

  return {
    outcome: true,
    confidenceBps: 9100,
    justification: `Two independent price indices agree the threshold was met for: "${question}"`,
    evidence: [
      { source: "price-index-a", content: "Index price at resolution time confirms the threshold was met." },
      { source: "price-index-b", content: "Secondary index confirms price within 0.1% of index A." },
    ],
  };
}
