import { render } from 'preact';
import { useState } from 'preact/hooks';
import { creamLight, creamDark } from '../../chrome-extension/src/popup/themes';
import type { Theme } from '../../chrome-extension/src/popup/themes';

// Reuse the same Toad component
import { Toad } from '../../chrome-extension/src/popup/components/Toad';

const PROVIDER_COLORS: Record<string, string> = {
  anthropic: '#C96442',
  openai: '#7d8775',
  gemini: '#b8995c',
};

const SPARKLINE_PATH = 'M0 24 L20 22 L40 25 L60 18 L80 20 L100 14 L120 16 L140 12 L160 18 L180 10 L200 14 L220 8 L240 12 L260 6 L280 10 L300 4 L320 7';

// Mock data — will be replaced with Tauri IPC to read from SQLite
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

function App() {
  const s: Theme = creamDark; // Dark theme for desktop tray widget

  return (
    <div style={s.widget}>
      <div style={s.header}>
        <Toad size={32} eyeColor={s.eyeColor} />
        <div style={s.title}>API Spending</div>
        <div style={s.updated}>2m ago</div>
      </div>

      <div style={s.hero}>
        <div style={s.heroLabel}>Today</div>
        <div style={s.heroValueRow}>
          <div style={s.heroValue}>$4.23</div>
          <div style={s.heroSub}>≈ £3.35</div>
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

      <div style={s.pills}>
        <div style={s.pill}>
          <span style={s.pillLabel}>This week</span>
          <span style={s.pillValue}>$28.71</span>
        </div>
        <div style={s.pill}>
          <span style={s.pillLabel}>This month</span>
          <span style={s.pillValue}>$142.50</span>
        </div>
      </div>

      <div style={s.hr} />

      <div style={s.section}>
        <div style={s.sectionTitle}>By provider</div>
        {MOCK_PROVIDERS.map(p => (
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

      <div style={s.section}>
        <div style={s.sectionTitle}>Recent</div>
        {MOCK_RECENT.map((r, i) => (
          <div key={i} style={s.req}>
            <span style={s.reqTime}>{r.t}</span>
            <span style={{ ...s.reqDot, background: r.color }} />
            <span style={s.reqModel}>{r.m}</span>
            <span style={s.reqCost}>{r.c}</span>
          </div>
        ))}
      </div>

      <div style={s.footer}>
        <button style={s.fbtn}>Settings</button>
        <button style={{ ...s.fbtn, ...s.fbtnPrimary }}>Refresh</button>
      </div>
    </div>
  );
}

render(<App />, document.getElementById('app')!);
