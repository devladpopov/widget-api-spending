import { render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { calculateCost } from '@api-spending/core';
import type { UsageEvent } from '@api-spending/core';

interface SpendingState {
  today: number;
  week: number;
  month: number;
  byProvider: Record<string, number>;
  recent: UsageEvent[];
  currency: string;
  exchangeRate: number;
}

function App() {
  const [state, setState] = useState<SpendingState>({
    today: 0,
    week: 0,
    month: 0,
    byProvider: {},
    recent: [],
    currency: 'USD',
    exchangeRate: 1,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { events = [], settings = {} } = await chrome.storage.local.get(['events', 'settings']);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = todayStart - now.getDay() * 86_400_000;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    // Recalculate costs for intercepted events that don't have costUsd
    const enriched: UsageEvent[] = events.map((e: UsageEvent) => ({
      ...e,
      costUsd: e.costUsd || calculateCost(
        e.provider, e.model, e.inputTokens, e.outputTokens,
        e.cacheReadTokens, e.cacheWriteTokens,
      ),
    }));

    const today = sum(enriched.filter(e => e.timestamp >= todayStart));
    const week = sum(enriched.filter(e => e.timestamp >= weekStart));
    const month = sum(enriched.filter(e => e.timestamp >= monthStart));

    const byProvider: Record<string, number> = {};
    for (const e of enriched.filter(e => e.timestamp >= todayStart)) {
      byProvider[e.provider] = (byProvider[e.provider] ?? 0) + e.costUsd;
    }

    setState({
      today,
      week,
      month,
      byProvider,
      recent: enriched.slice(-10).reverse(),
      currency: settings.currency ?? 'USD',
      exchangeRate: settings.exchangeRate ?? 1,
    });
  }

  function sum(events: UsageEvent[]): number {
    return Math.round(events.reduce((s, e) => s + e.costUsd, 0) * 100) / 100;
  }

  function fmt(usd: number): string {
    if (state.currency === 'USD') return `$${usd.toFixed(2)}`;
    const local = (usd * state.exchangeRate).toFixed(2);
    return `$${usd.toFixed(2)} (${state.currency} ${local})`;
  }

  function timeAgo(ts: number): string {
    const mins = Math.floor((Date.now() - ts) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  }

  const maxProvider = Math.max(...Object.values(state.byProvider), 0.01);

  return (
    <div class="w-[360px] p-4 bg-gray-950 text-gray-100 font-mono text-sm">
      <h1 class="text-base font-bold mb-3">API Spending</h1>

      <div class="space-y-1 mb-4">
        <div class="flex justify-between">
          <span class="text-gray-400">Today</span>
          <span class="font-bold text-white">{fmt(state.today)}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">This week</span>
          <span>{fmt(state.week)}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">This month</span>
          <span>{fmt(state.month)}</span>
        </div>
      </div>

      {Object.keys(state.byProvider).length > 0 && (
        <div class="mb-4">
          <div class="text-gray-500 text-xs mb-2 uppercase tracking-wide">By Provider (today)</div>
          {Object.entries(state.byProvider)
            .sort(([, a], [, b]) => b - a)
            .map(([provider, cost]) => (
              <div key={provider} class="mb-1">
                <div class="flex justify-between text-xs">
                  <span class="capitalize">{provider}</span>
                  <span>${cost.toFixed(2)}</span>
                </div>
                <div class="h-1.5 bg-gray-800 rounded overflow-hidden">
                  <div
                    class="h-full bg-blue-500 rounded"
                    style={{ width: `${(cost / maxProvider) * 100}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      )}

      {state.recent.length > 0 && (
        <div>
          <div class="text-gray-500 text-xs mb-2 uppercase tracking-wide">Recent</div>
          {state.recent.slice(0, 5).map(e => (
            <div key={e.id} class="flex justify-between text-xs py-0.5 border-b border-gray-800">
              <span class="text-gray-500">{timeAgo(e.timestamp)}</span>
              <span class="text-gray-300 truncate mx-2 flex-1">{e.model}</span>
              <span class="text-white">${e.costUsd.toFixed(4)}</span>
            </div>
          ))}
        </div>
      )}

      {state.recent.length === 0 && (
        <div class="text-gray-600 text-center py-4">
          No usage data yet. Make an API call to start tracking.
        </div>
      )}

      <div class="flex justify-between mt-4 pt-2 border-t border-gray-800">
        <button
          class="text-xs text-gray-500 hover:text-gray-300"
          onClick={() => chrome.runtime.openOptionsPage()}
        >
          Settings
        </button>
        <button
          class="text-xs text-gray-500 hover:text-gray-300"
          onClick={loadData}
        >
          Refresh
        </button>
      </div>
    </div>
  );
}

render(<App />, document.getElementById('app')!);
