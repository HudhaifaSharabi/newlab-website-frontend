"use client";

import Image from 'next/image';
import {useEffect, useRef} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {useTheme} from 'next-themes';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import clsx from 'clsx';
import {Container} from '@/components/ui/Container';
import {prefersReducedMotion} from '@/lib/motion';
import {useLenis} from '@/lib/lenisClient';

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
  useLenis();
  const t = useTranslations('hero');
  const locale = useLocale();
  const {resolvedTheme} = useTheme();
  const isRTL = locale === 'ar';
  const isDark = resolvedTheme !== 'light';

  const rootRef = useRef<HTMLElement | null>(null);
  const imageRef = useRef<HTMLDivElement | null>(null);
  const maskRef = useRef<HTMLDivElement | null>(null);
  const blurRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLDivElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const subRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const section = rootRef.current;
    if (!section) return;
    const reduce = prefersReducedMotion();
    const ctx = gsap.context(() => {
      if (reduce) {
        gsap.set([maskRef.current, blurRef.current], {height: '0%', filter: 'blur(0px)'});
        gsap.set(headlineRef.current, {y: 0});
        gsap.set(subRef.current, {opacity: 1});
        gsap.set(indicatorRef.current, {width: '100%'});
        gsap.set(imageRef.current, {y: 0, scale: 1});
        return;
      }

      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=120',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.to(imageRef.current, {y: -12 * p, scale: 1.04 - p * 0.04, ease: 'none', overwrite: 'auto'});
          gsap.to(maskRef.current, {height: `${60 - p * 60}%`, ease: 'none', overwrite: 'auto'});
          gsap.to(headlineRef.current, {y: (isRTL ? -1 : 1) * (8 * p), ease: 'none', overwrite: 'auto'});
          gsap.to(subRef.current, {opacity: p, ease: 'none', overwrite: 'auto'});
          gsap.to(indicatorRef.current, {width: `${30 + p * 70}%`, ease: 'none', overwrite: 'auto'});
        }
      });
    }, section);

    return () => ctx.revert();
  }, [isRTL]);

  return (
    <section
      id="overview"
      ref={rootRef}
      className={clsx(
        'relative isolate h-screen overflow-hidden',
        isDark ? 'bg-[var(--bg)] text-white' : 'bg-[var(--bg)] text-[var(--text)]'
      )}
    >
      <Container className="relative z-10 h-full">
        <div className="flex h-full flex-col justify-center gap-10">
          <div className={clsx('flex flex-col gap-4', isRTL ? 'text-right items-end' : 'text-left items-start')}>
            <div className={clsx('text-xs font-semibold uppercase tracking-[0.3em]', isDark ? 'text-white/60' : 'text-[var(--text-muted)]')}>
              {t('systemLabel')}
            </div>
            <h1 ref={headlineRef} className="leading-[0.92] text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="block" dir={isRTL ? 'rtl' : 'ltr'}>
                {t('headline')}
              </span>
            </h1>
            <div className={clsx('h-0.5 w-full max-w-md overflow-hidden bg-[var(--border)]', isRTL ? 'ml-auto' : 'mr-auto')}>
              <div
                ref={indicatorRef}
                className="h-full bg-[var(--accent-red)]"
                style={{width: '30%'}}
              />
            </div>
            <p
              ref={subRef}
              className={clsx('max-w-2xl text-base sm:text-lg', isDark ? 'text-[var(--text-muted)]/80' : 'text-[var(--text-muted)]')}
              style={{opacity: 0}}
            >
              {t('subline')}
            </p>
          </div>

          <div className="relative h-[60vh] w-full max-w-5xl">
            <div ref={imageRef} className="relative h-full w-full overflow-hidden rounded-xl border border-[var(--border)]">
              <div ref={maskRef} className="absolute inset-0 z-10" style={{background: 'linear-gradient(to bottom, var(--bg) 0%, transparent 80%)'}} />
              <div className="absolute inset-0">
                <Image
                  src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80"
                  alt={t('headline')}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority
                  style={{transform: 'scale(1.04)'}}
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
