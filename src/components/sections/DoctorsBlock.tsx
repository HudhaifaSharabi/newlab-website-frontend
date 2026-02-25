"use client";

import {useEffect, useRef} from 'react';
import {useLocale} from 'next-intl';
import gsap from 'gsap';
import {Container} from '@/components/Container';

export function DoctorsBlock() {
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
      id="doctors"
      ref={ref}
      className="relative flex min-h-screen items-center bg-gradient-to-b from-slate-100 to-white dark:from-slate-950 dark:to-slate-900"
    >
      <Container className="h-full" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="grid h-full grid-cols-1 gap-10 lg:grid-cols-[1fr,1fr]">
          <div className="flex flex-col justify-center space-y-4">
            <p data-fade className="heading-accent">
              {isRTL ? 'للأطباء' : 'For physicians'}
            </p>
            <h2 data-fade className="text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
              {isRTL ? 'طبقة السلطة المخفية' : 'Hidden authority layer'}
            </h2>
            <p data-fade className="max-w-xl text-slate-700 dark:text-slate-300">
              {isRTL
                ? 'اتساق المنهجيات، ثوابت مرجعية واضحة، وقناة مباشرة مع الفريق.'
                : 'Consistent methodologies, explicit reference anchors, and a direct channel with the team.'}
            </p>
          </div>
          <div className="grid content-center gap-4 rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.45)] backdrop-blur dark:border-slate-800/70 dark:bg-[#1a658d]/70">
            {[
              isRTL ? 'ثبات المنهجية بين الفحوصات والزيارات' : 'Methodology consistency across visits',
              isRTL ? 'قيم مرجعية موثقة لكل منصة تحليل' : 'Documented reference anchors per analyzer',
              isRTL ? 'تعليقات تفسيرية للحالات المعقدة' : 'Interpretive comments for complex markers',
              isRTL ? 'قناة اتصال مباشرة مع أخصائيي المختبر' : 'Direct line to lab specialists'
            ].map((item) => (
              <div
                key={item}
                data-fade
                className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm dark:border-slate-800/70 dark:bg-slate-800/60 dark:text-slate-100"
              >
                <span>{item}</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
