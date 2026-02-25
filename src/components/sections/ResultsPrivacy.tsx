"use client";

import {useEffect, useRef} from 'react';
import {useLocale} from 'next-intl';
import gsap from 'gsap';
import {Container} from '@/components/Container';

export function ResultsPrivacy() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from(ref.current?.querySelectorAll('[data-fade]') ?? [], {
        opacity: 0,
        y: 14,
        duration: 1.1,
        ease: 'power2.out',
        stagger: 0.1
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="results"
      ref={ref}
      className="relative flex min-h-screen items-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900"
    >
      <Container className="grid h-full gap-10 lg:grid-cols-2" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex flex-col justify-center space-y-4">
          <p data-fade className="heading-accent">
            {isRTL ? 'نتائج وسرية' : 'Results & privacy'}
          </p>
          <h2 data-fade className="text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
            {isRTL ? 'لحظة الطمأنينة' : 'Moment of relief'}
          </h2>
          <ul className="space-y-3 text-slate-700 dark:text-slate-300">
            {[
              isRTL ? 'تسليم رقمي مشفر (OTP)' : 'Encrypted digital delivery (OTP)',
              isRTL ? 'تقارير واضحة بثوابت مرجعية' : 'Clear reports with reference anchors',
              isRTL ? 'قنوات اتصال للطبيب والمريض' : 'Direct clinician & patient access'
            ].map((item) => (
              <li key={item} data-fade className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="relative h-[420px] w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.45)] backdrop-blur dark:border-slate-800/70 dark:bg-[#1a658d]/70">
            <div className="space-y-4 text-sm text-slate-700 dark:text-slate-200">
              {['Access', 'Review', 'Issue'].map((label, idx) => (
                <div key={label} className="rounded-2xl border border-slate-200/60 bg-white/80 p-4 dark:border-slate-800/60 dark:bg-slate-800/60">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                    <span>{isRTL ? `خطوة ${idx + 1}` : `Step ${idx + 1}`}</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  </div>
                  <p className="mt-2 text-base font-semibold text-slate-900 dark:text-white">
                    {isRTL
                      ? ['تأكيد هوية واستحقاق الوصول', 'مراجعة الطبيب للنتائج والحدود', 'إصدار التقرير الرقمي وإشعار المريض'][idx]
                      : ['Identity & access check', 'Physician review of ranges', 'Issue digital report + notify'][idx]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
