"use client";

import {useRef} from 'react';
import gsap from 'gsap';
import {useGSAP} from '@gsap/react';
import {ArrowDownRight} from 'lucide-react';
import dynamic from 'next/dynamic';
import {LoginButton} from '@/components/ui/LoginButton';
import {prefersReducedMotion} from '@/lib/motion';

const Scene = dynamic(() => import('@/components/canvas/Scene').then((mod) => mod.Scene), {
  ssr: false,
  loading: () => <div className="absolute inset-0 z-0 bg-transparent" />
});

gsap.registerPlugin(useGSAP);

const headlineWords = ['PRECISION', 'IN', 'EVERY', 'CELL'];

export function Hero() {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const subRef = useRef<HTMLParagraphElement | null>(null);
  const badgeRef = useRef<HTMLDivElement | null>(null);
  const statsRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const heading = headingRef.current;
      const sub = subRef.current;
      const badge = badgeRef.current;
      const stats = statsRef.current;
      if (!heading || !sub || !badge) return;

      const words = heading.querySelectorAll('[data-word]');
      gsap.set([words, sub, badge, stats], {opacity: 0, y: 24});

      const tl = gsap.timeline({defaults: {ease: 'power3.out'}});
      tl.to(words, {opacity: 1, y: 0, duration: 1.1, stagger: 0.08}, 0);
      tl.to(sub, {opacity: 0.9, y: 0, duration: 0.9}, 0.2);
      tl.to(badge, {opacity: 1, y: 0, duration: 0.7}, 0.25);
      if (stats) tl.to(stats.children, {opacity: 1, y: 0, stagger: 0.1, duration: 0.8}, 0.35);

      window.dispatchEvent(new Event('hero-nav-reveal'));
    },
    {scope: headingRef}
  );

  return (
    <section id="overview" className="relative isolate flex min-h-[95vh] items-center overflow-hidden text-white">
      <Scene />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(0,240,255,0.12),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(57,255,20,0.12),transparent_32%),linear-gradient(180deg,rgba(2,6,23,0.4),rgba(2,6,23,0.92))]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.02)_40%,transparent_70%)] mix-blend-screen" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-24">
        <div
          ref={badgeRef}
          className="w-fit rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-cyan-100 shadow-[0_0_40px_rgba(0,240,255,0.2)] backdrop-blur"
        >
          Microscopic Precision
        </div>

        <div className="max-w-5xl space-y-6">
          <h1
            ref={headingRef}
            className="text-4xl font-semibold leading-[0.95] tracking-[0.12em] text-white drop-shadow-[0_12px_60px_rgba(0,240,255,0.18)] sm:text-5xl lg:text-6xl"
          >
            {headlineWords.map((word) => (
              <span
                key={word}
                data-word
                className="mr-4 inline-flex rounded-lg bg-white/5 px-3 py-2 text-white/90 shadow-[0_10px_50px_rgba(0,0,0,0.35)]"
              >
                {word}
              </span>
            ))}
          </h1>
          <p ref={subRef} className="max-w-3xl text-lg text-white/70 sm:text-xl">
            Precision in every data point, in every sample. We fuse optics-grade glassmorphism with molecular visuals so you
            can feel the rigor of New Lab Specialized from the first scroll.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <LoginButton label="Portal" href="/portal" />
          <a
            href="#services"
            className="group inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur-xl transition hover:border-cyan-300/50 hover:text-white"
          >
            <span>View Services</span>
            <ArrowDownRight className="h-5 w-5 transition duration-200 group-hover:translate-y-1 group-hover:text-cyan-200" />
          </a>
        </div>

        <div ref={statsRef} className="grid w-full gap-4 text-sm text-white/80 sm:grid-cols-3">
          {[
            {label: 'Lab Uptime', value: '99.99%', detail: 'Redundant analyzers + QC locks'},
            {label: 'Genetic Depth', value: '500x', detail: 'Coverage on oncology panels'},
            {label: 'Home Visits', value: '24/7', detail: 'Mobile phlebotomy ready'}
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-surface flex flex-col gap-1 rounded-xl px-4 py-4 opacity-0"
            >
              <div className="text-xs uppercase tracking-[0.2em] text-cyan-200">{stat.label}</div>
              <div className="text-2xl font-semibold text-white">{stat.value}</div>
              <div className="text-xs text-white/60">{stat.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
