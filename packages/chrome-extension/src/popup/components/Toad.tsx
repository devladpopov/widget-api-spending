import { useRef, useState, useEffect, useCallback } from 'preact/hooks';
import type { JSX } from 'preact';

interface ToadProps {
  size?: number;
  eyeColor?: string;
  onClick?: () => void;
}

export function Toad({ size = 32, eyeColor = '#1a1815', onClick }: ToadProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const eyeLRef = useRef<HTMLDivElement>(null);
  const eyeRRef = useRef<HTMLDivElement>(null);
  const [blink, setBlink] = useState(false);
  const [croak, setCroak] = useState(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height * 0.3;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ang = Math.atan2(dy, dx);

      // Eyes follow cursor
      const eyeMax = r.width * 0.035;
      const eyeScale = Math.min(1, dist / 200);
      const ox = Math.cos(ang) * eyeMax * eyeScale;
      const oy = Math.sin(ang) * eyeMax * eyeScale;
      if (eyeLRef.current) eyeLRef.current.style.transform = `translate(${ox}px, ${oy}px)`;
      if (eyeRRef.current) eyeRRef.current.style.transform = `translate(${ox}px, ${oy}px)`;

      // Whole body shifts horizontally toward cursor (subtle lean)
      const bodyMax = r.width * 0.06;
      const bodyScale = Math.min(1, dist / 300);
      const bodyX = Math.cos(ang) * bodyMax * bodyScale;
      const bodyRotate = bodyX * 0.15; // slight tilt in movement direction
      if (bodyRef.current) {
        bodyRef.current.style.transform = `translateX(${bodyX}px) rotate(${bodyRotate}deg)`;
      }
    };
    document.addEventListener('mousemove', onMove);
    return () => document.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
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

  const handleClick = useCallback(() => {
    setCroak(true);
    setTimeout(() => setCroak(false), 280);
    onClick?.();
  }, [onClick]);

  const eyeStyle = (left: string): JSX.CSSProperties => ({
    position: 'absolute',
    left,
    top: '17.14%',
    width: '8.28%',
    height: blink ? '2%' : '13.27%',
    marginTop: blink ? '5.5%' : '0',
    background: eyeColor,
    transition: 'height .08s ease, margin-top .08s ease',
  });

  return (
    <div
      ref={ref}
      onClick={handleClick}
      style={{
        position: 'relative',
        width: size,
        height: size * 0.72,
        cursor: 'pointer',
        flexShrink: 0,
        transform: croak ? 'scale(1.15) rotate(-3deg)' : 'scale(1)',
        transition: 'transform 0.15s cubic-bezier(.5,1.8,.5,1)',
      }}
    >
      <div
        ref={bodyRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transition: 'transform 0.12s ease-out',
        }}
      >
        <img
          src="assets/claude-toad-clear-no-eyes.png"
          alt=""
          style={{ width: '100%', display: 'block', imageRendering: 'pixelated' }}
          draggable={false}
        />
        <div ref={eyeLRef} style={eyeStyle('24.97%')} />
        <div ref={eyeRRef} style={eyeStyle('66.90%')} />
      </div>
    </div>
  );
}
