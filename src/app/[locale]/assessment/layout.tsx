import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { siteBaseUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

import { fetchSeoMetadata } from "@/lib/seo";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale });
  const seo = await fetchSeoMetadata('assessment', locale);
  const url = `${siteBaseUrl}/${locale}/assessment`;
  
  return {
    title: (locale === 'ar' ? seo?.title_ar : seo?.title_en) || (locale === 'ar' ? 'التقييم الصحي الذكي | نيو لاب' : 'Health Assessment | New Lab'),
    description: (locale === 'ar' ? seo?.description_ar : seo?.description_en) || (locale === 'ar' ? 'قم بإجراء تقييم صحي سريع لمعرفة الفحوصات المناسبة لك.' : 'Take a quick health assessment to find the right tests for you.'),
    keywords: (locale === 'ar' ? seo?.keywords_ar : seo?.keywords_en),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: (locale === 'ar' ? seo?.title_ar : seo?.title_en) || (locale === 'ar' ? 'التقييم الصحي الذكي | نيو لاب' : 'Health Assessment | New Lab'),
      description: (locale === 'ar' ? seo?.description_ar : seo?.description_en) || (locale === 'ar' ? 'قم بإجراء تقييم صحي سريع لمعرفة الفحوصات المناسبة لك.' : 'Take a quick health assessment to find the right tests for you.'),
      url,
      images: seo?.og_image ? [{ url: seo.og_image }] : [],
    }
  };
}

export default async function AssessmentLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const seo = await fetchSeoMetadata('assessment', locale);

  const assessmentJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: (locale === 'ar' ? seo?.title_ar : seo?.title_en) || (locale === 'ar' ? 'التقييم الصحي الذكي | نيو لاب' : 'Health Assessment | New Lab'),
    description: (locale === 'ar' ? seo?.description_ar : seo?.description_en) || (locale === 'ar' ? 'التقييم الصحي الذكي.' : 'Health Assessment.'),
    url: `${siteBaseUrl}/${locale}/assessment`
  };

  return (
    <>
      <JsonLd data={assessmentJsonLd} />
      {children}
    </>
  );
}
