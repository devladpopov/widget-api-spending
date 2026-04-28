// Animated toad component — eye tracking + blinks + click croak
function Toad({ size = 36, speech = null, eyeColor = '#000', onClick }) {
  const ref = React.useRef(null);
  const eyeLRef = React.useRef(null);
  const eyeRRef = React.useRef(null);
  const [blink, setBlink] = React.useState(false);
  const [croak, setCroak] = React.useState(false);

  React.useEffect(() => {
    const onMove = (e) => {
      const el = ref.current; if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height * 0.3;
      const dx = e.clientX - cx, dy = e.clientY - cy;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const max = r.width * 0.035;
      const scale = Math.min(1, dist / 200);
      const ang = Math.atan2(dy, dx);
      const ox = Math.cos(ang) * max * scale;
      const oy = Math.sin(ang) * max * scale;
      if (eyeLRef.current) eyeLRef.current.style.transform = `translate(${ox}px, ${oy}px)`;
      if (eyeRRef.current) eyeRRef.current.style.transform = `translate(${ox}px, ${oy}px)`;
    };
    document.addEventListener('mousemove', onMove);
    return () => document.removeEventListener('mousemove', onMove);
  }, []);

  React.useEffect(() => {
    let t;
    const sched = () => {
      t = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 130);
        sched();
      }, 2500 + Math.random() * 4000);
    };
    sched();
    return () => clearTimeout(t);
  }, []);

  const handleClick = () => {
    setCroak(true);
    setTimeout(() => setCroak(false), 280);
    onClick && onClick();
  };

  return (
    <div
      ref={ref}
      onClick={handleClick}
      style={{
        position: 'relative',
        width: size,
        height: size * 0.72, // toad image ratio
        cursor: 'pointer',
        flexShrink: 0,
        transform: croak ? 'scale(1.15) rotate(-3deg)' : 'scale(1)',
        transition: 'transform 0.15s cubic-bezier(.5,1.8,.5,1)',
      }}
    >
      <img
        src="assets/claude-toad-clear-no-eyes.png"
        alt=""
        style={{ width: '100%', display: 'block', imageRendering: 'pixelated' }}
        draggable={false}
      />
      <div ref={eyeLRef} style={{
        position: 'absolute', left: '24.97%', top: '17.14%',
        width: '8.28%', height: blink ? '2%' : '13.27%',
        marginTop: blink ? '5.5%' : 0,
        background: eyeColor,
        transition: 'height .08s ease, margin-top .08s ease',
      }} />
      <div ref={eyeRRef} style={{
        position: 'absolute', left: '66.90%', top: '17.14%',
        width: '8.28%', height: blink ? '2%' : '13.27%',
        marginTop: blink ? '5.5%' : 0,
        background: eyeColor,
        transition: 'height .08s ease, margin-top .08s ease',
      }} />
    </div>
  );
}

// Speech bubble that rotates through quips
function ToadSpeech({ quips, style, bg = '#1A1A19', color = '#F4EFE3' }) {
  const [idx, setIdx] = React.useState(0);
  const [visible, setVisible] = React.useState(true);
  React.useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % quips.length);
        setVisible(true);
      }, 180);
    }, 4500);
    return () => clearInterval(t);
  }, [quips.length]);

  return (
    <div style={{
      position: 'absolute',
      background: bg,
      color,
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 10,
      lineHeight: 1.35,
      padding: '4px 8px',
      borderRadius: 6,
      whiteSpace: 'nowrap',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(-2px)',
      transition: 'opacity .18s, transform .18s',
      zIndex: 5,
      ...style,
    }}>
      {quips[idx]}
      <div style={{
        position: 'absolute',
        left: -5,
        top: '50%',
        transform: 'translateY(-50%)',
        borderTop: '4px solid transparent',
        borderBottom: '4px solid transparent',
        borderRight: `5px solid ${bg}`,
      }} />
    </div>
  );
}

const QUIPS = [
  'Ribbiting productivity.',
  'Toadally organised.',
  'Counting your tokens...',
  'Eating bugs, tracking costs.',
  '$4.23 today. Not bad.',
  'Croak. But productive.',
  'Thinking in lily pads...',
];

window.Toad = Toad;
window.ToadSpeech = ToadSpeech;
window.QUIPS = QUIPS;
