import { config } from "../config.js";
import type { EvidenceItem, MarketQuestion } from "../types.js";
import { mockCryptoEvidence } from "../mock/fixtures.js";

/**
 * Minimal ticker -> {CoinGecko id, Binance symbol} map for the assets this
 * oracle currently resolves questions about. Extend as new crypto markets
 * are added. Matched against questionText + resolutionCriteria via a
 * simple keyword search — good enough here, since the actual reasoning
 * over whether the resolution criteria were met happens in the AI verdict
 * step (resolve.ts), not in this lookup.
 */
const KNOWN_ASSETS: Record<string, { coingeckoId: string; binanceSymbol: string; label: string }> = {
  BTC: { coingeckoId: "bitcoin", binanceSymbol: "BTCUSDT", label: "Bitcoin" },
  BITCOIN: { coingeckoId: "bitcoin", binanceSymbol: "BTCUSDT", label: "Bitcoin" },
  ETH: { coingeckoId: "ethereum", binanceSymbol: "ETHUSDT", label: "Ethereum" },
  ETHEREUM: { coingeckoId: "ethereum", binanceSymbol: "ETHUSDT", label: "Ethereum" },
  SOL: { coingeckoId: "solana", binanceSymbol: "SOLUSDT", label: "Solana" },
  SOLANA: { coingeckoId: "solana", binanceSymbol: "SOLUSDT", label: "Solana" },
  OKB: { coingeckoId: "okb", binanceSymbol: "OKBUSDT", label: "OKB" },
};

function detectAsset(question: MarketQuestion) {
  const text = `${question.questionText} ${question.resolutionCriteria}`.toUpperCase();
  for (const [keyword, asset] of Object.entries(KNOWN_ASSETS)) {
    if (text.includes(keyword)) return asset;
  }
  return null;
}

async function fetchCoinGeckoPrice(coingeckoId: string): Promise<number> {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd`
  );
  if (!res.ok) throw new Error(`CoinGecko request failed: ${res.status} ${res.statusText}`);
  const data = (await res.json()) as Record<string, { usd: number }>;
  const price = data[coingeckoId]?.usd;
  if (typeof price !== "number") throw new Error(`CoinGecko response missing price for ${coingeckoId}`);
  return price;
}

async function fetchBinancePrice(symbol: string): Promise<number> {
  const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
  if (!res.ok) throw new Error(`Binance request failed: ${res.status} ${res.statusText}`);
  const data = (await res.json()) as { price: string };
  const price = Number(data.price);
  if (!Number.isFinite(price)) throw new Error(`Binance response missing price for ${symbol}`);
  return price;
}

/**
 * Gathers evidence for a crypto price/threshold question
 * (e.g. "was BTC >= $X at time T") from two independent, keyless public
 * price feeds — CoinGecko and Binance. Real prices, fetched live at
 * resolution time. Neither endpoint requires an API key.
 */
export async function gatherCryptoEvidence(question: MarketQuestion): Promise<EvidenceItem[]> {
  if (config.mockMode) {
    return mockCryptoEvidence(question);
  }

  const asset = detectAsset(question);
  if (!asset) {
    const known = [...new Set(Object.values(KNOWN_ASSETS).map((a) => a.label))].join(", ");
    throw new Error(
      `Could not identify a known crypto asset in question "${question.questionText}". Known assets: ${known}.`
    );
  }

  const fetchedAt = Date.now();
  const [coingecko, binance] = await Promise.allSettled([
    fetchCoinGeckoPrice(asset.coingeckoId),
    fetchBinancePrice(asset.binanceSymbol),
  ]);

  const items: EvidenceItem[] = [];
  if (coingecko.status === "fulfilled") {
    items.push({
      source: "coingecko:simple-price",
      fetchedAt,
      content: `${asset.label} price via CoinGecko (live, keyless public API) at resolution time: $${coingecko.value.toLocaleString()}. Question: "${question.questionText}"`,
    });
  }
  if (binance.status === "fulfilled") {
    items.push({
      source: "binance:ticker-price",
      fetchedAt,
      content: `${asset.label} price via Binance spot ticker (live, keyless public API) at resolution time: $${binance.value.toLocaleString()}.`,
    });
  }

  if (items.length === 0) {
    const errors = [coingecko, binance]
      .filter((r): r is PromiseRejectedResult => r.status === "rejected")
      .map((r) => String(r.reason))
      .join("; ");
    throw new Error(`Both live crypto price sources failed: ${errors}`);
  }

  return items;
}
