export type Category = "sports" | "crypto";

export interface EvidenceItem {
  source: string;
  content: string;
}

export interface Verdict {
  outcome: boolean;
  confidenceBps: number;
  justification: string;
  evidence: EvidenceItem[];
}
