import { z } from "zod";
import { createDeepSeekClient } from "./deepseekClient.js";
import { config } from "../config.js";
import type { AiVerdict, EvidenceBundle, MarketQuestion } from "../types.js";
import { mockVerdictFor } from "../mock/fixtures.js";

const VerdictSchema = z.object({
  outcome: z.boolean(),
  confidenceBps: z.number().int().min(0).max(10_000),
  justification: z.string().min(1).max(600),
});

function buildPrompt(question: MarketQuestion, evidence: EvidenceBundle): string {
  const evidenceText = evidence.items
    .map((item, i) => `[${i + 1}] Source: ${item.source}\n${item.content}`)
    .join("\n\n");

  return `You are Verdikt, an AI outcome-resolution oracle for on-chain prediction/outcome markets.

Category: ${question.category}
Question: ${question.questionText}
Resolution criteria: ${question.resolutionCriteria}

Evidence gathered from independent sources:
${evidenceText}

Based ONLY on the evidence above, determine whether the resolution criteria were met.
Respond with strict JSON matching this shape, and nothing else:
{
  "outcome": boolean,      // true if the criteria were met (YES), false otherwise (NO)
  "confidenceBps": number, // 0-10000, your confidence in this verdict in basis points
  "justification": string  // 1-3 sentences citing the specific evidence that supports your verdict
}

If the evidence is insufficient, ambiguous, or contradictory, reflect that with a LOW confidenceBps
rather than guessing. Do not invent facts not present in the evidence.`;
}

/**
 * Runs one AI resolution pass over a question + evidence bundle.
 * In mock mode, returns a canned verdict so the full pipeline (evidence ->
 * AI -> on-chain proposal) can be demoed without a live DeepSeek key.
 */
export async function resolveWithAi(
  question: MarketQuestion,
  evidence: EvidenceBundle
): Promise<AiVerdict> {
  if (config.mockMode) {
    return mockVerdictFor(question);
  }

  const client = createDeepSeekClient();

  const completion = await client.chat.completions.create({
    model: config.deepseek.model,
    messages: [
      {
        role: "system",
        content:
          "You are a precise, evidence-grounded outcome-resolution oracle. Always respond with valid JSON only.",
      },
      { role: "user", content: buildPrompt(question, evidence) },
    ],
    temperature: 0.1,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = VerdictSchema.parse(JSON.parse(raw));
  return parsed;
}
