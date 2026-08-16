export type Category = "sports" | "crypto";

export interface EvidenceItem {
  source: string;
  /** keccak256 of the fetched snapshot, committed on-chain with the proposal. */
  hash: string;
  content: string;
}

export interface Verdict {
  outcome: boolean;
  confidenceBps: number;
  justification: string;
  evidence: EvidenceItem[];
}

export type PipelineTag = "engine" | "evidence" | "ai" | "verdict" | "hash";

export interface PipelineEvent {
  /** Milliseconds after submission at which the engine emits this line. */
  at: number;
  time: string;
  tag: PipelineTag;
  message: string;
}

export type ResolutionStage = "idle" | "resolving" | "resolved";

export type MarketPhase = "staking" | "dispute" | "settled";

export type StakeSide = "yes" | "no";
