import "dotenv/config";

function bool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
}

export const config = {
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY ?? "",
    baseUrl: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
    model: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
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
