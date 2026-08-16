import { config } from "./config.js";
import { gatherEvidence } from "./evidence/index.js";
import { resolveWithAi } from "./ai/resolve.js";
import { hashEvidence, submitResolution } from "./chain/submit.js";
import type { MarketQuestion } from "./types.js";

/**
 * Runs one full resolution cycle for a given question:
 *   1. Gather evidence from independent sources
 *   2. Run the AI resolution pass (DeepSeek, or mock fixtures)
 *   3. Submit the verdict on-chain via VerdiktOracle.proposeResolution
 *
 * Usage: tsx src/index.ts
 * (edit the sample question below, or wire this up to a queue/API later)
 */
async function runResolutionCycle(question: MarketQuestion) {
  console.log(`\n=== Resolving: ${question.questionText} ===`);
  console.log(`Mode: ${config.mockMode ? "MOCK (no live API/chain calls)" : "LIVE"}`);

  const evidence = await gatherEvidence(question);
  console.log(`Gathered ${evidence.items.length} evidence item(s).`);

  const verdict = await resolveWithAi(question, evidence);
  console.log("AI verdict:", verdict);

  const evidenceHash = hashEvidence(evidence);
  const txHash = await submitResolution({ marketId: question.marketId, verdict, evidenceHash });

  if (txHash) {
    console.log("Submitted on-chain:", txHash);
  } else {
    console.log("(mock mode — nothing broadcast on-chain)");
  }
}

// Sample question for local/demo runs — swap in real market data as needed.
const sampleSportsQuestion: MarketQuestion = {
  marketId: "0x" + "1".repeat(64),
  category: "sports",
  questionText: "Did Team A win Match X on 2026-08-20?",
  resolutionCriteria: "Resolves YES if Team A wins per official match result.",
  resolveBy: Math.floor(Date.now() / 1000),
};

const sampleCryptoQuestion: MarketQuestion = {
  marketId: "0x" + "2".repeat(64),
  category: "crypto",
  questionText: "Was BTC >= $100,000 at 2026-08-20T00:00:00Z?",
  resolutionCriteria: "Resolves YES if the index price was at or above $100,000 at the specified time.",
  resolveBy: Math.floor(Date.now() / 1000),
};

async function main() {
  await runResolutionCycle(sampleSportsQuestion);
  await runResolutionCycle(sampleCryptoQuestion);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
