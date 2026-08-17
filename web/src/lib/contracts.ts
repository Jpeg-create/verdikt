/**
 * Real contracts on X Layer testnet (chain 1952). Unlike src/config.ts
 * (simulated console, fake data), everything here reads the real chain.
 */

export const ORACLE_ADDRESS = "0x073894D882A47b437d59E2FB89B40Cab2f0E2B38" as const;

/** The market driven end-to-end by contracts/scripts/demo-lifecycle.ts. Read-only proof. */
export const PROOF_MARKET_ADDRESS = "0x956b1B3A5b6043F6bc71DB6f4fa26cBaa7B8b6BA" as const;
export const PROOF_MARKET_ID =
  "0x9fa226f741f2431503f09367a99da3b2587a6e98b0b977be84c51802e55ee5d4" as const;

const UNSET_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

/** Standalone market for live visitor staking. Never finalized/settled, stays open. */
export const PLAYGROUND_MARKET_ADDRESS: `0x${string}` = "0x5E243f69d50a174E5d084DF693f340a66c928527";

export const isPlaygroundDeployed = PLAYGROUND_MARKET_ADDRESS !== UNSET_ADDRESS;

export const ORACLE_ABI = [
  {
    type: "function",
    name: "questions",
    stateMutability: "view",
    inputs: [{ name: "", type: "bytes32" }],
    outputs: [
      { name: "category", type: "uint8" },
      { name: "questionText", type: "string" },
      { name: "resolutionCriteria", type: "string" },
      { name: "createdAt", type: "uint256" },
      { name: "resolveBy", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "resolutions",
    stateMutability: "view",
    inputs: [{ name: "", type: "bytes32" }],
    outputs: [
      { name: "outcome", type: "bool" },
      { name: "confidenceBps", type: "uint16" },
      { name: "justification", type: "string" },
      { name: "evidenceHash", type: "bytes32" },
      { name: "proposedAt", type: "uint256" },
      { name: "disputeDeadline", type: "uint256" },
      { name: "status", type: "uint8" },
    ],
  },
] as const;

export const DEMO_MARKET_ABI = [
  {
    type: "function",
    name: "totalYes",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "totalNo",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "settled",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "yesStake",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "noStake",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "stakeYes",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "stakeNo",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
] as const;

/** Resolution.status enum mirrored from VerdiktOracle.sol. */
export const RESOLUTION_STATUS = ["none", "proposed", "disputed", "finalized"] as const;

/**
 * Tx hashes from running demo-lifecycle.ts on xlayerTestnet. Historical,
 * safe to hardcode. Current state (finalized/settled) is still read live.
 * Fill in the last three once finalize/settle/claim have run.
 */
export const PROOF_TRAIL = [
  { step: "Question created", tx: "0x73948bf6ef82c8f73813dbab71202c1b18c8cd8b3a661d95c8997197be47650b" },
  { step: "Staked YES + NO", tx: "0x9492991c6edf8d72e2c588ff67d9e350bca54752ad3e1e0c3d9e81695937b996" },
  { step: "Resolution proposed", tx: "0x6776c48cac2219a4ec23e3404450195a25908c6948303535b59c2f76715c1e03" },
  { step: "Resolution finalized", tx: "0xe9c3894e9c431faa562547298a31ae9441debf13bf552f0cd27d5b2a15078938" },
  { step: "Market settled", tx: "0xf399c321043d73024c8ef0548133fddd73b5e5522c61f0872757133833f4f2ba" },
  { step: "Payout claimed", tx: "0xae8371c58aa1007e35978db3a942500fdf6a370aa2d9a1a8df2d14619abcc4b2" },
] as const;
