"use client";

import {useEffect, useRef, useState} from 'react';
import {useLocale} from 'next-intl';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {Container} from '@/components/Container';

gsap.registerPlugin(ScrollTrigger);

const sop = [
  {key: 'registration', ar: 'تسجيل البيانات', en: 'Registration'},
  {key: 'collection', ar: 'سحب العينة', en: 'Sample Collection'},
  {key: 'analysis', ar: 'التحليل الآلي', en: 'Analysis'},
  {key: 'qc', ar: 'مراجعة الجودة', en: 'Quality Review'},
  {key: 'report', ar: 'إصدار التقرير', en: 'Report Issuance'}
];

export function Process() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const sectionRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      const trigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=400%',
        pin: true,
        scrub: 0.8,
        onUpdate: (self) => {
          const progress = self.progress;
          const idx = Math.min(sop.length - 1, Math.floor(progress * sop.length + 0.01));
          setActiveIdx(idx);
          gsap.to(indicatorRef.current, {scaleY: progress, transformOrigin: 'top', duration: 0.2, ease: 'linear'});
        }
      });

      gsap.from(sectionRef.current?.querySelectorAll('[data-step]') ?? [], {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power2.out'
      });

      return () => trigger.kill();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="process"
      ref={sectionRef}
      className="relative flex min-h-screen items-center bg-gradient-to-b from-white to-slate-100 dark:from-slate-950 dark:to-slate-900"
    >
      <Container className="relative grid h-full grid-cols-[auto,1fr] gap-8">
        <div className="flex flex-col justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
          <p className="heading-accent">{isRTL ? 'إجراءات تشغيل قياسية' : 'Standard operating process'}</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
            {isRTL ? 'خطوات واضحة بلا فجوات' : 'No gaps. No risk.'}
          </h2>
          <p className="mt-2 max-w-md text-sm text-slate-700 dark:text-slate-300">
            {isRTL
              ? 'يتم تثبيت المقطع ليعمل كسجل خطوات؛ تمريرك يحدد أي خطوة يتم غلقها.'
              : 'Pinned SOP—your scroll progresses the sequence and closes each gate.'}
          </p>
          <div className="mt-8 h-64 w-1 rounded-full bg-slate-200/80 dark:bg-slate-800/80">
            <div ref={indicatorRef} className="h-full w-full scale-y-0 rounded-full bg-emerald-500 transition-transform" />
          </div>
        </div>

        <div className="grid content-center gap-6" dir={isRTL ? 'rtl' : 'ltr'}>
          {sop.map((step, idx) => (
            <div
              key={step.key}
              data-step
              className={`rounded-2xl border p-6 shadow-sm backdrop-blur transition-colors ${
                activeIdx >= idx
                  ? 'border-emerald-200/70 bg-white/80 dark:border-emerald-900/60 dark:bg-slate-800/70'
                  : 'border-slate-200/70 bg-white/60 dark:border-slate-800/60 dark:bg-[#1a658d]/60'
              }`}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                    activeIdx >= idx
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  }`}
                  aria-label={isRTL ? `الخطوة ${idx + 1}` : `Step ${idx + 1}`}
                >
                  {idx + 1}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {isRTL ? step.ar : step.en}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {isRTL
                      ? 'متابعة وتوثيق تلقائي لكل مرحلة مع ضوابط قبول ورفض.'
                      : 'Auto-tracked, logged, and validated at each gate.'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
