import type { ExchangeRates } from './types.js';

const FRANKFURTER_API = 'https://api.frankfurter.dev/v1/latest';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

let cachedRates: ExchangeRates | null = null;
let cacheTimestamp = 0;

export async function fetchExchangeRates(base = 'USD'): Promise<ExchangeRates> {
  const now = Date.now();
  if (cachedRates && cachedRates.base === base && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedRates;
  }

  const response = await fetch(`${FRANKFURTER_API}?base=${base}`);
  if (!response.ok) {
    throw new Error(`Exchange rate fetch failed: ${response.status}`);
  }

  const data = await response.json();
  cachedRates = {
    base: data.base,
    date: data.date,
    rates: data.rates,
  };
  cacheTimestamp = now;
  return cachedRates;
}

export function convertCurrency(amountUsd: number, rates: ExchangeRates, targetCurrency: string): number {
  if (targetCurrency === 'USD') return amountUsd;

  const rate = rates.rates[targetCurrency];
  if (!rate) throw new Error(`Unknown currency: ${targetCurrency}`);

  return Math.round(amountUsd * rate * 100) / 100;
}
