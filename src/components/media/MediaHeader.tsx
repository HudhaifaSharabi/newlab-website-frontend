"use client";

import { useLocale } from "next-intl";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface MediaHeaderProps {
  title: string;
  breadcrumb: string;
  category?: string;
}

export default function MediaHeader({ title, breadcrumb, category }: MediaHeaderProps) {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const ChevronIcon = isRTL ? (props: any) => <ChevronRight {...props} className="h-4 w-4 rotate-180" /> : ChevronRight;

  return (
    <div className="relative overflow-hidden bg-[#1a658d] py-20 text-center">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-900" />
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('/grid-pattern.svg')" }} />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          {title}
        </h1>

        {/* Breadcrumb */}
        <nav className="flex justify-center" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-slate-400">
            <li>
              <Link href={`/${locale}`} className="hover:text-white transition-colors">
                <Home className="h-4 w-4" />
              </Link>
            </li>
            <li><ChevronIcon className="mx-2 h-4 w-4 text-slate-600" /></li>
            <li>
              <span className="font-medium text-slate-300">Media Center</span>
            </li>
            <li><ChevronIcon className="mx-2 h-4 w-4 text-slate-600" /></li>
            <li>
              <span className={`font-medium ${category ? "text-slate-300" : "text-blue-400"}`}>
                {breadcrumb}
              </span>
            </li>
            {category && (
              <>
                <li><ChevronIcon className="mx-2 h-4 w-4 text-slate-600" /></li>
                <li>
                  <span className="font-medium text-blue-400">{category}</span>
                </li>
              </>
            )}
          </ol>
        </nav>
      </div>
    </div>
  );
}
