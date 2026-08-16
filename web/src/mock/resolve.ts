import type { Category, PipelineEvent, Verdict } from "../types";

/** Wall-clock cost of a resolution run in the demo, from submission to verdict. */
export const RESOLUTION_LATENCY_MS = 1400;

export const SAMPLE_QUESTIONS: Record<Category, string> = {
  sports: "Did Team A win Match X on 2026-08-20?",
  crypto: "Was BTC >= $100,000 at 2026-08-20T00:00:00Z?",
};

/** questionId each sample maps to on-chain — the key VerdiktOracle stores proposals under. */
export const QUESTION_IDS: Record<Category, string> = {
  sports: "0x7f3a…d20c",
  crypto: "0xc45b…91ef",
};

/** keccak256 over the full evidence set, committed alongside the proposed outcome. */
export const EVIDENCE_HASHES: Record<Category, string> = {
  sports: "0x9c41…e7b2",
  crypto: "0x35d8…aa16",
};

// Mirrors oracle-engine/src/mock/fixtures.ts so the frontend demo tells the same
// story as the actual backend's mock mode, without needing it running.
const FIXTURES: Record<Category, Verdict> = {
  sports: {
    outcome: true,
    confidenceBps: 9700,
    justification:
      "Two independent sources confirm the result satisfies the resolution criteria: the official league feed and an unaffiliated wire report agree on the final score.",
    evidence: [
      {
        source: "official-results-feed",
        hash: "0x8b21…4ae0",
        content: "Final result confirmed by official league results feed.",
      },
      {
        source: "secondary-sports-wire",
        hash: "0x1fc9…77d3",
        content: "Independent wire report corroborates the final result.",
      },
    ],
  },
  crypto: {
    outcome: true,
    confidenceBps: 9100,
    justification:
      "Two independent price indices agree the threshold was met at the resolution timestamp, with under 0.1% divergence between them.",
    evidence: [
      {
        source: "price-index-a",
        hash: "0xd304…b1c8",
        content: "Index price at resolution time confirms the threshold was met.",
      },
      {
        source: "price-index-b",
        hash: "0x62ea…0f45",
        content: "Secondary index confirms price within 0.1% of index A.",
      },
    ],
  },
};

/** The engine's stdout for one resolution run, replayed on the timings it would really take. */
export function pipelineEvents(category: Category): PipelineEvent[] {
  const [first, second] = FIXTURES[category].evidence;

  return [
    { at: 0, time: "0.00s", tag: "engine", message: "resolution run started" },
    { at: 220, time: "0.22s", tag: "evidence", message: `fetch ${first.source} → 200 OK` },
    { at: 480, time: "0.48s", tag: "evidence", message: `fetch ${second.source} → 200 OK` },
    { at: 700, time: "0.70s", tag: "ai", message: "deepseek-chat resolution pass" },
    { at: 1080, time: "1.08s", tag: "verdict", message: "outcome + confidence returned" },
    { at: 1200, time: "1.20s", tag: "hash", message: "keccak256(evidence) committed" },
  ];
}

/** Resolves against canned evidence — no wallet, no funds and no API key required. */
export async function resolveMock(category: Category): Promise<Verdict> {
  await new Promise((resolve) => setTimeout(resolve, RESOLUTION_LATENCY_MS));
  return FIXTURES[category];
}
