import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import MediaHeader from "@/components/media/MediaHeader";
import AlternativeNavbar from "@/components/nav/AlternativeNavbar";
import { NewLabFooter } from "@/components/footer/NewLabFooter";
import ArticlesClient from "@/components/media/ArticlesClient";
import { ArticlesPageResponse } from "@/types/api";

export const metadata = {
  title: 'Media Center | Articles | New Lab Specialized',
  description: 'Read the latest medial articles, health tips, and insights from our experts at New Lab Specialized Medical Center.',
};

async function getArticlesData(): Promise<ArticlesPageResponse['message']['message']['articles'] | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ;
  try {
    const res = await fetch(`${apiUrl}/api/method/newlab_site.api.get_articles`, {
      next: { revalidate: 60 } // Revalidate every minute
    });

    if (!res.ok) {
      console.error("Failed to fetch articles data");
      return null;
    }
    const data = await res.json();
    return data.message?.message?.articles || [];
  } catch (error) {
    console.error("Error fetching articles data:", error);
    return null;
  }
}

export default async function ArticlesPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations("media.articles");
  
  const articles = await getArticlesData();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#1a658d]">
      <AlternativeNavbar />
      <MediaHeader title={t("title")} breadcrumb={t("breadcrumb")} />

      {articles && articles.length > 0 ? (
        <ArticlesClient initialArticles={articles} />
      ) : (
        <div className="mx-auto max-w-7xl px-6 py-32 text-center lg:px-8">
          <p className="text-lg text-slate-500 dark:text-slate-300">
            {locale === "ar" ? "لا توجد مقالات متاحة حالياً." : "No articles available at the moment."}
          </p>
        </div>
      )}

      <NewLabFooter />
    </div>
  );
}
