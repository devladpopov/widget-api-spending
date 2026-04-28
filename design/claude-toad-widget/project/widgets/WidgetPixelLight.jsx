// Variant D — Pixel Arcade, light cream version (no glow, no scanlines)
function WidgetPixelLight() {
  const s = pixelLightStyles;
  return (
    <div style={s.widget}>
      <div style={s.header}>
        <Toad size={36} eyeColor="#1a1815" />
        <div style={{ flex: 1 }}>
          <div style={s.title}>API SPENDING</div>
          <div style={s.subtitle}>HIGH SCORE TRACKER</div>
        </div>
        <div style={s.live}>● LIVE</div>
      </div>

      <div style={s.scoreboard}>
        <div style={s.scoreLabel}>SCORE · TODAY</div>
        <div style={s.scoreValue}>$4.23</div>
        <div style={s.scoreSub}>£3.35 · BEST $9.40</div>
      </div>

      <div style={s.stats}>
        <div style={s.stat}>
          <div style={s.statLabel}>WEEK</div>
          <div style={s.statValue}>$28.71</div>
        </div>
        <div style={s.stat}>
          <div style={s.statLabel}>MONTH</div>
          <div style={s.statValue}>$142.50</div>
        </div>
      </div>

      <div style={s.section}>
        <div style={s.sectionTitle}>★ BY PROVIDER</div>
        {[
          {name: 'ANTHROPIC', segs: 14, total: 18, cost: '$3.10', color: '#C96442'},
          {name: 'OPENAI   ', segs: 4,  total: 18, cost: '$0.98', color: '#7d8775'},
          {name: 'GEMINI   ', segs: 1,  total: 18, cost: '$0.15', color: '#b8995c'},
        ].map(p => (
          <div key={p.name} style={s.pProv}>
            <span style={s.pProvName}>{p.name}</span>
            <div style={s.pBar}>
              {Array.from({length: p.total}).map((_, i) => (
                <span key={i} style={{
                  ...s.pSeg,
                  background: i < p.segs ? p.color : '#E5DDC8',
                }} />
              ))}
            </div>
            <span style={s.pProvCost}>{p.cost}</span>
          </div>
        ))}
      </div>

      <div style={s.section}>
        <div style={s.sectionTitle}>★ LAST PLAYS</div>
        {[
          {t: '02M', m: 'claude-opus-4', c: '$0.42', color: '#C96442'},
          {t: '05M', m: 'gpt-4o', c: '$0.08', color: '#7d8775'},
          {t: '12M', m: 'claude-sonnet-4', c: '$0.12', color: '#C96442'},
          {t: '01H', m: 'gemini-2.5-pro', c: '$0.03', color: '#b8995c'},
        ].map((r, i) => (
          <div key={i} style={s.pReq}>
            <span style={s.pTime}>{r.t}</span>
            <span style={{...s.pDot, background: r.color}} />
            <span style={s.pModel}>{r.m}</span>
            <span style={s.pCost}>{r.c}</span>
          </div>
        ))}
      </div>

      <div style={s.footer}>
        <button style={s.pBtn}>⚙ SETTINGS</button>
        <button style={{...s.pBtn, ...s.pBtnAccent}}>↻ INSERT COIN</button>
      </div>
    </div>
  );
}

const pixelLightStyles = {
  widget: {
    width: 370, background: '#F4EFE3', borderRadius: 6, overflow: 'hidden',
    border: '2px solid #1a1815',
    color: '#1a1815', fontSize: 11,
    fontFamily: '"Press Start 2P", "JetBrains Mono", monospace',
    boxShadow: '4px 4px 0 #1a1815, 0 12px 36px rgba(40,32,16,0.12)',
  },
  header: { display: 'flex', alignItems: 'center', gap: 10, padding: '14px 14px 10px' },
  title: { fontSize: 12, fontWeight: 700, color: '#1a1815', letterSpacing: '0.04em' },
  subtitle: { fontSize: 8, color: '#8a8470', letterSpacing: '0.12em', marginTop: 4 },
  live: { fontSize: 8, color: '#C96442', letterSpacing: '0.05em' },
  scoreboard: {
    margin: '4px 14px 14px',
    background: '#FBF7EA',
    border: '2px solid #1a1815',
    padding: '14px 14px 12px',
    textAlign: 'center',
  },
  scoreLabel: { fontSize: 8, color: '#8a8470', letterSpacing: '0.18em', marginBottom: 8 },
  scoreValue: { fontSize: 30, fontWeight: 700, color: '#1a1815', letterSpacing: '0.04em', lineHeight: 1 },
  scoreSub: { fontSize: 8, color: '#8a8470', marginTop: 8, letterSpacing: '0.08em' },
  stats: { display: 'flex', gap: 8, padding: '0 14px 14px' },
  stat: {
    flex: 1, background: '#FBF7EA', border: '2px solid #1a1815',
    padding: '10px 12px', textAlign: 'center',
  },
  statLabel: { fontSize: 8, color: '#8a8470', letterSpacing: '0.12em', marginBottom: 6 },
  statValue: { fontSize: 13, color: '#1a1815', letterSpacing: '0.02em' },
  section: { padding: '0 14px 12px' },
  sectionTitle: { fontSize: 8, color: '#C96442', letterSpacing: '0.18em', marginBottom: 10 },
  pProv: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  pProvName: { width: 76, fontSize: 8, color: '#3d362a', letterSpacing: '0.05em' },
  pBar: { display: 'flex', gap: 2, flex: 1 },
  pSeg: { flex: 1, height: 10 },
  pProvCost: { width: 40, textAlign: 'right', fontSize: 9, color: '#1a1815' },
  pReq: { display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 8 },
  pTime: { width: 28, color: '#8a8470', letterSpacing: '0.05em' },
  pDot: { width: 6, height: 6, flexShrink: 0 },
  pModel: { flex: 1, color: '#3d362a', letterSpacing: '0.02em' },
  pCost: { color: '#1a1815', letterSpacing: '0.02em' },
  footer: {
    display: 'flex', gap: 8, padding: '10px 14px 14px',
    borderTop: '2px dashed #1a1815', marginTop: 4,
  },
  pBtn: {
    flex: 1, background: '#FBF7EA', border: '2px solid #1a1815',
    color: '#3d362a', fontSize: 8, padding: '9px 10px', borderRadius: 0,
    cursor: 'pointer', letterSpacing: '0.12em', fontFamily: 'inherit',
    boxShadow: '2px 2px 0 #1a1815',
  },
  pBtnAccent: { background: '#C96442', color: '#fff', borderColor: '#1a1815' },
};

window.WidgetPixelLight = WidgetPixelLight;
