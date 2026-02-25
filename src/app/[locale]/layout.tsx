import '../../styles/globals.css';
import {JsonLd} from '@/components/seo/JsonLd';
import {defaultLocale, locales, buildJsonLd, buildMetadata} from '@/lib/seo';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, getTranslations, setRequestLocale} from 'next-intl/server';
import {ThemeProvider} from 'next-themes';
import clsx from 'clsx';
import type {Metadata} from 'next';
import {Cairo, Tajawal} from 'next/font/google';
import FloatingContactWidget from '@/components/FloatingContactWidget';

const cairo = Cairo({
  subsets: ['latin', 'arabic'],
  variable: '--font-heading',
  display: 'swap',
});

const tajawal = Tajawal({
  subsets: ['latin', 'arabic'],
  weight: ['200', '300', '400', '500', '700', '800', '900'],
  variable: '--font-body',
  display: 'swap',
});

const resolveLocale = (locale: string): (typeof locales)[number] =>
  (locales.includes(locale as (typeof locales)[number]) ? locale : defaultLocale) as (typeof locales)[number];

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export async function generateMetadata({params}: {params: {locale: string}}): Promise<Metadata> {
  const locale = resolveLocale(params.locale);
  setRequestLocale(locale);
  const t = await getTranslations({locale});

  return buildMetadata(locale, (key) => t(key));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  const locale = resolveLocale(params.locale);

  setRequestLocale(locale);

  const messages = await getMessages({locale});
  const t = await getTranslations({locale});
  const jsonLd = buildJsonLd(locale, (key) => t(key));

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body
        className={clsx(
          'min-h-screen antialiased transition-colors',
          'bg-brand-mist text-slate-900',
          'dark:bg-brand-slate dark:text-white',
          cairo.variable,
          tajawal.variable
        )}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <main className="min-h-screen font-sans">{children}</main>
            <FloatingContactWidget />
            <JsonLd data={jsonLd} />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
