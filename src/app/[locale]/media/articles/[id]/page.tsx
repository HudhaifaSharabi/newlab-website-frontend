import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import AlternativeNavbar from "@/components/nav/AlternativeNavbar";
import { NewLabFooter } from "@/components/footer/NewLabFooter";
import ArticleDetailClient from "@/components/media/ArticleDetailClient";
import { ArticlesPageResponse, ArticleItemData } from "@/types/api";
import { notFound } from "next/navigation";

export async function generateMetadata({ params: { locale, id } }: { params: { locale: string, id: string } }) {
  const article = await getArticleData(id);
  if (!article) {
    return { title: 'Article Not Found | New Lab Specialized' };
  }
  return {
    title: `${locale === 'ar' ? article.titleAr : article.title} | Media Center | New Lab Specialized`,
    description: locale === 'ar' ? article.excerptAr : article.excerpt,
  };
}

async function getArticleData(id: string): Promise<ArticleItemData | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ;
  try {
    const res = await fetch(`${apiUrl}/api/method/newlab_site.api.get_articles`, {
      next: { revalidate: 60 } // Revalidate every minute
    });

    if (!res.ok) {
      console.error("Failed to fetch articles data");
      return null;
    }
    const data: ArticlesPageResponse = await res.json();
    const articles = data.message?.message?.articles || [];
    
    // Find the specific article by ID
    const article = articles.find(a => a.id.toString() === id);
    return article || null;

  } catch (error) {
    console.error("Error fetching article data:", error);
    return null;
  }
}

export default async function ArticleDetailPage({ params: { locale, id } }: { params: { locale: string, id: string } }) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations("media.articles");
  
  const article = await getArticleData(id);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <AlternativeNavbar />

      <ArticleDetailClient article={article} />

      <NewLabFooter />
    </div>
  );
}
