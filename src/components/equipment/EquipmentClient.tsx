"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { ArrowRight, Activity, Zap } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef, useState, useEffect } from "react";
import AlternativeNavbar from "@/components/nav/AlternativeNavbar";
import { NewLabFooter } from "@/components/footer/NewLabFooter";
import { EquipmentItemData } from "@/types/api";
import Pagination from "@/components/ui/Pagination";

interface EquipmentClientProps {
  initialEquipment: EquipmentItemData[];
}

export default function EquipmentClient({ initialEquipment }: EquipmentClientProps) {
  const t = useTranslations("equipment");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const container = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const totalPages = Math.ceil(initialEquipment.length / itemsPerPage);

  // Get current posts
  const indexOfLastPost = currentPage * itemsPerPage;
  const indexOfFirstPost = indexOfLastPost - itemsPerPage;
  const currentPosts = initialEquipment.slice(indexOfFirstPost, indexOfLastPost);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  useGSAP(() => {
    gsap.fromTo(".equipment-card", 
      { y: 30, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        clearProps: "opacity", // Ensure opacity is cleared after animation
      }
    );
  }, { scope: container, dependencies: [currentPage] });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <AlternativeNavbar />
      
      <main ref={container} className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="mb-12 text-center">
          <span className="mb-4 inline-block rounded-full bg-[#1a658d]/10 px-4 py-1.5 text-sm font-semibold text-[#1a658d] dark:bg-blue-900/30 dark:text-blue-200">
            {t("title")}
          </span>
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            {t("subtitle")}
          </h1>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {currentPosts.length > 0 ? currentPosts.map((item) => {
            return (
            <Link
              key={item.id}
              href={`/${locale}/equipment/${item.id}`}
              className="equipment-card group relative block overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:bg-slate-800"
            >
              {/* Image Section */}
              <div className="relative h-64 w-full overflow-hidden bg-white border-b border-slate-100 dark:bg-slate-700 dark:border-slate-600">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={(isRTL ? item.nameAr : item.name) || "Equipment image"}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 animate-pulse" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4 rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-700 backdrop-blur-sm dark:text-green-300">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                    </span>
                    {t(`status.${item.status}`)}
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-full flex items-center flex-wrap gap-1">
                  {(isRTL ? item.manufacturerAr : item.manufacturer) || <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-700 animate-pulse inline-block" />} • {t(`category.${item.category}`)}
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white w-full">
                  {(isRTL ? item.nameAr : item.name) || (
                    <div className="h-6 w-3/4 rounded bg-slate-200 dark:bg-slate-700 animate-pulse inline-block" />
                  )}
                </h3>
                
                <div className="mb-6 flex flex-wrap gap-2">
                  <span className="flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    <Zap className="h-3 w-3" /> {isRTL ? item.speedAr : item.speed}
                  </span>
                  <span className="flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    <Activity className="h-3 w-3" /> {item.accuracy}% Acc.
                  </span>
                </div>

                <div className="flex items-center text-sm font-semibold text-[#1a658d] transition-colors group-hover:text-[#b9292f] dark:text-blue-400 dark:group-hover:text-red-400">
                  {t("cta")}
                  <ArrowRight className={`ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 ${isRTL ? "rotate-180" : ""}`} />
                </div>
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent transition-colors duration-300 group-hover:border-[#1a658d]/20 pointer-events-none" />
            </Link>
          )}) : (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-96 w-full rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
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
