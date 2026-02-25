"use client";

import {useEffect, useRef} from 'react';
import {useLocale} from 'next-intl';
import gsap from 'gsap';
import {Container} from '@/components/Container';

export function Education() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from(ref.current?.querySelectorAll('[data-card]') ?? [], {
        opacity: 0,
        y: 16,
        duration: 0.9,
        ease: 'power2.out',
        stagger: 0.12
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  const cards = isRTL
    ? [
        {title: 'كيف تقرأ CBC', detail: 'علامات الإنذار والمراجعة.'},
        {title: 'متى يكون الصيام ضروريًا', detail: 'الدقة في الدهون، السكر، الهرمونات.'},
        {title: 'فيتامين د بلا خوف', detail: 'القيم الحرجة والمتابعة.'}
      ]
    : [
        {title: 'How to read CBC', detail: 'Flags to act on and when to repeat.'},
        {title: 'When fasting matters', detail: 'Lipid, glucose, hormone accuracy.'},
        {title: 'Vitamin D clarity', detail: 'Cutoffs and monitoring without fear.'}
      ];

  return (
    <section
      id="education"
      ref={ref}
      className="relative flex min-h-screen items-center bg-gradient-to-b from-white to-slate-100 dark:from-slate-950 dark:to-slate-900"
    >
      <Container className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="space-y-6">
          <div className="max-w-3xl space-y-3">
            <p className="heading-accent">{isRTL ? 'تثقيف وطمأنة' : 'Education & reassurance'}</p>
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
              {isRTL ? 'فهم بسيط يقلل الخوف' : 'Understanding reduces fear'}
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {cards.map((card) => (
              <article
                key={card.title}
                data-card
                className="section-card h-full rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-soft backdrop-blur dark:border-slate-800/70 dark:bg-[#1a658d]/70"
              >
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{card.title}</h3>
                <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{card.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
