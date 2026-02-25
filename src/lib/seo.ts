import type {Metadata} from 'next';

export const siteBaseUrl = 'https://newlabspecialized.demo';
export const locales = ['ar', 'en'] as const;
export const defaultLocale = 'ar';

const nap = {
  name: 'New Lab Specialized',
  street: 'Hadda Street',
  city: "Sana'a",
  country: 'Yemen',
  phone: '+967 777 000 000',
  email: 'care@newlabspecialized.com',
  openingHours: 'Sat-Thu 08:00-22:00',
  geo: {
    latitude: 15.3694,
    longitude: 44.191
  }
};

export function buildMetadata(locale: (typeof locales)[number], t: (key: string) => string): Metadata {
  const url = `${siteBaseUrl}/${locale}`;

  return {
    metadataBase: new URL(siteBaseUrl),
    title: t('meta.title'),
    description: t('meta.description'),
    keywords: t('meta.keywords'),
    alternates: {
      canonical: url,
      languages: {
        ar: `${siteBaseUrl}/ar`,
        en: `${siteBaseUrl}/en`,
        'x-default': `${siteBaseUrl}/${defaultLocale}`
      }
    },
    openGraph: {
      title: t('meta.title'),
      description: t('meta.description'),
      url,
      siteName: t('meta.siteName'),
      locale,
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta.title'),
      description: t('meta.description')
    }
  };
}

export function buildJsonLd(locale: (typeof locales)[number], t: (key: string) => string) {
  const url = `${siteBaseUrl}/${locale}`;
  const address = {
    '@type': 'PostalAddress',
    streetAddress: nap.street,
    addressLocality: nap.city,
    addressCountry: nap.country
  };

  const medicalBusiness = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: t('nav.brand'),
    description: t('meta.description'),
    url,
    telephone: nap.phone,
    email: nap.email,
    address,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: nap.geo.latitude,
      longitude: nap.geo.longitude
    },
    areaServed: {
      '@type': 'City',
      name: "Sana'a",
      address: address
    },
    openingHours: nap.openingHours,
    priceRange: '$$'
  };

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: t('nav.brand'),
    url,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: nap.phone,
        contactType: 'customer service',
        areaServed: ['YE'],
        availableLanguage: ['ar', 'en']
      }
    ]
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: siteBaseUrl,
    name: t('meta.siteName'),
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteBaseUrl}/search?q={query}`,
      'query-input': 'required name=query'
    }
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: t('nav.links.overview'),
        item: url
      }
    ]
  };

  return [medicalBusiness, organization, website, breadcrumb];
}

export async function fetchSeoMetadata(route: string, locale: string): Promise<import('@/types/api').SeoMetadata | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ;
  try {
    const res = await fetch(`${apiUrl}/api/method/newlab_site.api.get_seo_metadata?route=${route}&locale=${locale}`, {
      next: { revalidate: 60 } // Revalidate every minute
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.message?.seo || null;
  } catch (error) {
    console.error(`Failed fetching SEO for route ${route}:`, error);
    return null;
  }
}

export {nap};