"use client";

import {useEffect, useMemo, useRef, useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {useTheme} from 'next-themes';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import clsx from 'clsx';
import {Container} from '@/components/Container';
import {ThreeBackground} from './ThreeBackground';

gsap.registerPlugin(ScrollTrigger);

export function HeroSection() {
  const t = useTranslations('hero');
  const locale = useLocale();
  const {resolvedTheme} = useTheme();
  const isRTL = locale === 'ar';
  const isDark = resolvedTheme !== 'light';

  const rootRef = useRef<HTMLDivElement>(null);
  const [orderProgress, setOrderProgress] = useState(0);
  const prefersReducedMotion = useRef(false);

  const pills = useMemo(() => [t('pillMotion'), t('pillIso'), t('pillHome')], [t]);
  const stats = useMemo(
    () => [
      {label: t('statOversight'), value: t('statOversightValue')},
      {label: t('statVelocity'), value: t('statVelocityValue')},
      {label: t('statAssays'), value: t('statAssaysValue')}
    ],
    [t]
  );

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    const section = rootRef.current;
    if (!section) return;

    const reduce = prefersReducedMotion.current;
    const ctx = gsap.context(() => {
      if (!reduce) {
        // Intentional, calm entrance: clipped reveal with slight displacement.
        const intro = gsap.timeline({defaults: {ease: 'power3.out'}});
        intro
          .from('[data-hero-eyebrow]', {opacity: 0, y: 18, clipPath: 'inset(0 0 100% 0)', duration: 0.8})
          .from(
            '[data-hero-line]',
            {opacity: 0, yPercent: 40, clipPath: 'inset(0 0 100% 0)', duration: 1.05, stagger: 0.12},
            '-=0.35'
          )
          .from('[data-hero-body]', {opacity: 0, y: 18, duration: 0.75}, '-=0.45')
          .from('[data-hero-cta]', {opacity: 0, y: 12, duration: 0.7, stagger: 0.08}, '-=0.35');

        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: '+=90%',
          scrub: true,
          onUpdate: (self) => setOrderProgress(self.progress),
          onLeaveBack: () => setOrderProgress(0)
        });

        gsap.to('[data-hero-stack]', {
          yPercent: -6,
          opacity: 0.94,
          scale: 0.985,
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=90%',
            scrub: true
          }
        });
      } else {
        setOrderProgress(1);
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="overview"
      ref={rootRef}
      className={clsx(
        'relative isolate h-screen -mt-24 pt-24 sm:-mt-28 sm:pt-28 overflow-hidden',
        isDark ? 'bg-[#050c15] text-white' : 'bg-slate-50 text-slate-900'
      )}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {/* Layered gradients sit beneath the molecular field to keep the hero systematic yet cinematic. */}
        <div
          className={clsx(
            'absolute inset-0 transition-colors duration-500',
            isDark ? 'bg-gradient-to-br from-[#071020] via-[#050c15] to-[#041427]' : 'bg-gradient-to-br from-slate-100 via-white to-slate-200'
          )}
        />
        <div
          className={clsx(
            'absolute inset-0 opacity-70 mix-blend-screen transition-all duration-500',
            isDark
              ? '[background:radial-gradient(60%_60%_at_20%_30%,rgba(59,200,255,0.14),transparent)]'
              : '[background:radial-gradient(60%_60%_at_20%_30%,rgba(91,166,197,0.18),transparent)]'
          )}
        />
        <div
          className={clsx(
            'absolute inset-0 opacity-65 mix-blend-screen transition-all duration-500',
            isDark
              ? '[background:radial-gradient(52%_52%_at_80%_10%,rgba(34,197,189,0.16),transparent)]'
              : '[background:radial-gradient(52%_52%_at_80%_10%,rgba(56,160,150,0.14),transparent)]'
          )}
        />
        <ThreeBackground orderProgress={orderProgress} themeMode={isDark ? 'dark' : 'light'} />
        <div
          className={clsx(
            'absolute inset-0 transition-colors duration-500',
            isDark ? 'bg-gradient-to-b from-transparent via-[#030a12]/28 to-[#030a12]' : 'bg-gradient-to-b from-transparent via-white/55 to-white'
          )}
        />
      </div>

      <Container className="relative z-10 h-full">
        <div
          aria-hidden
          className={clsx(
            'pointer-events-none absolute inset-0 opacity-80',
            isDark
              ? 'bg-[radial-gradient(circle_at_28%_38%,rgba(5,12,21,0.6),rgba(5,12,21,0.1),transparent_60%)]'
              : 'bg-[radial-gradient(circle_at_28%_38%,rgba(255,255,255,0.7),rgba(255,255,255,0.2),transparent_60%)]'
          )}
        />
        <div className="flex h-full items-center">
          <div
            className={clsx('grid w-full gap-10 lg:grid-cols-[1.4fr_1fr]', isRTL ? 'text-right' : 'text-left')}
            data-hero-stack
          >
            <div className="space-y-8">
              <div
                data-hero-eyebrow
                className={clsx(
                  'inline-flex items-center gap-3 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em]',
                  isDark
                    ? 'border-white/10 bg-white/5 text-teal-100/90'
                    : 'border-slate-200 bg-white/60 text-slate-700'
                )}
              >
                <span
                  className={clsx(
                    'h-2 w-2 rounded-full',
                    isDark ? 'bg-gradient-to-br from-cyan-400 via-emerald-400 to-lime-300' : 'bg-gradient-to-br from-teal-500 via-cyan-500 to-sky-400'
                  )}
                />
                {t('eyebrow')}
              </div>

              <div className="space-y-4">
                <div
                  className={clsx(
                    'leading-[0.92] text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}
                >
                  <div
                    data-hero-line
                    className={clsx(
                      'drop-shadow-[0_10px_35px_rgba(23,230,201,0.12)]',
                      isDark ? 'text-slate-50' : 'text-slate-900'
                    )}
                  >
                    {t('headlineA')}
                  </div>
                  <div
                    data-hero-line
                    className={clsx(
                      'bg-clip-text text-transparent',
                      isDark
                        ? 'bg-gradient-to-r from-cyan-300 via-emerald-200 to-sky-300'
                        : 'bg-gradient-to-r from-teal-600 via-cyan-600 to-slate-800'
                    )}
                  >
                    {t('headlineB')}
                  </div>
                  <div data-hero-line className={clsx(isDark ? 'text-slate-100/90' : 'text-slate-800')}>
                    {t('headlineC')}
                  </div>
                </div>
                <p
                  data-hero-body
                  className={clsx(
                    'max-w-3xl text-base leading-relaxed sm:text-lg',
                    isDark ? 'text-slate-200/90' : 'text-slate-700'
                  )}
                >
                  {t('subtitle')}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3" data-hero-cta>
                <a
                  href="#services"
                  className={clsx(
                    'inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-[0_18px_55px_-25px_rgba(34,197,189,0.55)] transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                    isDark
                      ? 'bg-gradient-to-r from-cyan-400 via-emerald-400 to-sky-400 text-slate-950 focus-visible:outline-emerald-300'
                      : 'bg-gradient-to-r from-teal-500 via-cyan-500 to-slate-800 text-white focus-visible:outline-cyan-300'
                  )}
                >
                  {t('primary')}
                </a>
                <a
                  href="#process"
                  className={clsx(
                    'inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                    isDark
                      ? 'border-white/20 bg-white/5 text-white/90 hover:border-cyan-200/50 hover:text-white focus-visible:outline-cyan-200/70'
                      : 'border-slate-200 bg-white/70 text-slate-800 hover:border-slate-400 hover:text-slate-900 focus-visible:outline-cyan-600/60'
                  )}
                >
                  {t('secondary')}
                </a>
              </div>

              <div className="flex flex-wrap gap-2 pt-1" aria-label="Identity signals">
                {pills.map((pill) => (
                  <span
                    key={pill}
                    className={clsx(
                      'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold backdrop-blur',
                      isDark
                        ? 'border-white/10 bg-white/5 text-slate-100/80'
                        : 'border-slate-200 bg-white/80 text-slate-700'
                    )}
                  >
                    <span
                      className={clsx(
                        'h-1.5 w-1.5 rounded-full',
                        isDark ? 'bg-gradient-to-r from-emerald-400 to-cyan-400' : 'bg-gradient-to-r from-teal-500 to-cyan-500'
                      )}
                      aria-hidden
                    />
                    {pill}
                  </span>
                ))}
              </div>
            </div>

            <div
              className={clsx(
                'flex flex-col gap-5 rounded-2xl border p-6 backdrop-blur',
                isDark
                  ? 'border-white/10 bg-white/5 shadow-[0_20px_60px_-32px_rgba(0,0,0,0.65)]'
                  : 'border-slate-200/70 bg-white/80 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)]'
              )}
            >
              {/* Dashboard-like glass card to anchor the motion identity with hard data. */}
              <div
                className={clsx(
                  'flex items-center justify-between text-xs uppercase tracking-[0.22em]',
                  isDark ? 'text-slate-200/60' : 'text-slate-500'
                )}
              >
                <span>{t('panelTitle')}</span>
                <span
                  className={clsx(
                    'rounded-full px-3 py-1 text-[11px] font-semibold shadow-soft',
                    isDark ? 'bg-gradient-to-r from-cyan-400 to-emerald-300 text-slate-950' : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                  )}
                >
                  {t('panelBadge')}
                </span>
              </div>
              <p className={clsx('text-sm', isDark ? 'text-slate-200/80' : 'text-slate-700')}>{t('panelCopy')}</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className={clsx(
                      'rounded-xl border p-4 shadow-[0_12px_30px_-20px_rgba(0,0,0,0.45)]',
                      isDark ? 'border-white/10 bg-white/5' : 'border-slate-200/70 bg-white/80'
                    )}
                  >
                    <div className={clsx('text-2xl font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
                      {stat.value}
                    </div>
                    <div
                      className={clsx(
                        'mt-1 text-xs uppercase tracking-[0.12em]',
                        isDark ? 'text-slate-300/70' : 'text-slate-500'
                      )}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
              <div
                className={clsx(
                  'flex items-center gap-3 rounded-xl border p-4 text-sm',
                  isDark
                    ? 'border-white/10 bg-gradient-to-r from-white/8 via-white/5 to-transparent text-slate-100/80'
                    : 'border-slate-200 bg-gradient-to-r from-slate-50 via-white to-transparent text-slate-700'
                )}
              >
                <span
                  className={clsx(
                    'h-2 w-2 animate-pulse rounded-full',
                    isDark ? 'bg-gradient-to-r from-emerald-300 to-cyan-300' : 'bg-gradient-to-r from-teal-500 to-cyan-500'
                  )}
                  aria-hidden
                />
                {t('panelFooter')}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
