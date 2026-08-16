// Minimal ABI slice — only the functions the oracle engine needs to call.
// Keep in sync with contracts/contracts/VerdiktOracle.sol.
export const verdiktOracleAbi = [
  {
    type: "function",
    name: "proposeResolution",
    stateMutability: "nonpayable",
    inputs: [
      { name: "marketId", type: "bytes32" },
      { name: "outcome", type: "bool" },
      { name: "confidenceBps", type: "uint16" },
      { name: "justification", type: "string" },
      { name: "evidenceHash", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "createQuestion",
    stateMutability: "nonpayable",
    inputs: [
      { name: "marketId", type: "bytes32" },
      { name: "category", type: "uint8" },
      { name: "questionText", type: "string" },
      { name: "resolutionCriteria", type: "string" },
      { name: "resolveBy", type: "uint256" },
    ],
    outputs: [],
  },
] as const;
