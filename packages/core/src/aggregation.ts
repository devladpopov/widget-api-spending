import type { UsageEvent, SpendingSummary, ExchangeRates } from './types.js';
import { convertCurrency } from './currency.js';

export function aggregateUsage(
  events: UsageEvent[],
  periodStart: number,
  periodEnd: number,
  rates: ExchangeRates,
  localCurrency: string,
): SpendingSummary {
  const filtered = events.filter(e => e.timestamp >= periodStart && e.timestamp < periodEnd);

  const byProvider: Record<string, number> = {};
  const byModel: Record<string, number> = {};
  let totalCostUsd = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  for (const event of filtered) {
    totalCostUsd += event.costUsd;
    totalInputTokens += event.inputTokens;
    totalOutputTokens += event.outputTokens;

    byProvider[event.provider] = (byProvider[event.provider] ?? 0) + event.costUsd;
    byModel[event.model] = (byModel[event.model] ?? 0) + event.costUsd;
  }

  const rate = localCurrency === 'USD' ? 1 : (rates.rates[localCurrency] ?? 1);

  return {
    periodStart,
    periodEnd,
    totalCostUsd: Math.round(totalCostUsd * 100) / 100,
    totalCostLocal: convertCurrency(totalCostUsd, rates, localCurrency),
    localCurrency,
    exchangeRate: rate,
    byProvider,
    byModel,
    totalInputTokens,
    totalOutputTokens,
  };
}

export function getTimePeriods(): { today: [number, number]; week: [number, number]; month: [number, number] } {
  const now = new Date();

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayEnd = todayStart + 86_400_000;

  const weekStart = todayStart - now.getDay() * 86_400_000;
  const weekEnd = todayEnd;

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const monthEnd = todayEnd;

  return {
    today: [todayStart, todayEnd],
    week: [weekStart, weekEnd],
    month: [monthStart, monthEnd],
  };
}
