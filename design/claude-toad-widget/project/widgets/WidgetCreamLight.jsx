// Variant C — Cream Light (full popup, light cream theme)
function WidgetCreamLight() {
  const s = creamLightStyles;
  return (
    <div style={s.widget}>
      <div style={s.header}>
        <Toad size={32} eyeColor="#1a1815" />
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
              <linearGradient id="sparkGradL" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#C96442" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#C96442" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 24 L20 22 L40 25 L60 18 L80 20 L100 14 L120 16 L140 12 L160 18 L180 10 L200 14 L220 8 L240 12 L260 6 L280 10 L300 4 L320 7 L320 32 L0 32 Z" fill="url(#sparkGradL)" />
            <path d="M0 24 L20 22 L40 25 L60 18 L80 20 L100 14 L120 16 L140 12 L160 18 L180 10 L200 14 L220 8 L240 12 L260 6 L280 10 L300 4 L320 7" fill="none" stroke="#C96442" strokeWidth="1.5" />
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
        {[
          {name: 'Anthropic', pct: 73, cost: '$3.10', color: '#C96442'},
          {name: 'OpenAI', pct: 23, cost: '$0.98', color: '#7d8775'},
          {name: 'Gemini', pct: 4, cost: '$0.15', color: '#b8995c'},
        ].map(p => (
          <div key={p.name} style={s.providerRow}>
            <div style={s.providerInfo}>
              <span style={{...s.providerDot, background: p.color}} />
              <span style={s.providerName}>{p.name}</span>
              <span style={s.providerCost}>{p.cost}</span>
            </div>
            <div style={s.barTrack}>
              <div style={{...s.barFill, width: `${p.pct}%`, background: p.color}} />
            </div>
          </div>
        ))}
      </div>

      <div style={s.hr} />

      <div style={s.section}>
        <div style={s.sectionTitle}>Recent</div>
        {[
          {t: '2m', m: 'claude-opus-4', c: '$0.42', color: '#C96442'},
          {t: '5m', m: 'gpt-4o', c: '$0.08', color: '#7d8775'},
          {t: '12m', m: 'claude-sonnet-4', c: '$0.12', color: '#C96442'},
          {t: '1h', m: 'gemini-2.5-pro', c: '$0.03', color: '#b8995c'},
        ].map((r, i) => (
          <div key={i} style={s.req}>
            <span style={s.reqTime}>{r.t}</span>
            <span style={{...s.reqDot, background: r.color}} />
            <span style={s.reqModel}>{r.m}</span>
            <span style={s.reqCost}>{r.c}</span>
          </div>
        ))}
      </div>

      <div style={s.footer}>
        <button style={s.fbtn}>⚙ Settings</button>
        <button style={{...s.fbtn, ...s.fbtnPrimary}}>↻ Refresh</button>
      </div>
    </div>
  );
}

const creamLightStyles = {
  widget: {
    width: 370, background: '#F4EFE3', borderRadius: 16, overflow: 'hidden',
    border: '1px solid #E5DDC8',
    color: '#1a1815', fontSize: 13,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    boxShadow: '0 12px 36px rgba(40,32,16,0.12)',
  },
  header: { display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px 8px' },
  title: { flex: 1, fontSize: 15, fontWeight: 600, color: '#1a1815', letterSpacing: '-0.01em' },
  updated: { fontSize: 11, color: '#8a8470', fontFamily: 'JetBrains Mono, monospace' },
  hero: { padding: '8px 20px 16px' },
  heroLabel: { fontSize: 11, color: '#8a8470', letterSpacing: '0.05em', marginBottom: 4, textTransform: 'uppercase' },
  heroValueRow: { display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 },
  heroValue: {
    fontFamily: 'JetBrains Mono, monospace', fontSize: 38, fontWeight: 600,
    color: '#1a1815', letterSpacing: '-0.03em', lineHeight: 1,
  },
  heroSub: { fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#8a8470' },
  sparkline: { marginTop: 8 },
  pills: { display: 'flex', gap: 8, padding: '0 20px 16px' },
  pill: {
    flex: 1, background: '#FBF7EA', borderRadius: 10, padding: '10px 12px',
    display: 'flex', flexDirection: 'column', gap: 2,
    border: '1px solid #EFE5C8',
  },
  pillLabel: { fontSize: 10, color: '#8a8470', textTransform: 'uppercase', letterSpacing: '0.05em' },
  pillValue: { fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 600, color: '#1a1815' },
  hr: { height: 1, background: '#E5DDC8', margin: '0 20px' },
  section: { padding: '14px 20px' },
  sectionTitle: { fontSize: 10, color: '#8a8470', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 },
  providerRow: { marginBottom: 10 },
  providerInfo: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 },
  providerDot: { width: 6, height: 6, borderRadius: '50%' },
  providerName: { flex: 1, fontSize: 12, color: '#1a1815' },
  providerCost: { fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#1a1815' },
  barTrack: { height: 3, background: '#E5DDC8', borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 2, transition: 'width .4s ease' },
  req: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' },
  reqTime: { width: 32, fontSize: 10, color: '#8a8470', fontFamily: 'JetBrains Mono, monospace' },
  reqDot: { width: 6, height: 6, borderRadius: '50%' },
  reqModel: { flex: 1, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#3d362a' },
  reqCost: { fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#1a1815' },
  footer: { display: 'flex', gap: 8, padding: '12px 20px 16px', borderTop: '1px solid #E5DDC8' },
  fbtn: {
    flex: 1, background: 'transparent', border: '1px solid #D4C9AC',
    color: '#3d362a', fontSize: 12, padding: '8px 10px', borderRadius: 8,
    cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
  },
  fbtnPrimary: { background: '#C96442', borderColor: '#C96442', color: '#fff' },
};

window.WidgetCreamLight = WidgetCreamLight;
