import {MetadataRoute} from 'next';
import {locales, siteBaseUrl} from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  
  const routes = [
    '',
    '/about-us',
    '/assessment',
    '/book',
    '/certificates',
    '/contact',
    '/equipment',
    '/results',
    '/tests'
  ];

  const allRoutes = routes.flatMap((route) => 
    locales.map((locale) => ({
      url: `${siteBaseUrl}/${locale}${route}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: route === '' ? 1 : 0.8
    }))
  );

  return allRoutes;
}