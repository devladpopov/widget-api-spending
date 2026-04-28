import { render } from 'preact';
import { useState, useEffect, useCallback } from 'preact/hooks';
import { calculateCost } from '@api-spending/core';
import type { UsageEvent } from '@api-spending/core';
import { Toad } from './components/Toad';
import { creamLight, creamDark } from './themes';
import type { Theme } from './themes';

const PROVIDER_COLORS: Record<string, string> = {
  anthropic: '#C96442',
  openai: '#7d8775',
  gemini: '#b8995c',
};

const SPARKLINE_PATH = 'M0 24 L20 22 L40 25 L60 18 L80 20 L100 14 L120 16 L140 12 L160 18 L180 10 L200 14 L220 8 L240 12 L260 6 L280 10 L300 4 L320 7';

// Mock data for initial development — will be replaced with chrome.storage data
const MOCK_PROVIDERS = [
  { name: 'Anthropic', pct: 73, cost: '$3.10', color: '#C96442' },
  { name: 'OpenAI', pct: 23, cost: '$0.98', color: '#7d8775' },
  { name: 'Gemini', pct: 4, cost: '$0.15', color: '#b8995c' },
];

const MOCK_RECENT = [
  { t: '2m', m: 'claude-opus-4', c: '$0.42', color: '#C96442' },
  { t: '5m', m: 'gpt-4o', c: '$0.08', color: '#7d8775' },
  { t: '12m', m: 'claude-sonnet-4', c: '$0.12', color: '#C96442' },
  { t: '1h', m: 'gemini-2.5-pro', c: '$0.03', color: '#b8995c' },
];

interface SpendingState {
  today: number;
  todayLocal: string;
  week: number;
  month: number;
  byProvider: Array<{ name: string; pct: number; cost: string; color: string }>;
  recent: Array<{ t: string; m: string; c: string; color: string }>;
  lastUpdated: string;
  useMock: boolean;
}

