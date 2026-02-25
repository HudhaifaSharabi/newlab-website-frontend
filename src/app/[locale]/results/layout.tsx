import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { siteBaseUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

import { fetchSeoMetadata } from "@/lib/seo";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale });
  const seo = await fetchSeoMetadata('results', locale);
  const url = `${siteBaseUrl}/${locale}/results`;
  
  return {
    title: (locale === 'ar' ? seo?.title_ar : seo?.title_en) || (locale === 'ar' ? 'نتائج الفحوصات | نيو لاب' : 'Test Results | New Lab'),
    description: (locale === 'ar' ? seo?.description_ar : seo?.description_en) || (locale === 'ar' ? 'الاستعلام عن نتائج الفحوصات الطبية الخاصة بك عبر الإنترنت.' : 'Check your medical test results online securely.'),
    keywords: (locale === 'ar' ? seo?.keywords_ar : seo?.keywords_en),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: (locale === 'ar' ? seo?.title_ar : seo?.title_en) || (locale === 'ar' ? 'نتائج الفحوصات | نيو لاب' : 'Test Results | New Lab'),
      description: (locale === 'ar' ? seo?.description_ar : seo?.description_en) || (locale === 'ar' ? 'الاستعلام عن نتائج الفحوصات الطبية الخاصة بك عبر الإنترنت.' : 'Check your medical test results online securely.'),
      url,
      images: seo?.og_image ? [{ url: seo.og_image }] : [],
    }
  };
}

export default async function ResultsLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const seo = await fetchSeoMetadata('results', locale);

  const resultsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: (locale === 'ar' ? seo?.title_ar : seo?.title_en) || (locale === 'ar' ? 'نتائج الفحوصات | نيو لاب' : 'Test Results | New Lab'),
    description: (locale === 'ar' ? seo?.description_ar : seo?.description_en) || (locale === 'ar' ? 'نتائج الفحوصات الطبية.' : 'Medical Test Results.'),
    url: `${siteBaseUrl}/${locale}/results`
  };

  return (
    <>
      <JsonLd data={resultsJsonLd} />
      {children}
    </>
  );
}
