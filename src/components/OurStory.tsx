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
      className="bg-slate-50 py-16 sm:py-20 dark:bg-slate-900"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8 space-y-12">
        {/* ===== 1. Story Narrative + Optional Images ===== */}
        <div
          className={`grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center ${
            storyImages.length > 0 ? "lg:gap-12" : ""
          }`}
        >
          {/* Narrative Column */}
          <div
            className={`${
              storyImages.length > 0 ? "lg:col-span-6" : "lg:col-span-12"
            } rounded-2xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-sm dark:border-slate-800 dark:bg-slate-800/80 space-y-5`}
          >
            <div className="animate-text">
              <p className="mb-2 text-xs font-bold tracking-wide text-[#b9292f] dark:text-red-400">
                {isRTL ? "نبذة عن المختبر" : "OUR STORY"}
              </p>

              <h2 className="text-2xl font-bold leading-snug text-slate-900 sm:text-3xl dark:text-white">
                {(isRTL ? data.headlineAr : data.headline) || (
                  <div className="h-9 w-3/4 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
                )}
              </h2>
            </div>

            {/* Subheadline */}
            {(isRTL ? data.subheadlineAr : data.subheadline) && (
              <p className="animate-text text-base font-semibold text-[#1a658d] dark:text-sky-400">
                {isRTL ? data.subheadlineAr : data.subheadline}
              </p>
            )}

            {/* Body text */}
            <div className="animate-text">
              {(isRTL ? data.bodyAr : data.body) ? (
                <p className="text-base sm:text-[17px] leading-8 text-slate-600 dark:text-slate-300">
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
                className={`animate-text pt-4 border-t border-slate-100 dark:border-slate-700/60 grid grid-cols-1 gap-3.5 ${
                  storyImages.length > 0 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4"
                }`}
              >
                {data.pillars.map((pillar) => (
                  <div
                    key={pillar.id}
                    className="flex items-center gap-2.5 text-slate-700 dark:text-slate-200"
                  >
                    <CheckCircle2 className="h-4 w-4 flex-none text-[#1a658d] dark:text-sky-400" />
                    <span className="text-sm font-medium leading-snug">
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
              className="lg:col-span-6 grid grid-cols-12 grid-rows-2 gap-4 h-[400px] sm:h-[440px]"
            >
              {storyImages.length === 1 && (
                <div className="relative col-span-12 row-span-2 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
                  <Image
                    src={storyImages[0]}
                    alt="New Lab Facility"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}

              {storyImages.length === 2 && (
                <>
                  <div className="relative col-span-6 row-span-2 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
                    <Image
                      src={storyImages[0]}
                      alt="New Lab Facility"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                  <div className="relative col-span-6 row-span-2 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
                    <Image
                      src={storyImages[1]}
                      alt="Advanced Lab Equipment"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                </>
              )}

              {storyImages.length >= 3 && (
                <>
                  <div className="relative col-span-7 row-span-2 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
                    <Image
                      src={storyImages[0]}
                      alt="New Lab Facility"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 60vw, 33vw"
                    />
                  </div>
                  <div className="relative col-span-5 row-span-1 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
                    <Image
                      src={storyImages[1]}
                      alt="Advanced Lab Equipment"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 40vw, 25vw"
                    />
                  </div>
                  <div className="relative col-span-5 row-span-1 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
                    <Image
                      src={storyImages[2]}
                      alt="New Lab Medical Team"
                      fill
                      className="object-cover"
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
          <div className="animate-text rounded-2xl border border-slate-200/80 bg-white p-7 sm:p-10 shadow-sm dark:border-slate-800 dark:bg-slate-800/80">
            <div className="flex flex-col items-center gap-8 md:flex-row md:items-center lg:gap-10">
              {/* Director Portrait */}
              {founderImage && (
                <div className="relative h-60 w-52 sm:h-64 sm:w-56 flex-none overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900">
                  <Image
                    src={founderImage}
                    alt={founderName || (isRTL ? "المدير العام" : "General Director")}
                    fill
                    className="object-cover object-top"
                    sizes="224px"
                  />
                </div>
              )}

              {/* Director Quote & Bio */}
              <div className="flex-1 text-center md:text-start">
                <p className="mb-3 text-xs font-bold tracking-wide text-[#b9292f] dark:text-red-400">
                  {isRTL ? "كلمة المدير العام" : "General Director's Message"}
                </p>

                {founderQuote && (
                  <blockquote className="mb-6 text-xl sm:text-2xl font-bold leading-relaxed text-slate-900 dark:text-white">
                    &ldquo;{founderQuote}&rdquo;
                  </blockquote>
                )}

                {(founderName || founderRole) && (
                  <div className="border-t border-slate-100 pt-4 dark:border-slate-700/60">
                    {founderName && (
                      <h3 className="text-lg font-bold text-[#1a658d] dark:text-sky-400">
                        {founderName}
                      </h3>
                    )}
                    {founderRole && (
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {founderRole}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== 3. Vision, Mission & What Sets Us Apart ===== */}
        {(visionText || missionText || highlightsText) && (
          <div className="animate-text grid grid-cols-1 gap-6 md:grid-cols-3">
            {visionText && (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-800/80">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1a658d]/10 text-[#1a658d] dark:bg-sky-500/15 dark:text-sky-400">
                    <Eye className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {isRTL ? "الرؤية" : "Our Vision"}
                  </h3>
                </div>
                <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
                  {visionText}
                </p>
              </div>
            )}

            {missionText && (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-800/80">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#b9292f]/10 text-[#b9292f] dark:bg-red-500/15 dark:text-red-400">
                    <Target className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {isRTL ? "الرسالة" : "Our Mission"}
                  </h3>
                </div>
                <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
                  {missionText}
                </p>
              </div>
            )}

            {highlightsText && (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-800/80">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1a658d]/10 text-[#1a658d] dark:bg-sky-500/15 dark:text-sky-400">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {isRTL ? "أهم ما يميز مختبراتنا" : "What Sets Our Labs Apart"}
                  </h3>
                </div>
                <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
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
