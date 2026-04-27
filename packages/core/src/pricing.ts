import type { PricingEntry, Provider } from './types.js';

// Prices in USD per 1M tokens, as of April 2025
const PRICING_TABLE: PricingEntry[] = [
  // Anthropic
  { provider: 'anthropic', model: 'claude-opus-4', inputPer1MTokens: 15, outputPer1MTokens: 75, cacheReadPer1MTokens: 1.5, cacheWritePer1MTokens: 18.75, effectiveDate: '2025-05-22' },
  { provider: 'anthropic', model: 'claude-sonnet-4', inputPer1MTokens: 3, outputPer1MTokens: 15, cacheReadPer1MTokens: 0.3, cacheWritePer1MTokens: 3.75, effectiveDate: '2025-05-22' },
  { provider: 'anthropic', model: 'claude-haiku-3.5', inputPer1MTokens: 0.8, outputPer1MTokens: 4, cacheReadPer1MTokens: 0.08, cacheWritePer1MTokens: 1, effectiveDate: '2024-10-22' },

  // OpenAI
  { provider: 'openai', model: 'gpt-4o', inputPer1MTokens: 2.5, outputPer1MTokens: 10, effectiveDate: '2024-10-01' },
  { provider: 'openai', model: 'gpt-4o-mini', inputPer1MTokens: 0.15, outputPer1MTokens: 0.6, effectiveDate: '2024-07-18' },
  { provider: 'openai', model: 'gpt-4.1', inputPer1MTokens: 2, outputPer1MTokens: 8, effectiveDate: '2025-04-14' },
  { provider: 'openai', model: 'gpt-4.1-mini', inputPer1MTokens: 0.4, outputPer1MTokens: 1.6, effectiveDate: '2025-04-14' },
  { provider: 'openai', model: 'gpt-4.1-nano', inputPer1MTokens: 0.1, outputPer1MTokens: 0.4, effectiveDate: '2025-04-14' },
  { provider: 'openai', model: 'o3', inputPer1MTokens: 2, outputPer1MTokens: 8, effectiveDate: '2025-04-16' },
  { provider: 'openai', model: 'o4-mini', inputPer1MTokens: 1.1, outputPer1MTokens: 4.4, effectiveDate: '2025-04-16' },

  // Gemini
  { provider: 'gemini', model: 'gemini-2.5-pro', inputPer1MTokens: 1.25, outputPer1MTokens: 10, effectiveDate: '2025-03-25' },
  { provider: 'gemini', model: 'gemini-2.5-flash', inputPer1MTokens: 0.15, outputPer1MTokens: 0.6, effectiveDate: '2025-04-17' },
  { provider: 'gemini', model: 'gemini-2.0-flash', inputPer1MTokens: 0.1, outputPer1MTokens: 0.4, effectiveDate: '2025-02-05' },
];

export function getPricing(provider: Provider, model: string): PricingEntry | undefined {
  // Exact match first
  const exact = PRICING_TABLE.find(p => p.provider === provider && p.model === model);
  if (exact) return exact;

  // Fuzzy: model name contains the pricing entry model name
  return PRICING_TABLE.find(p => p.provider === provider && model.includes(p.model));
}

export function calculateCost(
  provider: Provider,
  model: string,
  inputTokens: number,
  outputTokens: number,
  cacheReadTokens = 0,
  cacheWriteTokens = 0,
): number {
  const pricing = getPricing(provider, model);
  if (!pricing) return 0;

  let cost = 0;
  cost += (inputTokens / 1_000_000) * pricing.inputPer1MTokens;
  cost += (outputTokens / 1_000_000) * pricing.outputPer1MTokens;

  if (pricing.cacheReadPer1MTokens && cacheReadTokens > 0) {
    cost += (cacheReadTokens / 1_000_000) * pricing.cacheReadPer1MTokens;
  }
  if (pricing.cacheWritePer1MTokens && cacheWriteTokens > 0) {
    cost += (cacheWriteTokens / 1_000_000) * pricing.cacheWritePer1MTokens;
  }

  return Math.round(cost * 1_000_000) / 1_000_000; // 6 decimal precision
}

export function getAllPricing(): PricingEntry[] {
  return [...PRICING_TABLE];
}
