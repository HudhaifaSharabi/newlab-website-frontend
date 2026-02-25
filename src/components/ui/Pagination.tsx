"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "next-intl";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const locale = useLocale();
  const isRTL = locale === "ar";

  if (totalPages <= 1) return null;

  // Generate page numbers
  const pages = [];
  const maxPagesToShow = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
  
  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="mt-12 flex justify-center items-center gap-2" dir="ltr">
      <button
        onClick={isRTL ? handleNext : handlePrev}
        disabled={isRTL ? currentPage === totalPages : currentPage === 1}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        aria-label="Previous Page"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(isRTL ? totalPages : 1)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-sm font-medium transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            {isRTL ? totalPages : 1}
          </button>
          {startPage > 2 && <span className="text-slate-400 px-1">...</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(isRTL ? totalPages - page + 1 : page)}
          className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
            (isRTL ? totalPages - page + 1 : page) === currentPage
              ? "border-[#1a658d] bg-[#1a658d] text-white dark:border-blue-500 dark:bg-blue-600"
              : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          {isRTL ? totalPages - page + 1 : page}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="text-slate-400 px-1">...</span>}
          <button
            onClick={() => onPageChange(isRTL ? 1 : totalPages)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-sm font-medium transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            {isRTL ? 1 : totalPages}
          </button>
        </>
      )}

      <button
        onClick={isRTL ? handlePrev : handleNext}
        disabled={isRTL ? currentPage === 1 : currentPage === totalPages}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        aria-label="Next Page"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
