"use client";

import {useEffect, useRef} from 'react';
import {useLocale} from 'next-intl';
import gsap from 'gsap';
import {Container} from '@/components/Container';

export function FinalCta() {
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
        duration: 1,
        ease: 'power2.out',
        stagger: 0.1
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="final-cta"
      ref={ref}
      className="relative flex min-h-screen items-center bg-gradient-to-b from-slate-100 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
    >
      <Container className="relative" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex flex-col items-start justify-center space-y-6 rounded-3xl border border-slate-200/70 bg-white/80 p-10 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.45)] backdrop-blur dark:border-slate-800/70 dark:bg-[#1a658d]/80 lg:p-14">
          <p data-fade className="heading-accent">
            {isRTL ? 'قرار هادئ' : 'Quiet decision'}
          </p>
          <h2 data-fade className="text-3xl font-semibold leading-tight text-slate-900 dark:text-white sm:text-4xl">
            {isRTL ? 'عندما تحتاج تحليلًا… تحتاج نظامًا تثق به.' : 'When you need a test, you need a system you trust.'}
          </h2>
          <div className="flex flex-wrap gap-3" data-fade>
            <a
              href="#services"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
            >
              {isRTL ? 'سحب منزلي' : 'Book a test'}
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/70 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:border-emerald-400 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100"
            >
              {isRTL ? 'تواصل معنا' : 'Contact us'}
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
