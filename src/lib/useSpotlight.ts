"use client";

import {useEffect, useRef} from 'react';
import gsap from 'gsap';

export function useSpotlight() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el, {opacity: 0, y: 30}, {opacity: 1, y: 0, duration: 1.1, ease: 'power2.out'});
    }, el);
    return () => ctx.revert();
  }, []);

  return ref;
}
