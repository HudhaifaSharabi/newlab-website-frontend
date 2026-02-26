import { Metadata } from 'next';
import { getTranslations } from "next-intl/server";
import { Users, Target, Heart, ShieldCheck, Microscope } from "lucide-react";
import AlternativeNavbar from "@/components/nav/AlternativeNavbar";
import { NewLabFooter } from "@/components/footer/NewLabFooter";
import OurStory from "@/components/OurStory";
import Image from "next/image";
import { AboutPageResponse } from "@/types/api";
import { siteBaseUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

import { fetchSeoMetadata } from "@/lib/seo";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "about" });
  const seo = await fetchSeoMetadata("about-us", locale);
  const url = `${siteBaseUrl}/${locale}/about-us`;
  
  return {
    title: (locale === 'ar' ? seo?.title_ar : seo?.title_en) || t("meta.title", { fallback: locale === 'ar' ? 'من نحن | نيو لاب' : 'About Us | New Lab' }),
    description: (locale === 'ar' ? seo?.description_ar : seo?.description_en) || t("meta.description", { fallback: locale === 'ar' ? 'تعرف على مختبر نيو لاب التخصصي' : 'Learn about New Lab Specialized' }),
    keywords: (locale === 'ar' ? seo?.keywords_ar : seo?.keywords_en),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: (locale === 'ar' ? seo?.title_ar : seo?.title_en) || t("meta.title", { fallback: locale === 'ar' ? 'من نحن | نيو لاب' : 'About Us | New Lab' }),
      description: (locale === 'ar' ? seo?.description_ar : seo?.description_en) || t("meta.description", { fallback: locale === 'ar' ? 'تعرف على مختبر نيو لاب التخصصي' : 'Learn about New Lab Specialized' }),
      url,
      images: seo?.og_image ? [{ url: seo.og_image }] : [],
    }
  };
}

async function getAboutData(locale: string): Promise<AboutPageResponse['message']['data'] | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const res = await fetch(`${apiUrl}/api/method/newlab_site.api.get_about_page`, {
      next: { revalidate: 60 },
      headers: {
        'Accept-Language': locale,
      }
    });
    
    if (!res.ok) throw new Error("Failed to fetch about data");
    
    const data: AboutPageResponse = await res.json();
    if (data.message?.status === "success") {
      return data.message.data;
    }
    return null;
  } catch (error) {
    console.error("About API Fetch Error:", error);
    return null;
  }
}

export default async function AboutPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "about" });
  const isRTL = locale === "ar";
  
  const aboutData = await getAboutData(locale);
  
  if (!aboutData) {
    // Return a skeleton structure
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
         <AlternativeNavbar />
         <main>
           <section className="relative h-[400px] w-full bg-[#1a658d] dark:bg-slate-800 animate-pulse" />
           <section className="py-24 max-w-7xl mx-auto px-6">
              <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-8" />
              <div className="space-y-4">
                 <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                 <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                 <div className="h-4 w-4/6 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              </div>
           </section>
         </main>
         <NewLabFooter />
      </div>
    );
  }

  // Map values icons
  const iconMap: Record<string, React.ReactNode> = {
    accuracy: <Target className="h-6 w-6 text-[#1a658d]" />,
    integrity: <ShieldCheck className="h-6 w-6 text-[#b9292f]" />,
    care: <Heart className="h-6 w-6 text-green-600" />
  };

  const colorMap: Record<string, string> = {
    accuracy: "bg-[#1a658d]/10",
    integrity: "bg-[#b9292f]/10",
    care: "bg-green-100"
  };

  const aboutJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: (isRTL ? aboutData.seo?.title_ar : aboutData.seo?.title_en) || t("meta.title", { fallback: isRTL ? 'من نحن | نيو لاب' : 'About Us | New Lab' }),
    description: (isRTL ? aboutData.seo?.description_ar : aboutData.seo?.description_en) || t("meta.description", { fallback: isRTL ? 'تعرف على مختبر نيو لاب التخصصي' : 'Learn about New Lab Specialized' }),
    url: `${siteBaseUrl}/${locale}/about-us`
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <JsonLd data={aboutJsonLd} />
      <AlternativeNavbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative h-[400px] w-full overflow-hidden bg-[#1a658d] dark:bg-slate-800">
          {aboutData.hero.image ? (
            <Image
              src={aboutData.hero.image}
              alt="New Lab Team"
              fill
              className="object-cover opacity-40"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-slate-300 dark:bg-slate-700 animate-pulse opacity-40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-6">
              <span className="mb-4 inline-block rounded-full bg-[#1a658d]/20 px-4 py-1.5 text-sm font-semibold text-blue-200 backdrop-blur-sm">
                {isRTL ? aboutData.hero.badgeAr : aboutData.hero.badge}
              </span>
              <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl md:text-6xl flex justify-center">
                {(isRTL ? aboutData.hero.titleAr : aboutData.hero.title) || (
                  <div className="h-12 w-3/4 rounded-lg bg-white/20 animate-pulse mt-2" />
                )}
              </h1>
              <div className="mx-auto max-w-2xl text-lg text-slate-300 flex justify-center mt-4">
                {(isRTL ? aboutData.hero.subtitleAr : aboutData.hero.subtitle) || (
                  <div className="flex flex-col gap-3 items-center w-full">
                    <div className="h-5 w-2/3 rounded-md bg-white/20 animate-pulse" />
                    <div className="h-5 w-1/2 rounded-md bg-white/20 animate-pulse" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <OurStory data={aboutData.story} />

        {/* Values Section */}
        <section className="bg-white py-24 dark:bg-slate-800">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                {isRTL ? aboutData.values.titleAr : aboutData.values.title}
              </h2>
            </div>
            
            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 sm:grid-cols-3 lg:max-w-none">
              {aboutData.values.items.map((value) => (
                <div 
                  key={value.id}
                  className="flex flex-col items-center text-center p-8 rounded-2xl bg-slate-50 transition-all hover:shadow-lg dark:bg-slate-900"
                >
                  <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${colorMap[value.id] || "bg-[#1a658d]/10"}`}>
                    {iconMap[value.id] || <Target className="h-6 w-6 text-[#1a658d]" />}
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white flex justify-center w-full">
                    {(isRTL ? value.titleAr : value.title) || (
                      <div className="h-7 w-24 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                    )}
                  </h3>
                  <div className="text-slate-600 dark:text-slate-400 w-full flex justify-center">
                    {(isRTL ? value.descriptionAr : value.description) || (
                      <div className="h-5 w-48 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden bg-[#1a658d] py-24">
          <div className="absolute inset-0 opacity-10">
            <Microscope className="h-full w-full -translate-x-1/4 translate-y-1/4 transform" />
          </div>
          <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <h2 className="mb-8 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {isRTL ? aboutData.cta.titleAr : aboutData.cta.title}
            </h2>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a 
                href={aboutData.cta.bookLink || "/book"}
                className="rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-black shadow-lg transition-all hover:bg-slate-100"
              >
                {isRTL ? aboutData.cta.bookButtonAr : aboutData.cta.bookButton}
              </a>
              <a 
                href={aboutData.cta.exploreLink || "/tests"}
                className="rounded-xl border-2 border-white/20 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-white/10"
              >
                {isRTL ? aboutData.cta.exploreButtonAr : aboutData.cta.exploreButton}
              </a>
            </div>
          </div>
        </section>
      </main>
      
      <NewLabFooter />
    </div>
  );
}
