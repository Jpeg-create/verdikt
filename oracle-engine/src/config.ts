import "dotenv/config";

function bool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
}

export const config = {
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY ?? "",
    baseUrl: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
    // "deepseek-chat" was the old default but no longer appears in DeepSeek's
    // current API docs as of this pass — the live chat-completions models
    // are deepseek-v4-flash (fast/cheap) and deepseek-v4-pro (heavier
    // reasoning). Using v4-flash as the default: verdict generation here is
    // a bounded evidence-reading task, not deep multi-step reasoning, so the
    // faster/cheaper tier is the right default. Override via DEEPSEEK_MODEL
    // if v4-pro is ever needed for a harder case.
    model: process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash",
  },
  chain: {
    rpcUrl: process.env.XLAYER_RPC_URL ?? "https://testrpc.xlayer.tech/terigon",
    chainId: Number(process.env.XLAYER_CHAIN_ID ?? 1952),
    oracleAddress: (process.env.ORACLE_CONTRACT_ADDRESS ?? "") as `0x${string}`,
    resolverPrivateKey: (process.env.RESOLVER_PRIVATE_KEY ?? "") as `0x${string}`,
  },
  evidence: {
    sportsApiKey: process.env.SPORTS_DATA_API_KEY ?? "",
    cryptoApiKey: process.env.CRYPTO_PRICE_API_KEY ?? "",
  },
  // Mock mode is the default so the project is runnable/demo-able with zero
  // credentials — flip to false once real keys and a funded resolver wallet
  // are wired up.
  mockMode: bool(process.env.MOCK_MODE, true),
};
