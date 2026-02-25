"use client";

import { useTranslations, useLocale } from "next-intl";
import MediaHeader from "@/components/media/MediaHeader";
import AlternativeNavbar from "@/components/nav/AlternativeNavbar";
import { NewLabFooter } from "@/components/footer/NewLabFooter";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { NewsItemData } from "@/types/api";
import Pagination from "@/components/ui/Pagination";

interface NewsClientProps {
  initialNews: NewsItemData[];
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

export default function NewsClient({ initialNews }: NewsClientProps) {
  const t = useTranslations("media.news");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const container = useRef(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(initialNews.length / itemsPerPage);

  // Get current posts
  const indexOfLastPost = currentPage * itemsPerPage;
  const indexOfFirstPost = indexOfLastPost - itemsPerPage;
  const currentPosts = initialNews.slice(indexOfFirstPost, indexOfLastPost);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  useGSAP(() => {
    gsap.fromTo(".news-card", 
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.15, duration: 0.8, ease: "power3.out" }
    );
  }, { scope: container, dependencies: [currentPage] });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#1a658d]">
      <AlternativeNavbar />
      <MediaHeader title={t("title")} breadcrumb={t("breadcrumb")} />

      <main ref={container} className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
        <div className="space-y-8 relative">
          
          {/* Vertical Line (Timeline) */}
          <div className={`absolute top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800 ${isRTL ? "right-8 md:right-12" : "left-8 md:left-12"}`} />

          {currentPosts.length > 0 ? currentPosts.map((item) => {
            const { day, month, year } = formatDate(item.publishDate);
            return (
              <div key={item.id} className="news-card relative flex gap-6 md:gap-10 group">
                
                {/* Date Box */}
                <div className="relative z-10 flex h-16 w-16 md:h-24 md:w-24 flex-shrink-0 flex-col items-center justify-center rounded-2xl bg-white shadow-md border border-slate-100 dark:bg-slate-800 dark:border-slate-700 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-lg">
                  <span className="text-xl md:text-3xl font-bold text-[#b9292f]">{day}</span>
                  <span className="text-xs md:text-sm font-semibold uppercase text-slate-500 dark:text-slate-400">{month}</span>
                </div>

                {/* Content Card */}
                <div className="flex-1 rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 transition-all duration-300 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800">
                  <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {year}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {isRTL ? item.readTimeAr : item.readTime}
                    </span>
                  </div>
                  <h2 className="mb-3 text-xl font-bold text-slate-900 dark:text-white group-hover:text-[#1a658d] dark:group-hover:text-blue-400 transition-colors w-full">
                    {(isRTL ? item.titleAr : item.title) || (
                      <div className="h-6 w-3/4 rounded bg-slate-200 dark:bg-slate-700 animate-pulse inline-block" />
                    )}
                  </h2>
                  <div className="mb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300 w-full flex flex-col gap-2">
                    {(isRTL ? item.excerptAr : item.excerpt) || (
                      <>
                        <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                        <div className="h-3 w-5/6 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                      </>
                    )}
                  </div>
                  <Link href={`/${locale}/media/news/${item.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#1a658d] hover:text-[#b9292f] transition-colors dark:text-blue-400 dark:hover:text-red-400">
                    {t("readMore")}
                    <ArrowRight className={`ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 ${isRTL ? "rotate-180" : ""}`} />
                  </Link>
                </div>
              </div>
            );
          }) : (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-6 md:gap-10 w-full animate-pulse">
                <div className="h-16 w-16 md:h-24 md:w-24 rounded-2xl bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
                <div className="flex-1 rounded-2xl bg-slate-200 dark:bg-slate-800 h-32 md:h-40" />
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </main>

      <NewLabFooter />
    </div>
  );
}
