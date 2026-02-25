import createMiddleware from 'next-intl/middleware';
import {defaultLocale, locales} from '@/lib/seo';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  // Force the site to open in the default locale instead of guessing from headers
  localeDetection: false
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)']
};
