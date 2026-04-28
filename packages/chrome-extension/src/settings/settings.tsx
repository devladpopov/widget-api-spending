import { render } from 'preact';
import { useState, useEffect, useCallback } from 'preact/hooks';
import type { JSX } from 'preact';
import { exportAsJSON, exportAsCSV, downloadFile } from '../shared/export';

// Full currency list — Frankfurter API (ECB) supports all of these
const CURRENCIES: Array<{ code: string; name: string; symbol: string }> = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '\u20AC' },
  { code: 'GBP', name: 'British Pound', symbol: '\u00A3' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '\u00A5' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '\u00A5' },
  { code: 'INR', name: 'Indian Rupee', symbol: '\u20B9' },
  { code: 'KRW', name: 'South Korean Won', symbol: '\u20A9' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'z\u0142' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'K\u010D' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '\u20BA' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'THB', name: 'Thai Baht', symbol: '\u0E3F' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '\u20B1' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '\u20AA' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei' },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв' },
  { code: 'ISK', name: 'Icelandic Krona', symbol: 'kr' },
];

interface Settings {
  anthropicKey: string;
  openaiKey: string;
  currency: string;
  budgetDaily: string;
  budgetMonthly: string;
  pollInterval: number;
  theme: 'light' | 'dark' | 'auto';
}

const DEFAULT_SETTINGS: Settings = {
  anthropicKey: '',
  openaiKey: '',
  currency: 'USD',
  budgetDaily: '',
  budgetMonthly: '',
  pollInterval: 5,
  theme: 'light',
};

// Inline styles matching the cream design
const s = {
  page: {
    display: 'flex', flexDirection: 'column' as const, gap: 24,
  },
  header: {
    display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8,
  },
  h1: {
    fontSize: 22, fontWeight: 600, color: '#1a1815', letterSpacing: '-0.02em',
  },
  version: {
    fontSize: 11, color: '#8a8470', fontFamily: 'JetBrains Mono, monospace',
    background: '#E5DDC8', padding: '2px 8px', borderRadius: 4,
  },
  card: {
    background: '#FBF7EA', borderRadius: 12, padding: '20px 24px',
    border: '1px solid #E5DDC8',
  },
  cardTitle: {
    fontSize: 10, color: '#8a8470', textTransform: 'uppercase' as const,
    letterSpacing: '0.08em', marginBottom: 16, fontWeight: 500,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    display: 'block', fontSize: 12, color: '#3d362a', fontWeight: 500,
    marginBottom: 6,
  },
  labelHint: {
    fontSize: 10, color: '#8a8470', fontWeight: 400, marginLeft: 4,
  },
  input: {
    width: '100%', padding: '10px 12px', fontSize: 13,
    fontFamily: 'JetBrains Mono, monospace',
    background: '#F4EFE3', border: '1px solid #D4C9AC', borderRadius: 8,
    color: '#1a1815', outline: 'none',
  },
  select: {
    width: '100%', padding: '10px 12px', fontSize: 13,
    background: '#F4EFE3', border: '1px solid #D4C9AC', borderRadius: 8,
    color: '#1a1815', outline: 'none', cursor: 'pointer',
  },
  row: {
    display: 'flex', gap: 12,
  },
  btnRow: {
    display: 'flex', gap: 12, marginTop: 8,
  },
  btn: {
    padding: '10px 20px', fontSize: 13, fontWeight: 500,
    border: '1px solid #D4C9AC', background: 'transparent',
    color: '#3d362a', borderRadius: 8, cursor: 'pointer',
    fontFamily: 'inherit',
  },
  btnPrimary: {
    background: '#C96442', borderColor: '#C96442', color: '#fff',
  },
  btnDanger: {
    borderColor: '#d44', color: '#d44',
  },
  saved: {
    fontSize: 12, color: '#4a8a3a', fontFamily: 'JetBrains Mono, monospace',
    padding: '4px 0',
  },
  stats: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
  },
  stat: {
    display: 'flex', flexDirection: 'column' as const, gap: 2,
  },
  statLabel: {
    fontSize: 10, color: '#8a8470', textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  statValue: {
    fontFamily: 'JetBrains Mono, monospace', fontSize: 14,
    fontWeight: 500, color: '#1a1815',
  },
};

