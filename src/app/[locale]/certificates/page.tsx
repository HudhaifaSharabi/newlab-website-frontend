import { CertificatesPageResponse } from '@/types/api';
import CertificatesClient from '@/components/certificates/CertificatesClient';
import { Metadata } from 'next';
import { siteBaseUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { unstable_setRequestLocale } from 'next-intl/server';

import { fetchSeoMetadata } from "@/lib/seo";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const seo = await fetchSeoMetadata('certificates', locale);
  const url = `${siteBaseUrl}/${locale}/certificates`;
  
  return {
    title: (locale === 'ar' ? seo?.title_ar : seo?.title_en) || (locale === 'ar' ? 'شهادات واعتمادات | نيو لاب' : 'Certificates & Accreditations | New Lab'),
    description: (locale === 'ar' ? seo?.description_ar : seo?.description_en) || (locale === 'ar' ? 'تعرف على الشهادات والاعتمادات التي يحملها مختبر نيو لاب.' : 'Learn about the certificates and accreditations held by New Lab.'),
    keywords: (locale === 'ar' ? seo?.keywords_ar : seo?.keywords_en),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: (locale === 'ar' ? seo?.title_ar : seo?.title_en) || (locale === 'ar' ? 'شهادات واعتمادات | نيو لاب' : 'Certificates & Accreditations | New Lab'),
      description: (locale === 'ar' ? seo?.description_ar : seo?.description_en) || (locale === 'ar' ? 'تعرف على الشهادات والاعتمادات التي يحملها مختبر نيو لاب.' : 'Learn about the certificates and accreditations held by New Lab.'),
      url,
      images: seo?.og_image ? [{ url: seo.og_image }] : [],
    }
  };
}

async function getCertificatesData(): Promise<{certificates: import('@/types/api').CertificateData[], seo?: import('@/types/api').SeoMetadata} | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ;
  try {
    const res = await fetch(`${apiUrl}/api/method/newlab_site.api.get_certificates`, {
      next: { revalidate: 60 } // Revalidate every minute
    });

    if (!res.ok) {
      console.error("Failed to fetch certificates data");
      return null;
    }
    const data = await res.json();
    return { certificates: data.message?.message?.certificates || [], seo: data.message?.message?.seo };
  } catch (error) {
    console.error("Error fetching certificates data:", error);
    return null;
  }
}

export default async function CertificatesPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  const data = await getCertificatesData();
  const certificates = data?.certificates;
  const seo = data?.seo;
  
  const certJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: (locale === 'ar' ? seo?.title_ar : seo?.title_en) || (locale === 'ar' ? 'شهادات واعتمادات | نيو لاب' : 'Certificates & Accreditations | New Lab'),
    description: (locale === 'ar' ? seo?.description_ar : seo?.description_en) || (locale === 'ar' ? 'شهادات واعتمادات.' : 'Certificates & Accreditations.'),
    url: `${siteBaseUrl}/${locale}/certificates`
  };

  return (
    <>
      <JsonLd data={certJsonLd} />
      <CertificatesClient initialCertificates={certificates || []} />
    </>
  );
}
