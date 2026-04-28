import { render } from 'preact';
import { useState, useEffect, useCallback, useMemo } from 'preact/hooks';
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

function generateSparkline(
  events: UsageEvent[],
  hours = 24,
  width = 320,
  height = 28,
): string | null {
  if (!events || events.length === 0) return null;

  const now = Date.now();
  const msPerHour = 3_600_000;
  const windowStart = now - hours * msPerHour;

  const relevant = events.filter(e => e.timestamp >= windowStart);
  if (relevant.length === 0) return null;

  const buckets = new Array<number>(hours).fill(0);
  for (const e of relevant) {
    const hourIndex = Math.min(
      hours - 1,
      Math.max(0, Math.floor((e.timestamp - windowStart) / msPerHour)),
    );
    buckets[hourIndex] += e.costUsd;
  }

  const maxCost = Math.max(...buckets);
  if (maxCost === 0) return null;

  const padding = 2;
  const stepX = width / (hours - 1);

  const points = buckets.map((cost, i) => {
    const x = Math.round(i * stepX * 100) / 100;
    const y = Math.round((height - padding - (cost / maxCost) * (height - padding * 2)) * 100) / 100;
    return { x, y };
  });

  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`)
    .join(' ');
}

interface SpendingState {
  today: number;
  todayLocal: string;
  week: number;
  month: number;
  byProvider: Array<{ name: string; pct: number; cost: string; color: string }>;
  recent: Array<{ t: string; m: string; c: string; color: string }>;
  events: UsageEvent[];
  lastUpdated: string;
  hasData: boolean;
  hasKeys: boolean;
}

function App() {
  const [theme] = useState<Theme>(creamLight);
  const [state, setState] = useState<SpendingState>({
    today: 0,
    todayLocal: '',
    week: 0,
    month: 0,
    byProvider: [],
    recent: [],
    events: [],
    lastUpdated: '',
    hasData: false,
    hasKeys: false,
  });

  const s = theme;

  const sparklinePath = useMemo(
    () => generateSparkline(state.events),
    [state.events],
  );

  const loadData = useCallback(async () => {
    try {
      const storage = await chrome.storage.local.get(['events', 'settings']);
      const events: UsageEvent[] = storage.events ?? [];
      const settings = storage.settings ?? {};
      const hasKeys = !!(settings.anthropicKey || settings.openaiKey);

      if (events.length === 0) {
        setState(prev => ({ ...prev, hasData: false, hasKeys, lastUpdated: 'now' }));
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

      const recent = enriched.slice(-4).reverse().map(e => {
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
        byProvider,
        recent,
        events: enriched,
        lastUpdated: 'just now',
        hasData: true,
        hasKeys,
      });
    } catch {
      setState(prev => ({ ...prev, hasData: false, lastUpdated: '' }));
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSettings = useCallback(() => {
    try {
      chrome.runtime.openOptionsPage();
    } catch {}
  }, []);

  // Empty state — no data yet
  if (!state.hasData) {
    return (
      <div style={s.widget}>
        <div style={s.header}>
          <Toad size={28} eyeColor={s.eyeColor} />
          <div style={s.title}>API Spending</div>
        </div>
        <div style={{ padding: '24px 20px', textAlign: 'center' as const }}>
          <div style={{
            fontSize: 32, fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 600, color: '#1a1815', marginBottom: 4,
          }}>$0.00</div>
          <div style={{
            fontSize: 11, color: '#8a8470', lineHeight: 1.6,
            marginTop: 16, maxWidth: 280, marginLeft: 'auto', marginRight: 'auto',
          }}>
            {state.hasKeys
              ? 'No usage recorded yet. Data will appear as you make API calls.'
              : 'Add your API keys in Settings to start tracking spending, or browse AI provider sites to capture usage passively.'}
          </div>
        </div>
        <div style={s.footer}>
          <button style={{ ...s.fbtn, ...s.fbtnPrimary }} onClick={handleSettings}>
            {state.hasKeys ? 'Settings' : 'Set Up API Keys'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.widget}>
      {/* Header */}
      <div style={s.header}>
        <Toad size={28} eyeColor={s.eyeColor} />
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
        {sparklinePath && (
          <div style={s.sparkline}>
            <svg width="100%" height="28" viewBox="0 0 320 28" preserveAspectRatio="none">
              <defs>
                <linearGradient id="sparkGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stop-color="#C96442" stop-opacity={s.sparkGradOpacity[0]} />
                  <stop offset="100%" stop-color="#C96442" stop-opacity={s.sparkGradOpacity[1]} />
                </linearGradient>
              </defs>
              <path d={`${sparklinePath} L320 28 L0 28 Z`} fill="url(#sparkGrad)" />
              <path d={sparklinePath} fill="none" stroke="#C96442" stroke-width="1.5" />
            </svg>
          </div>
        )}
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
      {state.byProvider.length > 0 && (
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
      )}

      {state.byProvider.length > 0 && state.recent.length > 0 && <div style={s.hr} />}

      {/* Recent */}
      {state.recent.length > 0 && (
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
      )}

      {/* Footer */}
      <div style={s.footer}>
        <button style={s.fbtn} onClick={handleSettings}>Settings</button>
        <button style={{ ...s.fbtn, ...s.fbtnPrimary }} onClick={loadData}>Refresh</button>
      </div>
    </div>
  );
}

render(<App />, document.getElementById('app')!);
