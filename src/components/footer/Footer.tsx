"use client";

import {useLocale, useTranslations} from 'next-intl';
import {Container} from '@/components/Container';
import {nap} from '@/lib/seo';

export default function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const quickLinks = t.raw('quickLinks') as string[];
  const services = t.raw('services') as string[];
  const socials = t.raw('social') as string[];
  const contact = t.raw('contact') as {address: string; phone: string; email: string; hours: string};
  const labels = t.raw('labels') as {quickLinks: string; services: string; contact: string};

  return (
    <footer
      id="contact"
      className="relative flex min-h-screen items-center border-t border-slate-200/70 bg-white/70 dark:border-slate-800/70 dark:bg-[#1a658d]/70"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Container className="w-full space-y-10 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-4">
            <div className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{t('mission')}</div>
            <p className="text-sm text-slate-600 dark:text-slate-300">{nap.name}</p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="font-semibold text-slate-800 dark:text-slate-100">{labels.quickLinks}</div>
            <div className="flex flex-col gap-2 text-slate-600 dark:text-slate-300">
              {quickLinks.map((item, idx) => (
                <a key={idx} href={`#${['overview', 'services', 'process', 'coverage', 'doctors'][idx] ?? ''}`} className="hover:text-emerald-600">
                  {item}
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="font-semibold text-slate-800 dark:text-slate-100">{labels.services}</div>
            <div className="flex flex-col gap-2 text-slate-600 dark:text-slate-300">
              {services.map((item, idx) => (
                <span key={idx}>{item}</span>
              ))}
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <div className="font-semibold text-slate-800 dark:text-slate-100">{labels.contact}</div>
            <p>{contact.address}</p>
            <p>{contact.phone}</p>
            <p>{contact.email}</p>
            <p>{contact.hours}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-200/70 pt-6 text-sm text-slate-500 dark:border-slate-800/70 dark:text-slate-400 md:flex-row md:items-center md:justify-between">
          <span>{t('disclaimer')}</span>
          <div className="flex items-center gap-3">
            {socials.map((item, idx) => (
              <span
                key={idx}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:border-slate-700 dark:text-slate-200"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
