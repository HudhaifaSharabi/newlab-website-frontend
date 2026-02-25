"use client";

import Link from 'next/link';
import {useLocale, useTranslations} from 'next-intl';
import {usePathname} from 'next/navigation';
import {useTheme} from 'next-themes';
import {useEffect, useMemo, useRef, useState} from 'react';
import clsx from 'clsx';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {SunIcon, MoonIcon, Bars3Icon, XMarkIcon} from '@heroicons/react/24/outline';
import {Container} from '@/components/ui/Container';
import {prefersReducedMotion} from '@/lib/motion';
import Image from 'next/image';

gsap.registerPlugin(ScrollTrigger);

const linkTargets = [
  {key: 'testDirectory', href: '/tests'}
];

export default function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const {theme, resolvedTheme, setTheme} = useTheme();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [navSolid, setNavSolid] = useState(false);
  const [navReady, setNavReady] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const solidRef = useRef(false);
  const reduceMotion = prefersReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const reveal = () => setNavReady(true);
    window.addEventListener('hero-nav-reveal', reveal);
    return () => window.removeEventListener('hero-nav-reveal', reveal);
  }, []);

  useEffect(() => {
    if (!navReady) return;
    if (reduceMotion || !navRef.current) {
      if (reduceMotion) setNavSolid(true);
      return;
    }
    const header = navRef.current;
    const ctx = gsap.context(() => {
      gsap.fromTo(header, {opacity: 0}, {opacity: 1, duration: 0.6, ease: 'power2.out'});
      gsap.from(header, {opacity: 0, y: -8, duration: 0.5, ease: 'power2.out'});
      ScrollTrigger.create({
        start: 0,
        end: 40,
        onUpdate: (self) => {
          const ratio = Math.min(self.scroll() / 40, 1);
          const isLight = resolvedTheme === 'light';
          const bg = isLight
            ? `rgba(255,255,255,${0.05 + ratio * 0.85})`
            : `rgba(6,13,22,${0.05 + ratio * 0.85})`;
          const border = isLight ? `rgba(15,23,42,${0.08 + ratio * 0.18})` : `rgba(255,255,255,${0.02 + ratio * 0.2})`;
          gsap.to(header, {
            height: 56 - ratio * 4,
            backgroundColor: bg,
            borderColor: border,
            backdropFilter: `blur(${2 + ratio * 6}px)`,
            boxShadow: `0 18px 50px -28px rgba(0,0,0,${0.5 * ratio})`,
            duration: 0.2,
            ease: 'power1.out',
            overwrite: 'auto'
          });
          const nextSolid = ratio > 0.1;
          if (nextSolid !== solidRef.current) {
            solidRef.current = nextSolid;
            setNavSolid(nextSolid);
          }
        }
      });
    }, navRef);
    return () => ctx.revert();
  }, [resolvedTheme, reduceMotion, navReady]);

  const targetLocale = locale === 'ar' ? 'en' : 'ar';
  const targetHref = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    segments[0] = targetLocale;
    return `/${segments.join('/') || targetLocale}`;
  }, [pathname, targetLocale]);

  const isRTL = locale === 'ar';
  const isDark = resolvedTheme !== 'light';

  return (
    <header
      ref={(node) => {
        navRef.current = node;
      }}
      className={clsx(
        'fixed inset-x-0 top-0 z-[999] border-b transition-colors duration-300',
        navSolid
          ? 'bg-white/90 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-[#1a658d]/85 dark:text-slate-50'
          : isDark
            ? 'bg-transparent text-white border-white/10'
            : 'bg-transparent text-slate-800 border-transparent',
        navReady ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
    >
      <Container className="grid h-14 grid-cols-[auto_1fr_auto] items-center gap-4">
        {/* Left: primary CTA */}
        <div className={clsx('flex items-center gap-2', {'flex-row-reverse': isRTL})}>
          <Link
            href="#contact"
            className="rounded-full px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
            style={{background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-red))'}}
          >
            {t('book')}
          </Link>
        </div>

        {/* Center: brand + nav links */}
        <div className={clsx('flex items-center justify-center gap-8', {'flex-row-reverse': isRTL})}>
          <Link
            href={`/${locale}`}
            className="relative h-10 w-32 shrink-0 transition-transform hover:scale-105 block"
          >
            <Image 
              src="/logo.png" 
              alt="New Lab Logo" 
              fill 
              className={clsx("object-contain", !navSolid && isDark && "invert")}
              priority 
            />
          </Link>
          <nav className="hidden items-center gap-5 text-xs font-semibold uppercase tracking-[0.16em] lg:flex">
            {linkTargets.map((link) => {
              const isPageRoute = link.href.startsWith('/');
              const Component = isPageRoute ? Link : 'a';
              const linkProps = isPageRoute 
                ? { href: `/${locale}${link.href}` }
                : { href: link.href };
              
              return (
                <Component
                  key={link.key}
                  {...linkProps}
                  className={clsx(
                    'transition',
                    navSolid
                      ? 'text-slate-700 hover:text-[var(--accent-blue)] dark:text-slate-200'
                      : isDark
                        ? 'text-white/70 hover:text-white'
                        : 'text-slate-700/90 hover:text-[var(--accent-blue)]'
                  )}
                >
                  {t(`links.${link.key}`)}
                </Component>
              );
            })}
          </nav>
        </div>

        {/* Right: language + theme + mobile */}
        <div className={clsx('flex items-center justify-end gap-2', {'flex-row-reverse': isRTL})}>
          <Link
            href={targetHref}
            locale={targetLocale}
            className={clsx(
              'hidden rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wide transition lg:inline-flex',
              navSolid
                ? 'border border-slate-200 text-slate-700 hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] dark:border-slate-700 dark:text-slate-100'
                : isDark
                  ? 'border border-white/25 text-white hover:border-white/60'
                  : 'border border-slate-200 text-slate-800 hover:border-slate-500'
            )}
          >
            {t('language')}
          </Link>
          <button
            type="button"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className={clsx(
              'hidden h-10 w-10 items-center justify-center rounded-full border text-base transition lg:inline-flex',
              navSolid
                ? 'border-slate-200 text-slate-700 hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] dark:border-slate-700 dark:text-slate-100'
                : isDark
                  ? 'border-white/25 text-white hover:border-white/50'
                  : 'border-slate-200 text-slate-800 hover:border-slate-500'
            )}
          >
            {mounted && theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </button>
          <button
            type="button"
            className={clsx(
              'inline-flex h-10 w-10 items-center justify-center rounded-full border text-base transition lg:hidden',
              navSolid
                ? 'border-slate-200 text-slate-700 hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] dark:border-slate-700 dark:text-slate-100'
                : isDark
                  ? 'border-white/30 text-white hover:border-white/60'
                  : 'border-slate-200 text-slate-800 hover:border-slate-500'
            )}
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>
      </Container>

      <div
        className={clsx(
          'lg:hidden',
          open ? 'max-h-screen opacity-100' : 'pointer-events-none max-h-0 opacity-0',
          'overflow-hidden border-t border-slate-200 bg-white/95 px-4 pb-6 pt-1 text-sm shadow-sm backdrop-blur dark:border-slate-700 dark:bg-[#1a658d]/95'
        )}
      >
        <nav className={clsx('flex flex-col items-center gap-4', {'items-end text-right': isRTL})}>
          {linkTargets.map((link) => {
            const isPageRoute = link.href.startsWith('/');
            const Component = isPageRoute ? Link : 'a';
            const linkProps = isPageRoute 
              ? { href: `/${locale}${link.href}` }
              : { href: link.href };
            
            return (
              <Component
                key={link.key}
                {...linkProps}
                className="py-2 text-base font-medium text-slate-800 transition hover:text-[var(--accent-blue)] dark:text-slate-100"
                onClick={() => setOpen(false)}
              >
                {t(`links.${link.key}`)}
              </Component>
            );
          })}
        </nav>
        <div className="mt-4 flex items-center justify-between gap-3">
          <Link
            href={targetHref}
            locale={targetLocale}
            className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] dark:border-slate-700 dark:text-slate-100"
            onClick={() => setOpen(false)}
          >
            {t('language')}
          </Link>
          <button
            type="button"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] dark:border-slate-700 dark:text-slate-100"
          >
            {mounted && theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </button>
          <Link
            href="#overview"
            className="flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
            style={{background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-red))'}}
            onClick={() => setOpen(false)}
          >
            {t('book')}
          </Link>
        </div>
      </div>
    </header>
  );
}
