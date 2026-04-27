export type Provider = 'anthropic' | 'openai' | 'gemini' | 'openrouter';

export type DataSource = 'billing-api' | 'interceptor' | 'manual';

export interface UsageEvent {
  id: string;
  timestamp: number;
  provider: Provider;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  costUsd: number;
  source: DataSource;
  sessionId?: string;
  taskLabel?: string;
}

export interface PricingEntry {
  provider: Provider;
  model: string;
  inputPer1MTokens: number;
  outputPer1MTokens: number;
  cacheReadPer1MTokens?: number;
  cacheWritePer1MTokens?: number;
  effectiveDate: string;
}

export interface SpendingSummary {
  periodStart: number;
  periodEnd: number;
  totalCostUsd: number;
  totalCostLocal: number;
  localCurrency: string;
  exchangeRate: number;
  byProvider: Record<string, number>;
  byModel: Record<string, number>;
  totalInputTokens: number;
  totalOutputTokens: number;
}

export interface ExchangeRates {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export interface ProviderConfig {
  provider: Provider;
  apiKey: string;
  enabled: boolean;
}
