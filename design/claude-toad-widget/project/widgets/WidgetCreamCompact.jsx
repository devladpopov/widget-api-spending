// Variant A — Cream Compact (minimal: just hero + week/month + footer)
function WidgetCreamCompact() {
  const s = compactStyles;
  return (
    <div style={s.widget}>
      <div style={s.header}>
        <Toad size={28} eyeColor="#1a1815" />
        <div style={s.title}>API Spending</div>
        <div style={s.updated}>2m ago</div>
      </div>

      <div style={s.body}>
        <div style={s.heroBlock}>
          <div style={s.heroLabel}>TODAY</div>
          <div style={s.heroValue}>$4.23</div>
          <div style={s.heroSub}>£3.35</div>
        </div>
        <div style={s.heroSide}>
          <div style={s.sideRow}>
            <span style={s.sideLabel}>Week</span>
            <span style={s.sideVal}>$28.71</span>
          </div>
          <div style={s.sideRow}>
            <span style={s.sideLabel}>Month</span>
            <span style={s.sideVal}>$142.50</span>
          </div>
        </div>
      </div>

      <div style={s.footer}>
        <button style={s.fbtn}>⚙ Settings</button>
        <button style={{...s.fbtn, ...s.fbtnPrimary}}>↻ Refresh</button>
      </div>
    </div>
  );
}

const compactStyles = {
  widget: {
    width: 370, background: '#F4EFE3', borderRadius: 14, overflow: 'hidden',
    border: '1px solid #E5DDC8',
    color: '#1a1815', fontSize: 13,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    boxShadow: '0 12px 36px rgba(40,32,16,0.12)',
  },
  header: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px 14px',
  },
  title: { flex: 1, fontSize: 15, fontWeight: 600, color: '#1a1815', letterSpacing: '-0.01em' },
  updated: { fontSize: 11, color: '#8a8470', fontFamily: 'JetBrains Mono, monospace' },
  body: {
    display: 'flex', padding: '0 18px 16px', gap: 18, alignItems: 'center',
  },
  heroBlock: { flex: '0 0 auto' },
  heroLabel: { fontSize: 10, color: '#8a8470', letterSpacing: '0.12em', marginBottom: 4 },
  heroValue: {
    fontFamily: 'JetBrains Mono, monospace', fontSize: 42, fontWeight: 600,
    color: '#1a1815', letterSpacing: '-0.04em', lineHeight: 1,
  },
  heroSub: { fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#8a8470', marginTop: 6 },
  heroSide: {
    flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
    paddingLeft: 18, borderLeft: '1px solid #E5DDC8',
    alignSelf: 'stretch',
    paddingTop: 14, paddingBottom: 6,
    gap: 10,
  },
  sideRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
  },
  sideLabel: { fontSize: 12, color: '#8a8470' },
  sideVal: { fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: '#1a1815', fontWeight: 600 },
  footer: { display: 'flex', gap: 8, padding: '10px 18px 14px', borderTop: '1px solid #E5DDC8' },
  fbtn: {
    flex: 1, background: 'transparent', border: '1px solid #D4C9AC',
    color: '#3d362a', fontSize: 12, padding: '9px 10px', borderRadius: 8,
    cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
  },
  fbtnPrimary: { background: '#C96442', borderColor: '#C96442', color: '#fff' },
};

window.WidgetCreamCompact = WidgetCreamCompact;
