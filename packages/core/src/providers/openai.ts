import type { UsageEvent } from '../types.js';
import { calculateCost } from '../pricing.js';

const OPENAI_USAGE_API = 'https://api.openai.com/v1/organization/usage/completions';

interface OpenAIUsageBucket {
  start_time: number;
  end_time: number;
  results: Array<{
    input_tokens: number;
    output_tokens: number;
    input_cached_tokens: number;
    model: string;
    num_model_requests: number;
  }>;
}

interface OpenAIUsageResponse {
  data: OpenAIUsageBucket[];
}

export async function fetchOpenAIUsage(
  adminKey: string,
  startTime: Date,
  endTime: Date,
  granularity: '1m' | '1h' | '1d' = '1h',
): Promise<UsageEvent[]> {
  const bucketWidth = granularity === '1m' ? '1m' : granularity === '1h' ? '1h' : '1d';

  const params = new URLSearchParams({
    start_time: String(Math.floor(startTime.getTime() / 1000)),
    end_time: String(Math.floor(endTime.getTime() / 1000)),
    bucket_width: bucketWidth,
    group_by: 'model',
  });

  const response = await fetch(`${OPENAI_USAGE_API}?${params}`, {
    headers: {
      Authorization: `Bearer ${adminKey}`,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI Usage API error ${response.status}: ${body}`);
  }

  const data: OpenAIUsageResponse = await response.json();
  const events: UsageEvent[] = [];

  for (const bucket of data.data) {
    for (const result of bucket.results) {
      if (result.input_tokens === 0 && result.output_tokens === 0) continue;

      events.push({
        id: `openai-${bucket.start_time}-${result.model}`,
        timestamp: bucket.start_time * 1000,
        provider: 'openai',
        model: result.model,
        inputTokens: result.input_tokens,
        outputTokens: result.output_tokens,
        cacheReadTokens: result.input_cached_tokens ?? 0,
        cacheWriteTokens: 0,
        costUsd: calculateCost(
          'openai',
          result.model,
          result.input_tokens,
          result.output_tokens,
          result.input_cached_tokens ?? 0,
        ),
        source: 'billing-api',
      });
    }
  }

  return events;
}

/** Parse usage from an OpenAI API response body (for interceptor mode) */
export function parseOpenAIResponse(responseBody: Record<string, unknown>): Partial<UsageEvent> | null {
  const usage = responseBody.usage as Record<string, number> | undefined;
  if (!usage) return null;

  const model = responseBody.model as string;

  return {
    provider: 'openai',
    model,
    inputTokens: usage.prompt_tokens ?? 0,
    outputTokens: usage.completion_tokens ?? 0,
    cacheReadTokens: (usage as Record<string, unknown>).prompt_tokens_details
      ? ((usage as Record<string, unknown>).prompt_tokens_details as Record<string, number>).cached_tokens ?? 0
      : 0,
    cacheWriteTokens: 0,
    costUsd: calculateCost(
      'openai',
      model,
      usage.prompt_tokens ?? 0,
      usage.completion_tokens ?? 0,
    ),
    source: 'interceptor',
  };
}
