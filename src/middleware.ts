import createMiddleware from 'next-intl/middleware';
import { defaultLocale, locales } from '@/lib/seo';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Initialize next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  // Force the site to open in the default locale instead of guessing from headers
  localeDetection: false
});

export default function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // استخراج النطاق (Host) من الطلب
  const hostname = request.headers.get('host') || '';

  // تحديد النطاق الفرعي المطلوب (استبدله بنطاقك الحقيقي)
  const targetSubdomain = 'results.newlabspecialized.com';

  // إذا كان الزائر قادماً من النطاق الفرعي
  if (hostname === targetSubdomain) {
    const pathname = url.pathname;

    // استثناء مسار الشات لكي يعمل بشكل طبيعي على النطاق الفرعي
    const isChatRoute = pathname.startsWith('/chat') || locales.some(locale => pathname.startsWith(`/${locale}/chat`));
    if (isChatRoute) {
      return intlMiddleware(request);
    }

    // استخراج اللغة إذا كانت موجودة في المسار (مثل /ar أو /en)
    let locale: string = defaultLocale;
    let pathWithoutLocale = pathname;

    for (const l of locales) {
      if (pathname === `/${l}` || pathname.startsWith(`/${l}/`)) {
        locale = l;
        pathWithoutLocale = pathname.substring(l.length + 1) || '/';
        break;
      }
    }

    // إذا كان المسار بالأساس هو صفحة النتائج
    if (pathWithoutLocale === '/results' || pathWithoutLocale.startsWith('/results/')) {
      url.pathname = `/${locale}${pathWithoutLocale}`;
      return NextResponse.rewrite(url);
    }

    // لتسهيل الدخول من الـ PWA والنوافذ الرئيسية: إعادة توجيه المسار إلى صفحة النتائج باللغة المناسبة
    url.pathname = `/${locale}/results`;
    return NextResponse.rewrite(url);
  }

  // استخدام middleware الخاص بـ next-intl لبقية الطلبات
  return intlMiddleware(request);
}

// تحديد المسارات التي يجب أن يعمل عليها الـ Middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Files with extensions (e.g. .png, .jpg)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};