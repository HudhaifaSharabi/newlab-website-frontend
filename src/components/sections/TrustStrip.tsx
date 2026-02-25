"use client";

import {useEffect, useRef} from 'react';
import {useLocale} from 'next-intl';
import gsap from 'gsap';
import {Container} from '@/components/Container';

const content = {
  ar: {
    title: 'اعتمادات وسجلات تشغيل ثابتة',
    items: ['ISO 15189', '12 سنة تشغيل', '220,000+ فحص', '4 فروع وخدمة منزلية']
  },
  en: {
    title: 'Accreditations & steady operations',
    items: ['ISO 15189', '12 years operating', '220,000+ tests', '4 branches + home service']
  }
} as const;

export function TrustStrip() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(sectionRef.current?.querySelectorAll('[data-fade]') ?? [], {
        opacity: 0,
        y: 16,
        duration: 0.9,
        ease: 'power2.out',
        stagger: 0.08
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const copy = content[isRTL ? 'ar' : 'en'];

  return (
    <section
      id="trust"
      ref={sectionRef}
      className="relative flex min-h-screen items-center bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
    >
      <Container className="relative w-full">
        <div className="rounded-3xl border border-slate-200/70 bg-white/75 p-10 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-slate-800/60 dark:bg-[#1a658d]/80">
          <div
            data-fade
            className="text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {copy.title}
          </div>
          <div
            className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            dir={isRTL ? 'rtl' : 'ltr'}
            aria-label={copy.title}
          >
            {copy.items.map((item) => (
              <div
                key={item}
                data-fade
                className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-5 text-center text-sm font-semibold text-slate-800 shadow-sm dark:border-slate-800/70 dark:bg-slate-800/60 dark:text-slate-100"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
