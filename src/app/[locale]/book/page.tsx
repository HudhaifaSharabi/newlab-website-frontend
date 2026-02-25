import { TestsPageResponse, TestCategoryData, TestItemData } from '@/types/api';
import BookingClient from '@/components/booking/BookingClient';
import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { siteBaseUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

import { fetchSeoMetadata } from "@/lib/seo";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale });
  const seo = await fetchSeoMetadata('book', locale);
  const url = `${siteBaseUrl}/${locale}/book`;
  
  return {
    title: (locale === 'ar' ? seo?.title_ar : seo?.title_en) || (locale === 'ar' ? 'احجز موعدك | نيو لاب' : 'Book an Appointment | New Lab'),
    description: (locale === 'ar' ? seo?.description_ar : seo?.description_en) || (locale === 'ar' ? 'احجز موعداً لإجراء فحوصاتك الطبية في مختبر نيو لاب بسهولة.' : 'Easily book an appointment for your medical tests at New Lab Specialized.'),
    keywords: (locale === 'ar' ? seo?.keywords_ar : seo?.keywords_en),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: (locale === 'ar' ? seo?.title_ar : seo?.title_en) || (locale === 'ar' ? 'احجز موعدك | نيو لاب' : 'Book an Appointment | New Lab'),
      description: (locale === 'ar' ? seo?.description_ar : seo?.description_en) || (locale === 'ar' ? 'احجز موعداً لإجراء فحوصاتك الطبية في مختبر نيو لاب بسهولة.' : 'Easily book an appointment for your medical tests at New Lab Specialized.'),
      url,
      images: seo?.og_image ? [{ url: seo.og_image }] : [],
    }
  };
}

async function getTestsData(): Promise<{ categories: TestCategoryData[], tests: TestItemData[], seo?: import('@/types/api').SeoMetadata } | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  try {
    const res = await fetch(`${apiUrl}/api/method/newlab_site.api.get_medical_tests_data`, {
      next: { revalidate: 60 } // Revalidate every minute
    });

    if (!res.ok) {
      console.error("Failed to fetch tests data");
      return null;
    }
    const data = await res.json();
    
    // Support both `{ message: { message: { ... } } }` and `{ message: { ... } }`
    if (data.message?.message?.categories) {
      return data.message.message;
    } else if (data.message?.categories) {
      return data.message;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching tests data:", error);
    return null;
  }
}

export default async function BookPage({ 
  params: { locale },
  searchParams
}: { 
  params: { locale: string };
  searchParams: { test?: string };
}) {
  unstable_setRequestLocale(locale);
  const data = await getTestsData();
  const seo = data?.seo;
  
  const bookJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: (locale === 'ar' ? seo?.title_ar : seo?.title_en) || (locale === 'ar' ? 'احجز موعدك | نيو لاب' : 'Book an Appointment | New Lab'),
    description: (locale === 'ar' ? seo?.description_ar : seo?.description_en) || (locale === 'ar' ? 'احجز موعداً لإجراء فحوصاتك الطبية في مختبر نيو لاب بسهولة.' : 'Easily book an appointment for your medical tests at New Lab Specialized.'),
    url: `${siteBaseUrl}/${locale}/book`,
    potentialAction: {
      '@type': 'ReserveAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteBaseUrl}/${locale}/book`,
        inLanguage: locale
      },
      result: {
        '@type': 'Reservation',
        name: 'Medical Test Appointment'
      }
    }
  };

  return (
    <>
      <JsonLd data={bookJsonLd} />
      <BookingClient 
        initialTestId={searchParams.test}
        initialCategories={data?.categories?.length ? data.categories : [{ id: 'all', name: 'All', nameAr: 'الكل' }]} 
        initialTests={data?.tests || []} 
      />
    </>
  );
}
