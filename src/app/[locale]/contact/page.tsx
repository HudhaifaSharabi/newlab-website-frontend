import { Metadata } from 'next';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import AlternativeNavbar from "@/components/nav/AlternativeNavbar";
import { NewLabFooter } from "@/components/footer/NewLabFooter";
import ContactClient from "@/components/contact/ContactClient";
import { ContactPageResponse, SeoMetadata } from "@/types/api";
import { siteBaseUrl, fetchSeoMetadata, nap } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale });
  const seo = await fetchSeoMetadata('contact', locale);
  const url = `${siteBaseUrl}/${locale}/contact`;
  
  return {
    title: (locale === 'ar' ? seo?.title_ar : seo?.title_en) || (locale === 'ar' ? 'تواصل معنا | نيو لاب' : 'Contact Us | New Lab'),
    description: (locale === 'ar' ? seo?.description_ar : seo?.description_en) || (locale === 'ar' ? 'تواصل مع مختبر نيو لاب التخصصي للاستفسارات والدعم.' : 'Get in touch with New Lab Specialized Medical Center for inquiries, feedback, or support.'),
    keywords: (locale === 'ar' ? seo?.keywords_ar : seo?.keywords_en),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: (locale === 'ar' ? seo?.title_ar : seo?.title_en) || (locale === 'ar' ? 'تواصل معنا | نيو لاب' : 'Contact Us | New Lab'),
      description: (locale === 'ar' ? seo?.description_ar : seo?.description_en) || (locale === 'ar' ? 'تواصل مع مختبر نيو لاب التخصصي للاستفسارات والدعم.' : 'Get in touch with New Lab Specialized Medical Center for inquiries, feedback, or support.'),
      url,
      images: seo?.og_image ? [{ url: seo.og_image }] : [],
    }
  };
}

async function getContactData(): Promise<{contactInfo: ContactPageResponse['message']['message']['contactInfo'], seo?: SeoMetadata} | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ;
  try {
    const res = await fetch(`${apiUrl}/api/method/newlab_site.api.get_contact_info`, {
      next: { revalidate: 60 } // Revalidate every minute
    });

    if (!res.ok) {
      console.error("Failed to fetch contact data");
      return null;
    }
    const data = await res.json();
    if (!data?.message?.message?.contactInfo) return null;
    return { contactInfo: data.message.message.contactInfo, seo: data.message.message.seo };
  } catch (error) {
    console.error("Error fetching contact data:", error);
    return null;
  }
}

export default async function ContactPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations("nav");
  
  const contactDataResponse = await getContactData();
  const contactData = contactDataResponse?.contactInfo;
  const seo = contactDataResponse?.seo;

  // Fallback data if API fails to prevent white screen
  const defaultContactData = {
    address: "Sixty St., Sana'a, Yemen",
    addressAr: "شارع الستين، صنعاء، اليمن",
    phones: ["+967 1 234 567", "+967 777 000 000"],
    email: "info@newlab.com",
    workingHours: [
      { days: "Sat - Thu", daysAr: "السبت - الخميس", hours: "8:00 AM - 10:00 PM" },
      { days: "Friday", daysAr: "الجمعة", hours: "4:00 PM - 9:00 PM" },
      { days: "Emergency", daysAr: "الطوارئ", hours: "24/7", isEmergency: true }
    ]
  };

  const contactJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: (locale === 'ar' ? seo?.title_ar : seo?.title_en) || (locale === 'ar' ? 'تواصل معنا | نيو لاب' : 'Contact Us | New Lab'),
    description: (locale === 'ar' ? seo?.description_ar : seo?.description_en) || (locale === 'ar' ? 'تواصل مع مختبر نيو لاب التخصصي للاستفسارات والدعم.' : 'Get in touch with New Lab Specialized Medical Center for inquiries, feedback, or support.'),
    url: `${siteBaseUrl}/${locale}/contact`,
    mainEntity: {
      '@type': 'LocalBusiness',
      name: nap.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: nap.street,
        addressLocality: nap.city,
        addressCountry: nap.country
      },
      telephone: nap.phone,
      email: nap.email
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <JsonLd data={contactJsonLd} />
      <AlternativeNavbar />

      <ContactClient contactData={contactData || defaultContactData} />

      <NewLabFooter />
    </div>
  );
}
