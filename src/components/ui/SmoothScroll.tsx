"use client";

import {useEffect, useRef} from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {prefersReducedMotion} from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll({children}: {children: React.ReactNode}) {
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || prefersReducedMotion()) return;

    const lenis = new Lenis({
      lerp: 0.12,
      smoothWheel: true
    });

    const raf = (time: number) => {
      lenis.raf(time);
      ScrollTrigger.update();
      rafRef.current = requestAnimationFrame(raf);
    };

    lenis.on('scroll', ScrollTrigger.update);
    rafRef.current = requestAnimationFrame(raf);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