function App() {
  const [theme] = useState<Theme>(creamLight);
  const [state, setState] = useState<SpendingState>({
    today: 4.23,
    todayLocal: '£3.35',
    week: 28.71,
    month: 142.50,
    byProvider: MOCK_PROVIDERS,
    recent: MOCK_RECENT,
    lastUpdated: '2m ago',
    useMock: true,
  });

  const s = theme;

  const loadData = useCallback(async () => {
    try {
      const storage = await chrome.storage.local.get(['events', 'settings']);
      const events: UsageEvent[] = storage.events ?? [];
      const settings = storage.settings ?? {};

      if (events.length === 0) {
        // Keep mock data if no real data
        setState(prev => ({ ...prev, useMock: true }));
        return;
      }

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const weekStart = todayStart - now.getDay() * 86_400_000;
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

      const enriched: UsageEvent[] = events.map((e: UsageEvent) => ({
        ...e,
        costUsd: e.costUsd || calculateCost(
          e.provider, e.model, e.inputTokens, e.outputTokens,
          e.cacheReadTokens, e.cacheWriteTokens,
        ),
      }));

      const sum = (list: UsageEvent[]) =>
        Math.round(list.reduce((s, e) => s + e.costUsd, 0) * 100) / 100;

      const todayEvents = enriched.filter(e => e.timestamp >= todayStart);
      const today = sum(todayEvents);
      const week = sum(enriched.filter(e => e.timestamp >= weekStart));
      const month = sum(enriched.filter(e => e.timestamp >= monthStart));

      const rate = settings.exchangeRate ?? 1;
      const currency = settings.currency ?? 'USD';
      const todayLocal = currency !== 'USD'
        ? `${currency} ${(today * rate).toFixed(2)}`
        : '';

      // Group by provider
      const providerTotals: Record<string, number> = {};
      for (const e of todayEvents) {
        providerTotals[e.provider] = (providerTotals[e.provider] ?? 0) + e.costUsd;
      }
      const maxCost = Math.max(...Object.values(providerTotals), 0.01);
      const byProvider = Object.entries(providerTotals)
        .sort(([, a], [, b]) => b - a)
        .map(([name, cost]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          pct: Math.round((cost / maxCost) * 100),
          cost: `$${cost.toFixed(2)}`,
          color: PROVIDER_COLORS[name.toLowerCase()] ?? '#8a8470',
        }));

      // Recent events
      const recent = enriched.slice(-5).reverse().map(e => {
        const mins = Math.floor((Date.now() - e.timestamp) / 60000);
        const t = mins < 1 ? 'now' : mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h`;
        return {
          t,
          m: e.model,
          c: `$${e.costUsd.toFixed(2)}`,
          color: PROVIDER_COLORS[e.provider.toLowerCase()] ?? '#8a8470',
        };
      });

      setState({
        today,
        todayLocal: todayLocal ? `\u2248 ${todayLocal}` : '',
        week,
        month,
        byProvider: byProvider.length > 0 ? byProvider : MOCK_PROVIDERS,
        recent: recent.length > 0 ? recent : MOCK_RECENT,
        lastUpdated: 'just now',
        useMock: false,
      });
    } catch {
      // chrome.storage not available (dev mode) — keep mock data
      setState(prev => ({ ...prev, useMock: true }));
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSettings = useCallback(() => {
    try {
      chrome.runtime.openOptionsPage();
    } catch {
      // dev mode fallback
    }
  }, []);

  return (
    <div style={s.widget}>
      {/* Header */}
      <div style={s.header}>
        <Toad size={32} eyeColor={s.eyeColor} />
        <div style={s.title}>API Spending</div>
        <div style={s.updated}>{state.lastUpdated}</div>
      </div>

      {/* Hero */}
      <div style={s.hero}>
        <div style={s.heroLabel}>Today</div>
        <div style={s.heroValueRow}>
          <div style={s.heroValue}>${state.today.toFixed(2)}</div>
          {state.todayLocal && <div style={s.heroSub}>{state.todayLocal}</div>}
        </div>
        <div style={s.sparkline}>
          <svg width="100%" height="32" viewBox="0 0 320 32" preserveAspectRatio="none">
            <defs>
              <linearGradient id="sparkGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="#C96442" stop-opacity={s.sparkGradOpacity[0]} />
                <stop offset="100%" stop-color="#C96442" stop-opacity={s.sparkGradOpacity[1]} />
              </linearGradient>
            </defs>
            <path d={`${SPARKLINE_PATH} L320 32 L0 32 Z`} fill="url(#sparkGrad)" />
            <path d={SPARKLINE_PATH} fill="none" stroke="#C96442" stroke-width="1.5" />
          </svg>
        </div>
      </div>

      {/* Pills */}
      <div style={s.pills}>
        <div style={s.pill}>
          <span style={s.pillLabel}>This week</span>
          <span style={s.pillValue}>${state.week.toFixed(2)}</span>
        </div>
        <div style={s.pill}>
          <span style={s.pillLabel}>This month</span>
          <span style={s.pillValue}>${state.month.toFixed(2)}</span>
        </div>
      </div>

      <div style={s.hr} />

      {/* By Provider */}
      <div style={s.section}>
        <div style={s.sectionTitle}>By provider</div>
        {state.byProvider.map(p => (
          <div key={p.name} style={s.providerRow}>
            <div style={s.providerInfo}>
              <span style={{ ...s.providerDot, background: p.color }} />
              <span style={s.providerName}>{p.name}</span>
              <span style={s.providerCost}>{p.cost}</span>
            </div>
            <div style={s.barTrack}>
              <div style={{ ...s.barFill, width: `${p.pct}%`, background: p.color }} />
            </div>
          </div>
        ))}
      </div>

      <div style={s.hr} />

      {/* Recent */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Recent</div>
        {state.recent.map((r, i) => (
          <div key={i} style={s.req}>
            <span style={s.reqTime}>{r.t}</span>
            <span style={{ ...s.reqDot, background: r.color }} />
            <span style={s.reqModel}>{r.m}</span>
            <span style={s.reqCost}>{r.c}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={s.footer}>
        <button style={s.fbtn} onClick={handleSettings}>Settings</button>
        <button style={{ ...s.fbtn, ...s.fbtnPrimary }} onClick={loadData}>Refresh</button>
      </div>
    </div>
  );
}

render(<App />, document.getElementById('app')!);
