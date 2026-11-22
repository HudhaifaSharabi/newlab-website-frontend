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
  if (!src) return "";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/files/") || src.startsWith("/private/files/")) {
    const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
    return base ? `${base}${src}` : src;
  }
  return src;
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

  const visionText = isRTL ? data.visionAr : data.vision;
  const missionText = isRTL ? data.missionAr : data.mission;
  const highlightsText = isRTL ? data.highlightsAr : data.highlights;

  useGSAP(() => {
    const images = imagesRef.current?.children;
    if (!images) return;

    // Parallax effect for images
    Array.from(images).forEach((img, i) => {
      gsap.to(img, {
        y: (i + 1) * -30, // Different speed for each image
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    // Text reveal animation
    const textElements = containerRef.current?.querySelectorAll(".animate-text");
    if (textElements) {
      gsap.from(textElements, {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
        },
      });
    }
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="bg-slate-50 dark:bg-slate-900 py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-20">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">

          {/* Left Column: Narrative */}
          <div className="order-2 lg:order-1">
            <h2 className="animate-text mb-2 text-3xl font-bold tracking-tight text-[#1a658d] dark:text-sky-400 sm:text-4xl">
              {(isRTL ? data.headlineAr : data.headline) || (
                <div className="h-10 w-3/4 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
              )}
            </h2>
            <div className="animate-text mb-6">
              {(isRTL ? data.subheadlineAr : data.subheadline) ? (
                <p className="text-lg font-semibold text-[#1a658d]/80 dark:text-sky-300/80">
                  {isRTL ? data.subheadlineAr : data.subheadline}
                </p>
              ) : (
                <div className="h-6 w-1/2 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
              )}
            </div>
            <div className="animate-text mb-10">
              {(isRTL ? data.bodyAr : data.body) ? (
                <p className="text-lg leading-8 text-slate-700 dark:text-slate-300">
                  {isRTL ? data.bodyAr : data.body}
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  <div className="h-4 w-4/6 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                </div>
              )}
            </div>

            {/* Optional Vision / Mission / Highlights cards if provided in story */}
            {(visionText || missionText || highlightsText) && (
              <div className="animate-text mb-10 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {visionText && (
                    <div className="rounded-2xl border border-[#1a658d]/15 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-800/90">
                      <div className="mb-2 flex items-center gap-2.5 text-[#1a658d] dark:text-sky-400">
                        <Eye className="h-5 w-5" />
                        <h3 className="font-bold text-base">
                          {isRTL ? "الرؤية" : "Our Vision"}
                        </h3>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                        {visionText}
                      </p>
                    </div>
                  )}
                  {missionText && (
                    <div className="rounded-2xl border border-[#b9292f]/15 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-800/90">
                      <div className="mb-2 flex items-center gap-2.5 text-[#b9292f] dark:text-red-400">
                        <Target className="h-5 w-5" />
                        <h3 className="font-bold text-base">
                          {isRTL ? "الرسالة" : "Our Mission"}
                        </h3>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                        {missionText}
                      </p>
                    </div>
                  )}
                </div>
                {highlightsText && (
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-800/90">
                    <div className="mb-2 flex items-center gap-2.5 text-[#1a658d] dark:text-sky-400">
                      <Sparkles className="h-5 w-5 text-[#b9292f]" />
                      <h3 className="font-bold text-base">
                        {isRTL ? "أهم ما يميز مختبراتنا" : "What Sets Our Labs Apart"}
                      </h3>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      {highlightsText}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Pillars Grid */}
            {data.pillars && data.pillars.length > 0 && (
              <div className="animate-text grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                {data.pillars.map((pillar) => (
                  <div key={pillar.id} className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 flex-none text-[#b9292f]" />
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {(isRTL ? pillar.titleAr : pillar.title) || (
                        <div className="h-5 w-32 inline-block align-middle rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Visual Proof (Masonry Grid) */}
          <div ref={imagesRef} className="order-1 lg:order-2 grid grid-cols-2 gap-4 h-[500px]">
            {/* Image 1: Reception (Large Left) */}
            <div className="relative row-span-2 overflow-hidden rounded-2xl shadow-xl bg-slate-200 dark:bg-slate-800">
              {img1 ? (
                <>
                  <Image
                    src={img1}
                    alt="New Lab Reception"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </>
              ) : (
                <div className="w-full h-full animate-pulse bg-slate-300 dark:bg-slate-700" />
              )}
            </div>

            {/* Image 2: Lab Device (Top Right) */}
            <div className="relative h-48 overflow-hidden rounded-2xl shadow-xl mt-8 bg-slate-200 dark:bg-slate-800">
              {img2 ? (
                <Image
                  src={img2}
                  alt="Advanced Lab Equipment"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              ) : (
                <div className="w-full h-full animate-pulse bg-slate-300 dark:bg-slate-700" />
              )}
            </div>

            {/* Image 3: Team (Bottom Right) */}
            <div className="relative h-56 overflow-hidden rounded-2xl shadow-xl -mt-4 bg-slate-200 dark:bg-slate-800">
              {img3 ? (
                <Image
                  src={img3}
                  alt="New Lab Medical Team"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              ) : (
                <div className="w-full h-full animate-pulse bg-slate-300 dark:bg-slate-700" />
              )}
            </div>
          </div>

        </div>

        {/* Founder / General Supervisor Quote & Portrait Card */}
        {(founderQuote || founderName || founderImage) && (
          <div className="animate-text relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-10 lg:p-12 shadow-[0_16px_48px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-800/90 dark:shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
            <div
              className={`absolute inset-x-0 top-0 h-1 ${isRTL
                  ? "bg-gradient-to-l from-[#b9292f] via-[#1a658d] to-transparent"
                  : "bg-gradient-to-r from-[#b9292f] via-[#1a658d] to-transparent"
                }`}
            />

            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              {/* Founder Portrait */}
              {founderImage && (
                <div className="flex justify-center lg:col-span-4">
                  <div className="relative h-64 w-64 sm:h-72 sm:w-72 overflow-hidden rounded-2xl border-2 border-[#1a658d]/20 shadow-xl bg-slate-100 dark:border-sky-400/20 dark:bg-slate-900">
                    <Image
                      src={founderImage}
                      alt={founderName || "General Director"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 288px, 288px"
                    />
                  </div>
                </div>
              )}

              {/* Founder Quote & Bio */}
              <div className={founderImage ? "lg:col-span-8" : "lg:col-span-12"}>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#b9292f]/10 px-4 py-1.5 text-xs font-bold text-[#b9292f] dark:bg-[#b9292f]/20 dark:text-red-400">
                  <Quote className="h-4 w-4" />
                  <span>{isRTL ? "المدير العام" : "General Director"}</span>
                </div>

                {founderQuote && (
                  <blockquote className="mb-6 text-2xl sm:text-3xl font-black leading-snug text-slate-900 dark:text-white">
                    &ldquo;{founderQuote}&rdquo;
                  </blockquote>
                )}

                {(founderName || founderRole) && (
                  <div className="border-t border-slate-100 pt-4 dark:border-slate-700/70">
                    {founderName && (
                      <div className="text-lg font-bold text-[#1a658d] dark:text-sky-400">
                        {founderName}
                      </div>
                    )}
                    {founderRole && (
                      <div className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                        {founderRole}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
