"use client";

import {useEffect, useRef} from 'react';
import {useLocale} from 'next-intl';
import gsap from 'gsap';
import {Container} from '@/components/Container';

export function Coverage() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from(ref.current?.querySelectorAll('[data-fade]') ?? [], {
        opacity: 0,
        y: 18,
        duration: 0.9,
        ease: 'power2.out',
        stagger: 0.08
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="coverage"
      ref={ref}
      className="relative flex min-h-screen items-center bg-gradient-to-b from-slate-100 to-slate-50 dark:from-slate-950 dark:to-slate-900"
    >
      <Container className="grid h-full gap-10 lg:grid-cols-2" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex flex-col justify-center space-y-4">
          <p data-fade className="heading-accent">
            {isRTL ? 'التغطية والوصول' : 'Distribution & coverage'}
          </p>
          <h2 data-fade className="text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
            {isRTL ? 'نصل إليك ونُسلم النتائج رقمياً' : 'We reach you with digital delivery.'}
          </h2>
          <ul className="space-y-3 text-slate-700 dark:text-slate-300">
            {[
              isRTL ? 'الفروع: حدة + التحرير + نقاط جمع' : 'Branches: Hadda + Tahrir + collection points',
              isRTL ? 'خدمة سحب منزلية في صنعاء' : 'Home phlebotomy across Sana’a',
              isRTL ? 'نتائج رقمية مشفرة' : 'Encrypted digital reports'
            ].map((item) => (
              <li key={item} data-fade className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="pt-2">
            <a
              data-fade
              href="#contact"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
            >
              {isRTL ? 'طلب فحص منزلي' : 'Request home visit'}
            </a>
          </div>
        </div>

        <div className="relative flex items-center justify-center" aria-hidden>
          <div className="relative h-[420px] w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200/70 bg-white/70 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.45)] backdrop-blur dark:border-slate-800/70 dark:bg-[#1a658d]/70">
            <div className="absolute inset-0">
              <div className="absolute inset-8 rounded-2xl border border-dashed border-slate-300/60 dark:border-slate-700/60" />
              {[...Array(12)].map((_, idx) => (
                <span
                  key={idx}
                  className="absolute h-2 w-2 rounded-full bg-emerald-500/80"
                  style={{
                    top: `${20 + (idx * 60) % 320}px`,
                    left: `${80 + (idx * 45) % 260}px`
                  }}
                />
              ))}
              {[...Array(8)].map((_, idx) => (
                <div
                  key={`line-${idx}`}
                  className="absolute h-px w-24 bg-emerald-500/30"
                  style={{
                    top: `${60 + (idx * 40) % 300}px`,
                    left: `${40 + (idx * 50) % 260}px`,
                    transform: 'rotate(8deg)'
                  }}
                />
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 via-transparent to-slate-900/10" />
          </div>
        </div>
      </Container>
    </section>
  );
}
