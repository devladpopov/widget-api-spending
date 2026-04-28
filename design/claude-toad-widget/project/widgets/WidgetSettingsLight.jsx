// Settings page in Cream style (matches WidgetCream)
function WidgetSettingsLight() {
  const s = setLightStyles;
  const [currency, setCurrency] = React.useState('USD');
  const [providers, setProviders] = React.useState({anthropic: true, openai: true, gemini: true});
  const [budget, setBudget] = React.useState(10);

  return (
    <div style={s.widget}>
      <div style={s.header}>
        <button style={s.back}>←</button>
        <Toad size={28} eyeColor="#1a1815" />
        <div style={s.title}>Settings</div>
      </div>

      <div style={s.section}>
        <div style={s.sectionTitle}>API Keys</div>
        {[
          {name: 'Anthropic', placeholder: 'sk-ant-...', set: true},
          {name: 'OpenAI', placeholder: 'sk-...', set: true},
          {name: 'Gemini', placeholder: 'AIza...', set: false},
        ].map(k => (
          <div key={k.name} style={s.keyRow}>
            <div style={s.keyLabel}>{k.name}</div>
            <input style={s.input} type="password" defaultValue={k.set ? '••••••••••••••••' : ''} placeholder={k.placeholder} />
            <span style={{...s.keyStatus, color: k.set ? '#C96442' : '#c9be9e'}}>●</span>
          </div>
        ))}
      </div>

      <div style={s.hr} />

      <div style={s.section}>
        <div style={s.sectionTitle}>Currency</div>
        <div style={s.segGroup}>
          {['USD', 'EUR', 'GBP', 'RUB'].map(c => (
            <button key={c}
              onClick={() => setCurrency(c)}
              style={{...s.seg, ...(currency === c ? s.segActive : {})}}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div style={s.hr} />

      <div style={s.section}>
        <div style={s.sectionTitle}>Providers</div>
        {Object.entries({Anthropic: 'anthropic', OpenAI: 'openai', Gemini: 'gemini'}).map(([label, key]) => (
          <div key={key} style={s.toggleRow}>
            <span style={s.toggleLabel}>{label}</span>
            <button
              onClick={() => setProviders(p => ({...p, [key]: !p[key]}))}
              style={{
                ...s.toggle,
                background: providers[key] ? '#C96442' : '#D4C9AC',
              }}
            >
              <span style={{
                ...s.toggleKnob,
                left: providers[key] ? 18 : 2,
              }} />
            </button>
          </div>
        ))}
      </div>

      <div style={s.hr} />

      <div style={s.section}>
        <div style={s.sectionTitleRow}>
          <span style={s.sectionTitle}>Daily budget alert</span>
          <span style={s.budgetVal}>${budget}</span>
        </div>
        <input
          type="range" min={1} max={50} value={budget}
          onChange={e => setBudget(+e.target.value)}
          style={s.range}
        />
        <div style={s.rangeLabels}>
          <span>$1</span><span>$50</span>
        </div>
      </div>

      <div style={s.footer}>
        <button style={s.cancelBtn}>Cancel</button>
        <button style={s.saveBtn}>Save changes</button>
      </div>
    </div>
  );
}

const setLightStyles = {
  widget: {
    width: 370, background: '#F4EFE3', borderRadius: 14, overflow: 'hidden',
    border: '1px solid #E5DDC8', color: '#1a1815', fontSize: 13,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    boxShadow: '0 12px 36px rgba(40,32,16,0.12)',
  },
  header: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '14px 18px 12px', borderBottom: '1px solid #E5DDC8',
  },
  back: {
    background: 'transparent', border: 'none', color: '#3d362a',
    fontSize: 18, cursor: 'pointer', padding: 0, marginRight: 4,
  },
  title: { fontSize: 15, fontWeight: 600, color: '#1a1815', flex: 1 },
  section: { padding: '14px 18px' },
  sectionTitle: {
    fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em',
    color: '#8a8470', marginBottom: 10, display: 'block',
  },
  sectionTitleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  budgetVal: { fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: '#C96442', fontWeight: 600 },
  keyRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  keyLabel: { width: 64, fontSize: 11, color: '#3d362a' },
  input: {
    flex: 1, background: '#FBF7EA', border: '1px solid #D4C9AC',
    color: '#1a1815', fontSize: 11, padding: '6px 10px', borderRadius: 6,
    fontFamily: 'JetBrains Mono, monospace', outline: 'none',
  },
  keyStatus: { fontSize: 10, width: 12 },
  hr: { height: 1, background: '#E5DDC8', margin: '0 18px' },
  segGroup: {
    display: 'flex', background: '#FBF7EA', borderRadius: 8, padding: 3,
    border: '1px solid #E5DDC8',
  },
  seg: {
    flex: 1, background: 'transparent', border: 'none',
    color: '#8a8470', fontSize: 11, padding: '6px 0', borderRadius: 5,
    cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', fontWeight: 500,
  },
  segActive: { background: '#C96442', color: '#fff' },
  toggleRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '8px 0',
  },
  toggleLabel: { fontSize: 13, color: '#1a1815' },
  toggle: {
    width: 36, height: 20, borderRadius: 10, border: 'none',
    position: 'relative', cursor: 'pointer', transition: 'background .2s',
    padding: 0,
  },
  toggleKnob: {
    position: 'absolute', top: 2, width: 16, height: 16, borderRadius: '50%',
    background: '#fff', transition: 'left .2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  },
  range: {
    width: '100%', accentColor: '#C96442', height: 4, marginTop: 4,
  },
  rangeLabels: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: 9, color: '#8a8470', fontFamily: 'JetBrains Mono, monospace',
    marginTop: 4,
  },
  footer: {
    display: 'flex', gap: 8, padding: '12px 18px 14px',
    borderTop: '1px solid #E5DDC8',
  },
  cancelBtn: {
    flex: 1, background: 'transparent', border: '1px solid #D4C9AC',
    color: '#3d362a', fontSize: 12, padding: '9px 0', borderRadius: 8,
    cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
  },
  saveBtn: {
    flex: 1, background: '#C96442', border: '1px solid #C96442',
    color: '#fff', fontSize: 12, fontWeight: 600,
    padding: '9px 0', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
  },
};

window.WidgetSettingsLight = WidgetSettingsLight;
