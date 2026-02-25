import HeroComparison from "@/components/HeroComparison";
import dynamic from 'next/dynamic';
import { LandingPageResponse } from '@/types/api';

const StaticTemplateC = dynamic(() => import('@/components/StaticTemplateC').then(mod => mod.StaticTemplateC));
const PackagesSection = dynamic(() => import('@/components/PackagesSection').then(mod => mod.PackagesSection));
const StatsAndPartners = dynamic(() => import('@/components/StatsAndPartners').then(mod => mod.StatsAndPartners));
const Locations = dynamic(() => import('@/components/locations/Locations').then(mod => mod.Locations), { ssr: false });
const NewLabFooter = dynamic(() => import('@/components/footer/NewLabFooter').then(mod => mod.NewLabFooter));

async function getLandingPageData(): Promise<LandingPageResponse['message'] | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  try {
    const res = await fetch(`${apiUrl}/api/method/newlab_site.api.get_landing_page`, {
      next: { revalidate: 60 } // Revalidate every minute
    });
    
    if (!res.ok) {
      console.error("Failed to fetch landing page data");
      return null;
    }
    const data = await res.json();
    return data.message;
  } catch (error) {
    console.error("Error fetching landing page data:", error);
    return null;
  }
}

import { fetchSeoMetadata } from '@/lib/seo';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<import('next').Metadata> {
  const { getTranslations } = await import('next-intl/server');
  const t = await getTranslations({ locale });
  const seo = await fetchSeoMetadata('home', locale);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://newlabspecialized.demo';
  const url = `${baseUrl}/${locale}`;
  
  return {
    title: (locale === 'ar' ? seo?.title_ar : seo?.title_en) || t('meta.title'),
    description: (locale === 'ar' ? seo?.description_ar : seo?.description_en) || t('meta.description'),
    keywords: (locale === 'ar' ? seo?.keywords_ar : seo?.keywords_en) || t('meta.keywords'),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: (locale === 'ar' ? seo?.title_ar : seo?.title_en) || t('meta.title'),
      description: (locale === 'ar' ? seo?.description_ar : seo?.description_en) || t('meta.description'),
      url,
      images: seo?.og_image ? [{ url: seo.og_image }] : [],
    }
  };
}

export default async function Page() {
  const data = await getLandingPageData();

  return (
    <>
      <HeroComparison heroData={data?.hero} aboutData={data?.about} />
      <StaticTemplateC workflowData={data?.workflow} />
      <PackagesSection packagesData={data?.packages} />
      <StatsAndPartners statsData={data?.stats} partnersData={data?.partners} />
      <Locations locationsData={data?.locations} />
      <NewLabFooter />
    </>
  );
}
