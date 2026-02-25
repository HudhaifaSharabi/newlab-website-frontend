"use client";

import {useEffect, useRef} from 'react';
import {prefersReducedMotion} from '@/lib/motion';

export function MicroscopeCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || prefersReducedMotion()) return;
    const cursor = cursorRef.current;
    const inner = innerRef.current;
    if (!cursor || !inner) return;

    const target = {x: window.innerWidth / 2, y: window.innerHeight / 2};
    const pos = {x: target.x, y: target.y};
    let raf: number | null = null;

    const move = (event: PointerEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;
    };

    const down = () => cursor.classList.add('scale-90');
    const up = () => cursor.classList.remove('scale-90');

    const loop = () => {
      pos.x += (target.x - pos.x) * 0.18;
      pos.y += (target.y - pos.y) * 0.18;
      cursor.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      inner.style.transform = `translate(-50%, -50%) scale(1.02)`;
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed left-0 top-0 z-[9999] hidden -translate-x-1/2 -translate-y-1/2 md:block"
    >
      <div
        ref={innerRef}
        className="relative h-14 w-14 rounded-full border border-white/30 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur-2xl transition duration-150"
        style={{boxShadow: '0 0 30px rgba(0, 240, 255, 0.35)', mixBlendMode: 'screen'}}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/20 via-transparent to-emerald-300/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_20px_6px_rgba(0,240,255,0.45)]" />
      </div>
    </div>
  );
}
