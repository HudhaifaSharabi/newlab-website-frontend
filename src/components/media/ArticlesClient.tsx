"use client";

import { useLocale } from "next-intl";
import { Clock, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Pagination from "@/components/ui/Pagination";
import { ArticleItemData } from "@/types/api";

interface ArticlesClientProps {
  initialArticles: ArticleItemData[];
}

export default function ArticlesClient({ initialArticles }: ArticlesClientProps) {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const container = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Identify featured article (first one with isFeatured = true, or just use the first item if none are explicitly featured to maintain design)
  const featuredArticleIndex = initialArticles.findIndex(a => a.isFeatured);
  const featuredArticle = featuredArticleIndex !== -1 ? initialArticles[featuredArticleIndex] : (initialArticles.length > 0 ? initialArticles[0] : null);
  
  // Articles for the grid (exclude the featured one)
  const gridArticles = initialArticles.filter(a => a.id !== featuredArticle?.id);

  const totalPages = Math.ceil(gridArticles.length / itemsPerPage);

  // Get current posts
  const indexOfLastPost = currentPage * itemsPerPage;
  const indexOfFirstPost = indexOfLastPost - itemsPerPage;
  const currentPosts = gridArticles.slice(indexOfFirstPost, indexOfLastPost);

  // Scroll to main list when page changes (skip featured article on subsequent pages)
  useEffect(() => {
    if (currentPage > 1 && container.current) {
      const el = container.current as HTMLElement;
      window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  useGSAP(() => {
    gsap.fromTo(".reveal-up", 
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: "power2.out" }
    );
  }, { scope: container, dependencies: [currentPage] });

  // Fallback image if none provided
  const fallbackImage = "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=1200";

  return (
    <main ref={container} className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      
      {/* Featured Article - Only show on page 1 */}
      {currentPage === 1 && featuredArticle && (
      <section className="reveal-up mb-16">
        <Link href={`/${locale}/media/articles/${featuredArticle.id}`} className="group relative block overflow-hidden rounded-3xl bg-white shadow-lg transition-transform hover:-translate-y-1 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
          <div className="grid md:grid-cols-2">
            <div className="relative h-64 md:h-full w-full overflow-hidden bg-slate-100 dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-700">
              <Image
                src={featuredArticle.image || fallbackImage}
                alt={isRTL ? featuredArticle.titleAr : featuredArticle.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = fallbackImage;
                }}
              />
            </div>
            <div className="flex flex-col justify-center p-8 md:p-12">
              <div className="mb-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {featuredArticle.date}
              </div>
              <div className="mb-4">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                  {isRTL ? featuredArticle.categoryAr : featuredArticle.category}
                </span>
              </div>
              <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white transition-colors group-hover:text-[#1a658d] dark:group-hover:text-blue-400">
                {isRTL ? featuredArticle.titleAr : featuredArticle.title}
              </h2>
              <p className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                {isRTL ? featuredArticle.excerptAr : featuredArticle.excerpt}
              </p>
              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-auto">
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {isRTL ? featuredArticle.authorAr : featuredArticle.author}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {isRTL ? featuredArticle.readTimeAr : featuredArticle.readTime}
                </div>
              </div>
            </div>
          </div>
        </Link>
      </section>
      )}

      {/* Articles Grid */}
      {currentPosts.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {currentPosts.map((article) => (
            <Link 
              key={article.id} 
              href={`/${locale}/media/articles/${article.id}`}
              className="reveal-up group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
            >
              <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                <Image
                  src={article.image || fallbackImage}
                  alt={isRTL ? article.titleAr : article.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = fallbackImage;
                  }}
                />
                <div className="absolute top-4 left-4">
                  <span className="rounded bg-white/90 px-2 py-1 text-xs font-bold text-slate-800 backdrop-blur-sm">
                    {isRTL ? article.categoryAr : article.category}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  {article.date}
                </div>
                <h3 className="mb-3 text-lg font-bold text-slate-900 dark:text-white transition-colors group-hover:text-[#1a658d] dark:group-hover:text-blue-400 line-clamp-2">
                  {isRTL ? article.titleAr : article.title}
                </h3>
                <p className="mb-4 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                  {isRTL ? article.excerptAr : article.excerpt}
                </p>
                <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-medium text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  <span>{isRTL ? article.authorAr : article.author}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {isRTL ? article.readTimeAr : article.readTime}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        !featuredArticle && (
          <div className="text-center py-24 text-slate-500 dark:text-slate-400">
            {isRTL ? "لا توجد مقالات متاحة حالياً." : "No articles available at the moment."}
          </div>
        )
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </main>
  );
}
