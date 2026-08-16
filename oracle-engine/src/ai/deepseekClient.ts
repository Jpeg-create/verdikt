import OpenAI from "openai";
import { config } from "../config.js";

// DeepSeek exposes an OpenAI-compatible chat completions API, so the
// official `openai` SDK works unmodified — just point baseURL at DeepSeek.
export function createDeepSeekClient(): OpenAI {
  if (!config.deepseek.apiKey) {
    throw new Error(
      "DEEPSEEK_API_KEY is not set. Set MOCK_MODE=true to run without a live API key."
    );
  }

  return new OpenAI({
    apiKey: config.deepseek.apiKey,
    baseURL: config.deepseek.baseUrl,
  });
}
