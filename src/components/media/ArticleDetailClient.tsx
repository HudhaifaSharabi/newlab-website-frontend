"use client";

import { useLocale } from "next-intl";
import { ArrowLeft, Clock, Share2, User, Facebook, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ArticleItemData } from "@/types/api";

interface ArticleDetailClientProps {
  article: ArticleItemData;
}

export default function ArticleDetailClient({ article }: ArticleDetailClientProps) {
  const locale = useLocale();
  const isRTL = locale === "ar";
  
  const { title, titleAr, content, contentAr, author, authorAr, readTime, readTimeAr, image, category, categoryAr, date } = article;
  
  const displayTitle = isRTL ? titleAr : title;
  const displayContent = isRTL ? contentAr : content;
  const displayCategory = isRTL ? categoryAr : category;
  const displayAuthor = isRTL ? authorAr : author;
  const displayReadTime = isRTL ? readTimeAr : readTime;

  // Fallback image if none provided
  const fallbackImage = "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=1200";

  return (
    <>
      {/* Hero Section */}
      <div className="relative h-[400px] w-full md:h-[500px]">
        <Image 
            src={image || fallbackImage}
            alt={displayTitle}
            fill
            className="object-cover"
            priority
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = fallbackImage;
            }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-7xl mx-auto w-full">
            <Link 
                href={`/${locale}/media/articles`}
                className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition-colors"
            >
                <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
                {isRTL ? "العودة للمقالات" : "Back to Articles"}
            </Link>
            
            <div className="mb-4 flex items-center gap-3">
                <span className="rounded bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                    {displayCategory}
                </span>
                <span className="text-xs font-medium text-white/80">
                    {date}
                </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6 max-w-4xl">
                {displayTitle}
            </h1>
            
            <div className="flex items-center gap-6 text-sm text-white/90">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white">
                        {displayAuthor.charAt(0)}
                    </div>
                    <span>{displayAuthor}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {displayReadTime}
                </div>
            </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
        
        {/* Content */}
        <article className="prose prose-lg dark:prose-invert max-w-none prose-slate prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-blockquote:border-l-4 prose-blockquote:border-[#1a658d] prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-[#1a658d] prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:not-italic py-8 overflow-hidden break-words">
            <div dangerouslySetInnerHTML={{ __html: displayContent }} />
        </article>

        {/* Share Section */}
        <div className="mt-16 flex flex-col items-center justify-center border-t border-slate-200 pt-12 dark:border-slate-800">
            <span className="mb-6 font-semibold text-slate-500 dark:text-slate-400">
                {isRTL ? "شارك هذا المقال" : "Share this article"}
            </span>
            <div className="flex gap-4">
                <button className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white transition-transform hover:-translate-y-1 hover:shadow-lg">
                    <Facebook className="h-5 w-5" />
                </button>
                <button className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500 text-white transition-transform hover:-translate-y-1 hover:shadow-lg">
                    <Twitter className="h-5 w-5" />
                </button>
                <button className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-700 text-white transition-transform hover:-translate-y-1 hover:shadow-lg">
                    <Linkedin className="h-5 w-5" />
                </button>
                <button className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-600 transition-transform hover:-translate-y-1 hover:shadow-lg dark:bg-slate-800 dark:text-white">
                    <Share2 className="h-5 w-5" />
                </button>
            </div>
        </div>
      </main>
    </>
  );
}
