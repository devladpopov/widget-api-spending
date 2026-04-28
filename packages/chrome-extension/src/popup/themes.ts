export interface Theme {
  widget: Record<string, string | number>;
  header: Record<string, string | number>;
  title: Record<string, string | number>;
  updated: Record<string, string | number>;
  hero: Record<string, string | number>;
  heroLabel: Record<string, string | number>;
  heroValueRow: Record<string, string | number>;
  heroValue: Record<string, string | number>;
  heroSub: Record<string, string | number>;
  sparkline: Record<string, string | number>;
  sparkGradOpacity: [number, number];
  pills: Record<string, string | number>;
  pill: Record<string, string | number>;
  pillLabel: Record<string, string | number>;
  pillValue: Record<string, string | number>;
  hr: Record<string, string | number>;
  section: Record<string, string | number>;
  sectionTitle: Record<string, string | number>;
  providerRow: Record<string, string | number>;
  providerInfo: Record<string, string | number>;
  providerDot: Record<string, string | number>;
  providerName: Record<string, string | number>;
  providerCost: Record<string, string | number>;
  barTrack: Record<string, string | number>;
  barFill: Record<string, string | number>;
  req: Record<string, string | number>;
  reqTime: Record<string, string | number>;
  reqDot: Record<string, string | number>;
  reqModel: Record<string, string | number>;
  reqCost: Record<string, string | number>;
  footer: Record<string, string | number>;
  fbtn: Record<string, string | number>;
  fbtnPrimary: Record<string, string | number>;
  eyeColor: string;
}

export const creamLight: Theme = {
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
  sparkGradOpacity: [0.22, 0],
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
  eyeColor: '#1a1815',
};

export const creamDark: Theme = {
  widget: {
    width: 370, background: '#262521', borderRadius: 16, overflow: 'hidden',
    border: '1px solid #3a3833',
    color: '#F4EFE3', fontSize: 13,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    boxShadow: '0 12px 50px rgba(0,0,0,0.5)',
  },
  header: { display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px 8px' },
  title: { flex: 1, fontSize: 15, fontWeight: 500, color: '#F4EFE3', letterSpacing: '-0.01em' },
  updated: { fontSize: 11, color: '#7d786d', fontFamily: 'JetBrains Mono, monospace' },
  hero: { padding: '8px 20px 16px' },
  heroLabel: { fontSize: 11, color: '#9c9486', letterSpacing: '0.05em', marginBottom: 4, textTransform: 'uppercase' },
  heroValueRow: { display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 },
  heroValue: {
    fontFamily: 'JetBrains Mono, monospace', fontSize: 38, fontWeight: 600,
    color: '#F4EFE3', letterSpacing: '-0.03em', lineHeight: 1,
  },
  heroSub: { fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#7d786d' },
  sparkline: { marginTop: 8, opacity: 0.9 },
  sparkGradOpacity: [0.3, 0],
  pills: { display: 'flex', gap: 8, padding: '0 20px 16px' },
  pill: {
    flex: 1, background: '#2e2c27', borderRadius: 10, padding: '10px 12px',
    display: 'flex', flexDirection: 'column', gap: 2,
    border: 'none',
  },
  pillLabel: { fontSize: 10, color: '#9c9486', textTransform: 'uppercase', letterSpacing: '0.05em' },
  pillValue: { fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 600, color: '#F4EFE3' },
  hr: { height: 1, background: '#3a3833', margin: '0 20px' },
  section: { padding: '14px 20px' },
  sectionTitle: { fontSize: 10, color: '#9c9486', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 },
  providerRow: { marginBottom: 10 },
  providerInfo: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 },
  providerDot: { width: 6, height: 6, borderRadius: '50%' },
  providerName: { flex: 1, fontSize: 12, color: '#F4EFE3' },
  providerCost: { fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#F4EFE3' },
  barTrack: { height: 3, background: '#3a3833', borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 2, transition: 'width .4s ease' },
  req: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' },
  reqTime: { width: 32, fontSize: 10, color: '#7d786d', fontFamily: 'JetBrains Mono, monospace' },
  reqDot: { width: 6, height: 6, borderRadius: '50%' },
  reqModel: { flex: 1, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#c2bcaf' },
  reqCost: { fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#F4EFE3' },
  footer: { display: 'flex', gap: 8, padding: '12px 20px 16px', borderTop: '1px solid #3a3833' },
  fbtn: {
    flex: 1, background: 'transparent', border: '1px solid #4a4842',
    color: '#c2bcaf', fontSize: 12, padding: '8px 10px', borderRadius: 8,
    cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
  },
  fbtnPrimary: { background: '#C96442', borderColor: '#C96442', color: '#fff' },
  eyeColor: '#F4EFE3',
};
