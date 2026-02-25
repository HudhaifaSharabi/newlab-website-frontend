"use client";

import {useRef} from 'react';
import {ArrowRight} from 'lucide-react';
import gsap from 'gsap';
import {prefersReducedMotion} from '@/lib/motion';
import clsx from 'clsx';

type LoginButtonProps = {
  href?: string;
  label?: string;
  className?: string;
};

export function LoginButton({href = '/portal', label = 'Enter Portal', className}: LoginButtonProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const handleHover = (hovered: boolean) => {
    if (!buttonRef.current || prefersReducedMotion()) return;
    gsap.to(buttonRef.current, {
      scale: hovered ? 1.08 : 1,
      boxShadow: hovered
        ? '0 0 40px rgba(0,240,255,0.6), 0 0 0 1px rgba(0,240,255,0.3)'
        : '0 0 28px rgba(0,240,255,0.28)',
      duration: 0.25,
      ease: 'power2.out'
    });
  };

  const handleClick = () => {
    if (!buttonRef.current) return;
    const target = href;
    if (prefersReducedMotion()) {
      if (target) window.location.href = target;
      return;
    }
    gsap
      .timeline({
        defaults: {ease: 'power3.inOut'},
        onComplete: () => {
          if (target) window.location.href = target;
        }
      })
      .to(buttonRef.current, {
        scale: 1.15,
        boxShadow: '0 0 70px rgba(0,240,255,0.7)',
        duration: 0.18
      })
      .to(
        buttonRef.current,
        {
          scale: 12,
          opacity: 0,
          duration: 0.55
        },
        '<'
      );
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onMouseEnter={() => handleHover(true)}
      onMouseLeave={() => handleHover(false)}
      onFocus={() => handleHover(true)}
      onBlur={() => handleHover(false)}
      onClick={handleClick}
      className={clsx(
        'group relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-cyan-400/40 bg-cyan-400/10 text-sm font-semibold uppercase tracking-[0.16em] text-cyan-100 shadow-[0_0_28px_rgba(0,240,255,0.28)] backdrop-blur-2xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70',
        className
      )}
    >
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,240,255,0.24),transparent_45%)]" />
      <span className="relative flex items-center gap-2 text-xs font-bold tracking-[0.2em]">
        <span className="hidden sm:inline">{label}</span>
        <ArrowRight className="h-4 w-4 transition duration-200 group-hover:translate-x-1" />
      </span>
    </button>
  );
}
