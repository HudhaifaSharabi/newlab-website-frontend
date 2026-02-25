"use client";

import {useEffect} from 'react';

// Lightweight Lenis-like smooth scrolling fallback to avoid missing dependency issues.
export function useLenis() {
  useEffect(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    let rafId: number | null = null;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const target = window.scrollY + event.deltaY;
      const start = window.scrollY;
      const duration = 600;
      const startTime = performance.now();

      const step = (now: number) => {
        const t = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        window.scrollTo({top: start + (target - start) * eased});
        if (t < 1) rafId = requestAnimationFrame(step);
      };
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(step);
    };

    window.addEventListener('wheel', handleWheel, {passive: false});
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);
}
