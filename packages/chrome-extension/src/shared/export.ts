/// <reference types="chrome" />

export interface ExportEvent {
  id: string;
  timestamp: number;
  date: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  costUsd: number;
  source: string;
}

function normalizeEvents(events: Record<string, unknown>[]): ExportEvent[] {
  return events.map(e => ({
    id: (e.id as string) ?? '',
    timestamp: (e.timestamp as number) ?? 0,
    date: new Date((e.timestamp as number) ?? 0).toISOString(),
    provider: (e.provider as string) ?? '',
    model: (e.model as string) ?? '',
    inputTokens: (e.inputTokens as number) ?? 0,
    outputTokens: (e.outputTokens as number) ?? 0,
    cacheReadTokens: (e.cacheReadTokens as number) ?? 0,
    cacheWriteTokens: (e.cacheWriteTokens as number) ?? 0,
    costUsd: (e.costUsd as number) ?? 0,
    source: (e.source as string) ?? '',
  }));
}

export async function exportAsJSON(): Promise<string> {
  const { events = [] } = await chrome.storage.local.get('events');
  const normalized = normalizeEvents(events);
  return JSON.stringify(normalized, null, 2);
}

export async function exportAsCSV(): Promise<string> {
  const { events = [] } = await chrome.storage.local.get('events');
  const normalized = normalizeEvents(events);

  const headers = ['date', 'provider', 'model', 'input_tokens', 'output_tokens', 'cache_read_tokens', 'cache_write_tokens', 'cost_usd', 'source'];
  const rows = normalized.map(e => [
    e.date,
    e.provider,
    e.model,
    e.inputTokens,
    e.outputTokens,
    e.cacheReadTokens,
    e.cacheWriteTokens,
    e.costUsd.toFixed(6),
    e.source,
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
