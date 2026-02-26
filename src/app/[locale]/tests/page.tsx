import { TestsPageResponse } from '@/types/api';
import TestDirectoryClient from '@/components/tests/TestDirectoryClient';
import { Metadata } from 'next';
import { siteBaseUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { unstable_setRequestLocale } from 'next-intl/server';

import { fetchSeoMetadata } from "@/lib/seo";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const seo = await fetchSeoMetadata('tests', locale);
  const url = `${siteBaseUrl}/${locale}/tests`;
  
  return {
    title: (locale === 'ar' ? seo?.title_ar : seo?.title_en) || (locale === 'ar' ? 'دليل الفحوصات | نيو لاب' : 'Tests Directory | New Lab'),
    description: (locale === 'ar' ? seo?.description_ar : seo?.description_en) || (locale === 'ar' ? 'تصفح دليل الفحوصات الطبية المتاحة في مختبر نيو لاب.' : 'Browse the directory of medical tests available at New Lab.'),
    keywords: (locale === 'ar' ? seo?.keywords_ar : seo?.keywords_en),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: (locale === 'ar' ? seo?.title_ar : seo?.title_en) || (locale === 'ar' ? 'دليل الفحوصات | نيو لاب' : 'Tests Directory | New Lab'),
      description: (locale === 'ar' ? seo?.description_ar : seo?.description_en) || (locale === 'ar' ? 'تصفح دليل الفحوصات الطبية المتاحة في مختبر نيو لاب.' : 'Browse the directory of medical tests available at New Lab.'),
      url,
      images: seo?.og_image ? [{ url: seo.og_image }] : [],
    }
  };
}

async function getTestsData(): Promise<TestsPageResponse['message']['message'] | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ;
  try {
    const res = await fetch(`${apiUrl}/api/method/newlab_site.api.get_medical_tests_data`, {
      next: { revalidate: 60 } // Revalidate every minute
    });

    if (!res.ok) {
      console.error("Failed to fetch tests data");
      return null;
    }
    const data = await res.json();
    return data.message.message;
  } catch (error) {
    console.error("Error fetching tests data:", error);
    return null;
  }
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  const data = await getTestsData();
  const seo = data?.seo;
  
  const testsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: (locale === 'ar' ? seo?.title_ar : seo?.title_en) || (locale === 'ar' ? 'دليل الفحوصات | نيو لاب' : 'Tests Directory | New Lab'),
    description: (locale === 'ar' ? seo?.description_ar : seo?.description_en) || (locale === 'ar' ? 'تصفح الفحوصات الطبية المتاحة.' : 'Browse available medical tests.'),
    url: `${siteBaseUrl}/${locale}/tests`
  };

  return (
    <>
      <JsonLd data={testsJsonLd} />
      <TestDirectoryClient 
        initialCategories={data?.categories || []} 
        initialTests={data?.tests || []} 
      />
    </>
  );
}
