"use client";

import { useTranslations, useLocale } from "next-intl";
import AlternativeNavbar from "@/components/nav/AlternativeNavbar";
import { NewLabFooter } from "@/components/footer/NewLabFooter";
import { ArrowLeft, Calendar, Clock, Share2, Facebook, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { NewsItemData } from "@/types/api";

interface NewsDetailClientProps {
  newsItem: NewsItemData;
}

// Helper function to extract day, month and year
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    // You can also use Intl.DateTimeFormat for localized month names
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const year = date.getFullYear();
    return { day, month, year };
  } catch (e) {
    return { day: "00", month: "...", year: "...." };
  }
};

export default function NewsDetailClient({ newsItem }: NewsDetailClientProps) {
  const locale = useLocale();
  const isRTL = locale === "ar";
  
  const { title, titleAr, excerpt, excerptAr, publishDate, readTime, readTimeAr, image } = newsItem;
  // Fallback content to excerpt if API doesn't provide full content yet
  const t_title = isRTL ? titleAr : title;
  const t_content = isRTL ? excerptAr : excerpt; 
  const t_readTime = isRTL ? readTimeAr : readTime;
  const t_image = image || "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=1200";

  const { day, month, year } = formatDate(publishDate);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#1a658d]">
      <AlternativeNavbar />

      <main className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
        {/* Back Link */}
        <Link 
          href={`/${locale}/media/news`}
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#1a658d] transition-colors dark:text-slate-400 dark:hover:text-blue-400"
        >
          <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
          {isRTL ? "العودة للأخبار" : "Back to News"}
        </Link>
        
        {/* Header */}
        <div className="mb-8">
            <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {`${day} ${month} ${year}`}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {t_readTime}
                </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
                {t_title}
            </h1>

            {/* Featured Image */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg mb-8">
                <Image 
                    src={t_image}
                    alt={t_title}
                    fill
                    className="object-cover"
                    priority
                />
            </div>
        </div>

        {/* Content */}
        <article className="prose prose-lg dark:prose-invert max-w-none prose-slate prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-a:text-[#1a658d] dark:prose-a:text-blue-400">
            <div dangerouslySetInnerHTML={{ __html: `<p>${t_content}</p>` }} />
        </article>

        {/* Share Section */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
                {isRTL ? "مشاركة الخبر" : "Share this post"}
            </span>
            <div className="flex gap-2">
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition-transform hover:-translate-y-1 hover:shadow-lg">
                    <Facebook className="h-4 w-4" />
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-white transition-transform hover:-translate-y-1 hover:shadow-lg">
                    <Twitter className="h-4 w-4" />
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-white transition-transform hover:-translate-y-1 hover:shadow-lg">
                    <Linkedin className="h-4 w-4" />
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-transform hover:-translate-y-1 hover:shadow-lg dark:bg-slate-800 dark:text-slate-400">
                    <Share2 className="h-4 w-4" />
                </button>
            </div>
        </div>
      </main>

      <NewLabFooter />
    </div>
  );
}
