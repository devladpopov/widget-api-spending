import type { UsageEvent } from '../types.js';
import { calculateCost } from '../pricing.js';

const ANTHROPIC_USAGE_API = 'https://api.anthropic.com/v1/organizations/usage_report/messages';

interface AnthropicUsageBucket {
  start_time: string;
  end_time: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  input_cached_tokens: number;
  cache_creation_input_tokens: number;
}

interface AnthropicUsageResponse {
  data: AnthropicUsageBucket[];
}

export async function fetchAnthropicUsage(
  adminKey: string,
  startTime: Date,
  endTime: Date,
  granularity: '1m' | '1h' | '1d' = '1h',
): Promise<UsageEvent[]> {
  const params = new URLSearchParams({
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    granularity,
    group_by: 'model',
  });

  const response = await fetch(`${ANTHROPIC_USAGE_API}?${params}`, {
    headers: {
      'x-api-key': adminKey,
      'anthropic-version': '2023-06-01',
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Anthropic Usage API error ${response.status}: ${body}`);
  }

  const data: AnthropicUsageResponse = await response.json();

  return data.data
    .filter(b => b.input_tokens > 0 || b.output_tokens > 0)
    .map(bucket => ({
      id: `anthropic-${bucket.start_time}-${bucket.model}`,
      timestamp: new Date(bucket.start_time).getTime(),
      provider: 'anthropic' as const,
      model: bucket.model,
      inputTokens: bucket.input_tokens,
      outputTokens: bucket.output_tokens,
      cacheReadTokens: bucket.input_cached_tokens ?? 0,
      cacheWriteTokens: bucket.cache_creation_input_tokens ?? 0,
      costUsd: calculateCost(
        'anthropic',
        bucket.model,
        bucket.input_tokens,
        bucket.output_tokens,
        bucket.input_cached_tokens ?? 0,
        bucket.cache_creation_input_tokens ?? 0,
      ),
      source: 'billing-api' as const,
    }));
}

/** Parse usage from an Anthropic API response body (for interceptor mode) */
export function parseAnthropicResponse(responseBody: Record<string, unknown>): Partial<UsageEvent> | null {
  const usage = responseBody.usage as Record<string, number> | undefined;
  if (!usage) return null;

  const model = responseBody.model as string;

  return {
    provider: 'anthropic',
    model,
    inputTokens: usage.input_tokens ?? 0,
    outputTokens: usage.output_tokens ?? 0,
    cacheReadTokens: usage.cache_read_input_tokens ?? 0,
    cacheWriteTokens: usage.cache_creation_input_tokens ?? 0,
    costUsd: calculateCost(
      'anthropic',
      model,
      usage.input_tokens ?? 0,
      usage.output_tokens ?? 0,
      usage.cache_read_input_tokens ?? 0,
      usage.cache_creation_input_tokens ?? 0,
    ),
    source: 'interceptor',
  };
}
