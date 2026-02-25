import {defaultLocale, locales} from '@/lib/seo';
import {getRequestConfig} from 'next-intl/server';

type AppLocale = (typeof locales)[number];

const resolveLocale = (locale: string | undefined): AppLocale =>
  locales.includes(locale as AppLocale) ? (locale as AppLocale) : defaultLocale;

export default getRequestConfig(async ({requestLocale}) => {
  const locale = resolveLocale((await requestLocale) ?? defaultLocale);

  return {
    locale,
    defaultLocale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
