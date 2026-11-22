"use client";

import { useRef } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { CheckCircle2, Quote, Eye, Target, Sparkles } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AboutFounderData, AboutStoryData } from "@/types/api";

gsap.registerPlugin(ScrollTrigger);

interface OurStoryProps {
  data: AboutStoryData;
  founder?: AboutFounderData;
}

const resolveImageUrl = (src?: string) => {
  if (!src || !src.trim()) return "";
  return src.trim();
};

export default function OurStory({ data, founder }: OurStoryProps) {
  const locale = useLocale();
  const isRTL = locale === "ar";

  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLDivElement>(null);

  const founderData = founder || data.founder;
  const founderQuote = isRTL
    ? founderData?.quoteAr || founderData?.quote_ar
    : founderData?.quote || founderData?.quote_en;
  const founderName = isRTL
    ? founderData?.nameAr || founderData?.name_ar
    : founderData?.name || founderData?.name_en;
  const founderRole = isRTL
    ? founderData?.roleAr || founderData?.role_ar
    : founderData?.role || founderData?.role_en;
  const founderImage = resolveImageUrl(founderData?.image);
  const img1 = resolveImageUrl(data.image1);
  const img2 = resolveImageUrl(data.image2);
  const img3 = resolveImageUrl(data.image3);
  const storyImages = [img1, img2, img3].filter(Boolean);

  const visionText = isRTL ? data.visionAr : data.vision;
  const missionText = isRTL ? data.missionAr : data.mission;
  const highlightsText = isRTL ? data.highlightsAr : data.highlights;

  useGSAP(() => {
    // Text reveal animation
    const textElements = containerRef.current?.querySelectorAll(".animate-text");
    if (textElements && textElements.length > 0) {
      gsap.fromTo(
        textElements,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          stagger: 0.12,
          ease: "power3.out",
          clearProps: "opacity,transform",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 78%",
          },
        }
      );
    }
  }, { scope: containerRef });

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-slate-50 py-20 sm:py-24 dark:bg-slate-900"
    >
      {/* Subtle decorative background glows */}
      <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-[#1a658d]/5 blur-3xl dark:bg-sky-500/5" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-96 w-96 rounded-full bg-[#b9292f]/5 blur-3xl dark:bg-red-500/5" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 space-y-16 sm:space-y-20">
        {/* ===== 1. Story Narrative + Optional Bento Image Grid ===== */}
        <div
          className={`grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center ${
            storyImages.length > 0 ? "lg:gap-12" : ""
          }`}
        >
          {/* Narrative Column */}
          <div
            className={`${
              storyImages.length > 0 ? "lg:col-span-6" : "lg:col-span-12"
            } rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 lg:p-12 shadow-[0_12px_36px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-800/80 space-y-6`}
          >
            <div className="animate-text">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#1a658d]/20 bg-[#1a658d]/10 px-4 py-1.5 text-xs font-bold tracking-wider text-[#1a658d] dark:border-sky-400/30 dark:bg-sky-500/10 dark:text-sky-300">
                <span className="h-2 w-2 rounded-full bg-[#b9292f]" />
                <span>{isRTL ? "نبذة عن المختبر" : "OUR STORY"}</span>
              </div>

              <h2 className="text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-3xl lg:text-4xl dark:text-white">
                {(isRTL ? data.headlineAr : data.headline) || (
                  <div className="h-10 w-3/4 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
                )}
              </h2>
            </div>

            {/* Subheadline with accent bar */}
            {(isRTL ? data.subheadlineAr : data.subheadline) && (
              <div className="animate-text">
                <div className="inline-flex items-center border-s-4 border-[#b9292f] bg-slate-50 py-2.5 ps-4 pe-5 rounded-e-xl dark:bg-slate-900/70">
                  <p className="text-base sm:text-lg font-bold text-[#1a658d] dark:text-sky-400">
                    {isRTL ? data.subheadlineAr : data.subheadline}
                  </p>
                </div>
              </div>
            )}

            {/* Body text */}
            <div className="animate-text">
              {(isRTL ? data.bodyAr : data.body) ? (
                <p className="text-[16px] sm:text-[18px] leading-9 text-slate-700 dark:text-slate-300">
                  {isRTL ? data.bodyAr : data.body}
                </p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  <div className="h-4 w-4/6 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                </div>
              )}
            </div>

            {/* Pillars Grid */}
            {data.pillars && data.pillars.length > 0 && (
              <div
                className={`animate-text pt-3 grid grid-cols-1 gap-4 ${
                  storyImages.length > 0 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4"
                }`}
              >
                {data.pillars.map((pillar) => (
                  <div
                    key={pillar.id}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 transition-all duration-200 hover:border-[#1a658d]/40 hover:bg-white hover:shadow-md dark:border-slate-700/70 dark:bg-slate-900/60 dark:hover:bg-slate-900"
                  >
                    <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-[#b9292f]/10 text-[#b9292f] dark:bg-[#b9292f]/20 dark:text-red-400">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-bold leading-snug text-slate-800 dark:text-slate-100">
                      {isRTL ? pillar.titleAr : pillar.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visual Proof (Rendered only when story images exist in Backend) */}
          {storyImages.length > 0 && (
            <div
              ref={imagesRef}
              className="lg:col-span-6 grid grid-cols-12 grid-rows-2 gap-4 h-[420px] sm:h-[480px]"
            >
              {storyImages.length === 1 && (
                <div className="relative col-span-12 row-span-2 overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-200 shadow-lg group dark:border-slate-800 dark:bg-slate-800">
                  <Image
                    src={storyImages[0]}
                    alt="New Lab Facility"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}

              {storyImages.length === 2 && (
                <>
                  <div className="relative col-span-6 row-span-2 overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-200 shadow-lg group dark:border-slate-800 dark:bg-slate-800">
                    <Image
                      src={storyImages[0]}
                      alt="New Lab Facility"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                  <div className="relative col-span-6 row-span-2 overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-200 shadow-lg group dark:border-slate-800 dark:bg-slate-800">
                    <Image
                      src={storyImages[1]}
                      alt="Advanced Lab Equipment"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                </>
              )}

              {storyImages.length >= 3 && (
                <>
                  <div className="relative col-span-7 row-span-2 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-200 shadow-lg group dark:border-slate-800 dark:bg-slate-800">
                    <Image
                      src={storyImages[0]}
                      alt="New Lab Facility"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 60vw, 33vw"
                    />
                  </div>
                  <div className="relative col-span-5 row-span-1 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-200 shadow-lg group dark:border-slate-800 dark:bg-slate-800">
                    <Image
                      src={storyImages[1]}
                      alt="Advanced Lab Equipment"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 40vw, 25vw"
                    />
                  </div>
                  <div className="relative col-span-5 row-span-1 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-200 shadow-lg group dark:border-slate-800 dark:bg-slate-800">
                    <Image
                      src={storyImages[2]}
                      alt="New Lab Medical Team"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 40vw, 25vw"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ===== 2. General Director's Message (كلمة المدير العام) ===== */}
        {(founderQuote || founderName || founderImage) && (
          <div className="animate-text relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-800/90 dark:shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
            {/* Top dual brand gradient bar */}
            <div
              className={`h-2 w-full ${
                isRTL
                  ? "bg-gradient-to-l from-[#b9292f] via-[#1a658d] to-[#1a658d]"
                  : "bg-gradient-to-r from-[#b9292f] via-[#1a658d] to-[#1a658d]"
              }`}
            />

            {/* Large decorative background quote watermark */}
            <Quote
              className={`pointer-events-none absolute bottom-4 ${
                isRTL ? "left-6" : "right-6"
              } h-40 w-40 text-[#1a658d]/[0.04] dark:text-white/[0.03]`}
            />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12">
              {/* Director Portrait Side Panel */}
              <div className="relative flex flex-col items-center justify-center bg-gradient-to-b from-[#1a658d]/[0.06] via-[#1a658d]/[0.03] to-transparent p-8 sm:p-10 lg:col-span-4 lg:border-e border-slate-200/70 dark:from-slate-900/80 dark:to-transparent dark:border-slate-700/70">
                <div className="relative">
                  {/* Soft glow ring behind portrait */}
                  <div className="absolute -inset-2 rounded-3xl bg-gradient-to-b from-[#1a658d]/25 to-[#b9292f]/20 blur-md" />
                  <div className="relative h-72 w-60 sm:h-80 sm:w-64 overflow-hidden rounded-2xl border-4 border-white bg-slate-100 shadow-2xl ring-1 ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:ring-slate-700">
                    {founderImage ? (
                      <Image
                        src={founderImage}
                        alt={founderName || (isRTL ? "المدير العام" : "General Director")}
                        fill
                        className="object-cover object-top"
                        sizes="(max-width: 768px) 256px, 280px"
                      />
                    ) : (
                      <div className="h-full w-full animate-pulse bg-slate-200 dark:bg-slate-700" />
                    )}
                  </div>
                </div>

                {/* Director Role Pill under photo */}
                <div className="mt-5 text-center">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#1a658d] px-5 py-1.5 text-xs font-extrabold tracking-wide text-white shadow-md">
                    <span className="h-2 w-2 rounded-full bg-[#b9292f] ring-2 ring-white" />
                    {isRTL ? "المدير العام" : "General Director"}
                  </span>
                </div>
              </div>

              {/* Director Message & Info Panel */}
              <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12 lg:col-span-8">
                {/* Header Label: كلمة المدير العام */}
                <div className="mb-6 flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#b9292f]/25 bg-[#b9292f]/10 px-4 py-1.5 text-sm font-extrabold text-[#b9292f] dark:border-red-400/30 dark:bg-[#b9292f]/20 dark:text-red-300">
                    <Quote className="h-4 w-4" />
                    <span>{isRTL ? "كلمة المدير العام" : "General Director's Message"}</span>
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-700" />
                </div>

                {/* Quote Box with Prominent Quotation Marks */}
                {founderQuote && (
                  <div className="relative mb-8 rounded-2xl border border-[#1a658d]/15 bg-slate-50/90 p-6 sm:p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
                    <div
                      className={`absolute top-4 bottom-4 w-1.5 rounded-full bg-gradient-to-b from-[#b9292f] to-[#1a658d] ${
                        isRTL ? "right-0" : "left-0"
                      }`}
                    />
                    <blockquote className="ps-3 text-xl sm:text-2xl lg:text-3xl font-black leading-relaxed text-slate-900 dark:text-white">
                      <span
                        aria-hidden="true"
                        className="inline-block text-3xl sm:text-4xl font-black text-[#b9292f] me-2 align-middle"
                      >
                        &ldquo;
                      </span>
                      <span>{founderQuote}</span>
                      <span
                        aria-hidden="true"
                        className="inline-block text-3xl sm:text-4xl font-black text-[#b9292f] ms-2 align-middle"
                      >
                        &rdquo;
                      </span>
                    </blockquote>
                  </div>
                )}

                {/* Director Title, Name & Academic Position */}
                <div className="flex flex-col gap-1.5 border-t border-slate-200/80 pt-5 dark:border-slate-700/80">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-[#b9292f] dark:text-red-400">
                    {isRTL ? "المدير العام لمختبرات نيولاب التخصصية" : "General Director of New Lab Specialized Laboratories"}
                  </div>

                  {founderName && (
                    <h3 className="text-xl sm:text-2xl font-black text-[#1a658d] dark:text-sky-400">
                      {founderName}
                    </h3>
                  )}

                  {founderRole && (
                    <p className="text-sm sm:text-base font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                      {founderRole}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== 3. Vision, Mission & What Sets Us Apart (Full-Width Balanced Grid) ===== */}
        {(visionText || missionText || highlightsText) && (
          <div className="animate-text grid grid-cols-1 gap-6 md:grid-cols-3">
            {visionText && (
              <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-800/90">
                <div className="absolute inset-x-0 top-0 h-1.5 bg-[#1a658d]" />
                <div className="mb-4 flex items-center gap-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a658d]/10 text-[#1a658d] dark:bg-sky-500/15 dark:text-sky-400">
                    <Eye className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {isRTL ? "الرؤية" : "Our Vision"}
                  </h3>
                </div>
                <p className="text-[15px] sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
                  {visionText}
                </p>
              </div>
            )}

            {missionText && (
              <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-800/90">
                <div className="absolute inset-x-0 top-0 h-1.5 bg-[#b9292f]" />
                <div className="mb-4 flex items-center gap-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#b9292f]/10 text-[#b9292f] dark:bg-red-500/15 dark:text-red-400">
                    <Target className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {isRTL ? "الرسالة" : "Our Mission"}
                  </h3>
                </div>
                <p className="text-[15px] sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
                  {missionText}
                </p>
              </div>
            )}

            {highlightsText && (
              <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-800/90">
                <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#1a658d] to-[#b9292f]" />
                <div className="mb-4 flex items-center gap-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a658d]/10 text-[#b9292f] dark:bg-sky-500/15 dark:text-red-400">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {isRTL ? "أهم ما يميز مختبراتنا" : "What Sets Our Labs Apart"}
                  </h3>
                </div>
                <p className="text-[15px] sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
                  {highlightsText}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
