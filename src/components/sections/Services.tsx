"use client";

import {useEffect, useRef} from 'react';
import {useLocale} from 'next-intl';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {Container} from '@/components/Container';

gsap.registerPlugin(ScrollTrigger);

const catalog = {
  categories: ['Blood', 'Hormones', 'Vitamins', 'Chronic', 'Specialized'],
  patient: ['تشخيص فقر الدم والالتهابات', 'توازن الغدد والخصوبة', 'تصحيح نقص الفيتامينات', 'متابعة الأمراض المزمنة', 'تحاليل متخصصة لحالات معقدة'],
  doctor: [
    'Specimen: EDTA | TAT: 2h | Ref: age/sex',
    'Specimen: Serum | TAT: 6h | Ref: method',
    'Specimen: Serum | TAT: 8h | Ref: assay',
    'Specimen: Plasma/Serum | TAT: 4-8h | Ref: clinical cutoffs',
    'Specimen: Serum/CSF | TAT: 24h | Ref: kit-specific'
  ]
};

export function Services() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !sectionRef.current || !trackRef.current) return;
    const panels = Array.from(trackRef.current.querySelectorAll('.svc-panel'));
    const totalWidth = panels.reduce((acc, el) => acc + el.clientWidth, 0);
    const scrollDistance = Math.max(0, totalWidth - sectionRef.current.clientWidth);

    const ctx = gsap.context(() => {
      gsap.from(sectionRef.current?.querySelectorAll('[data-fade]') ?? [], {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power2.out',
        stagger: 0.08
      });
      gsap.to(trackRef.current, {
        x: () => (isRTL ? scrollDistance : -scrollDistance),
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${scrollDistance + window.innerHeight}`,
          scrub: 0.8,
          pin: true
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [isRTL]);

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative flex min-h-screen items-center bg-gradient-to-b from-slate-100 to-white dark:from-slate-950 dark:to-slate-900"
    >
      <Container className="relative h-full w-full">
        <div className="mb-10 max-w-2xl space-y-3" dir={isRTL ? 'rtl' : 'ltr'}>
          <p data-fade className="heading-accent">
            {isRTL ? 'دليل الفحوصات الحي' : 'Living test catalog'}
          </p>
          <h2 data-fade className="text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
            {isRTL ? 'اختيارات واضحة للمرضى والأطباء' : 'Clarity for patients and physicians'}
          </h2>
          <p data-fade className="text-slate-700 dark:text-slate-300">
            {isRTL
              ? 'يتحكم التمرير عموديًا في كشف الفحوصات أفقيًا. الطبقة العلوية للمرضى، والطبقة المخفية للأطباء.'
              : 'Vertical scroll reveals the catalog horizontally. Patient view up front, clinician detail on demand.'}
          </p>
        </div>

        <div className="overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
          <div ref={trackRef} className="flex gap-6 will-change-transform">
            {catalog.categories.map((cat, idx) => (
              <article
                key={cat}
                className="svc-panel relative min-w-[280px] max-w-xs flex-1 rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-lg backdrop-blur dark:border-slate-800/70 dark:bg-[#1a658d]/70"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{cat}</h3>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
                    {idx + 1}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">{catalog.patient[idx]}</p>
                <div className="mt-4 rounded-xl border border-dashed border-slate-200/80 bg-slate-50/70 p-3 text-xs text-slate-600 dark:border-slate-800/70 dark:bg-slate-800/60 dark:text-slate-300">
                  {catalog.doctor[idx]}
                </div>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