function SettingsApp() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [stats, setStats] = useState({ events: 0, providers: 0, since: '' });

  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);

  const loadSettings = async () => {
    try {
      const { settings: stored } = await chrome.storage.local.get('settings');
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...stored });
      }
    } catch {
      // dev mode
    }
  };

  const loadStats = async () => {
    try {
      const { events = [] } = await chrome.storage.local.get('events');
      const providers = new Set(events.map((e: { provider: string }) => e.provider));
      const oldest = events.length > 0
        ? new Date(Math.min(...events.map((e: { timestamp: number }) => e.timestamp))).toLocaleDateString()
        : 'N/A';
      setStats({ events: events.length, providers: providers.size, since: oldest });
    } catch {
      // dev mode
    }
  };

  const handleSave = useCallback(async () => {
    try {
      await chrome.storage.local.set({ settings });
      // Trigger re-fetch of exchange rates if currency changed
      chrome.runtime.sendMessage({ type: 'SETTINGS_UPDATED', settings });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // dev mode
    }
  }, [settings]);

  const handleExportJSON = useCallback(async () => {
    try {
      const json = await exportAsJSON();
      const date = new Date().toISOString().slice(0, 10);
      downloadFile(json, `api-spending-${date}.json`, 'application/json');
    } catch {}
  }, []);

  const handleExportCSV = useCallback(async () => {
    try {
      const csv = await exportAsCSV();
      const date = new Date().toISOString().slice(0, 10);
      downloadFile(csv, `api-spending-${date}.csv`, 'text/csv');
    } catch {}
  }, []);

  const handleClearData = useCallback(async () => {
    if (!confirm('Clear all recorded API usage data? This cannot be undone.')) return;
    try {
      await chrome.storage.local.remove('events');
      loadStats();
    } catch {}
  }, []);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const onInput = (key: keyof Settings) => (e: JSX.TargetedEvent<HTMLInputElement>) => {
    update(key, (e.target as HTMLInputElement).value as never);
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.h1}>API Spending Settings</div>
        <span style={s.version}>v0.1.0</span>
      </div>

      {/* API Keys */}
      <div style={s.card}>
        <div style={s.cardTitle}>API Keys</div>
        <div style={s.field}>
          <label style={s.label}>
            Anthropic Admin Key
            <span style={s.labelHint}>(sk-ant-admin...)</span>
          </label>
          <input
            type="password"
            style={s.input}
            placeholder="sk-ant-admin01-..."
            value={settings.anthropicKey}
            onInput={onInput('anthropicKey')}
          />
        </div>
        <div style={s.field}>
          <label style={s.label}>
            OpenAI Admin Key
            <span style={s.labelHint}>(sk-admin-...)</span>
          </label>
          <input
            type="password"
            style={s.input}
            placeholder="sk-admin-..."
            value={settings.openaiKey}
            onInput={onInput('openaiKey')}
          />
        </div>
        <div style={{ fontSize: 11, color: '#8a8470', lineHeight: 1.5 }}>
          Admin keys are stored locally in your browser and never sent to third parties.
          Without keys, the extension tracks usage passively by intercepting API calls on open tabs.
        </div>
      </div>

      {/* Display */}
      <div style={s.card}>
        <div style={s.cardTitle}>Display</div>
        <div style={{ ...s.row, marginBottom: 16 }}>
          <div style={{ ...s.field, flex: 1, marginBottom: 0 }}>
            <label style={s.label}>Currency</label>
            <select
              style={s.select}
              value={settings.currency}
              onChange={(e) => update('currency', (e.target as HTMLSelectElement).value)}
            >
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</option>)}
            </select>
          </div>
          <div style={{ ...s.field, flex: 1, marginBottom: 0 }}>
            <label style={s.label}>Theme</label>
            <select
              style={s.select}
              value={settings.theme}
              onChange={(e) => update('theme', (e.target as HTMLSelectElement).value as Settings['theme'])}
            >
              <option value="light">Light (Cream)</option>
              <option value="dark">Dark</option>
              <option value="auto">System</option>
            </select>
          </div>
        </div>
        <div style={s.field}>
          <label style={s.label}>
            Poll interval
            <span style={s.labelHint}>(minutes, for Admin API polling)</span>
          </label>
          <input
            type="number"
            style={{ ...s.input, width: 100 }}
            min="1"
            max="60"
            value={settings.pollInterval}
            onInput={(e) => update('pollInterval', Number((e.target as HTMLInputElement).value) || 5)}
          />
        </div>
      </div>

      {/* Budget Alerts */}
      <div style={s.card}>
        <div style={s.cardTitle}>Budget Alerts</div>
        <div style={s.row}>
          <div style={{ ...s.field, flex: 1, marginBottom: 0 }}>
            <label style={s.label}>Daily limit ($)</label>
            <input
              type="number"
              style={s.input}
              placeholder="e.g. 10"
              value={settings.budgetDaily}
              onInput={onInput('budgetDaily')}
            />
          </div>
          <div style={{ ...s.field, flex: 1, marginBottom: 0 }}>
            <label style={s.label}>Monthly limit ($)</label>
            <input
              type="number"
              style={s.input}
              placeholder="e.g. 200"
              value={settings.budgetMonthly}
              onInput={onInput('budgetMonthly')}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={s.card}>
        <div style={s.cardTitle}>Data</div>
        <div style={s.stats}>
          <div style={s.stat}>
            <span style={s.statLabel}>Recorded events</span>
            <span style={s.statValue}>{stats.events.toLocaleString()}</span>
          </div>
          <div style={s.stat}>
            <span style={s.statLabel}>Providers seen</span>
            <span style={s.statValue}>{stats.providers}</span>
          </div>
          <div style={s.stat}>
            <span style={s.statLabel}>Tracking since</span>
            <span style={s.statValue}>{stats.since}</span>
          </div>
        </div>
      </div>

      {/* Export */}
      <div style={s.card}>
        <div style={s.cardTitle}>Export</div>
        <div style={s.btnRow}>
          <button style={s.btn} onClick={handleExportCSV}>Export CSV</button>
          <button style={s.btn} onClick={handleExportJSON}>Export JSON</button>
        </div>
      </div>

      {/* Actions */}
      <div style={s.btnRow}>
        <button style={{ ...s.btn, ...s.btnDanger }} onClick={handleClearData}>
          Clear Data
        </button>
        <div style={{ flex: 1 }} />
        {saved && <span style={s.saved}>Saved</span>}
        <button style={{ ...s.btn, ...s.btnPrimary }} onClick={handleSave}>
          Save Settings
        </button>
      </div>
    </div>
  );
}

render(<SettingsApp />, document.getElementById('app')!);
