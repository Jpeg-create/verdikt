export type Category = "sports" | "crypto";

export interface MarketQuestion {
  marketId: string; // bytes32 hex string, matches VerdiktOracle.createQuestion
  category: Category;
  questionText: string;
  resolutionCriteria: string;
  resolveBy: number; // unix timestamp
}

export interface EvidenceItem {
  source: string;
  fetchedAt: number;
  content: string; // raw or lightly structured evidence text
}

export interface EvidenceBundle {
  marketId: string;
  items: EvidenceItem[];
}

export interface AiVerdict {
  outcome: boolean; // true = YES, false = NO
  confidenceBps: number; // 0-10000
  justification: string;
}

export interface ResolutionResult {
  marketId: string;
  verdict: AiVerdict;
  evidenceHash: `0x${string}`;
}
