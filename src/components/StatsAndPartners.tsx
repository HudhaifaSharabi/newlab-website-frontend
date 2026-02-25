"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useLocale, useTranslations } from "next-intl";
import { StatsData, Partner } from "@/types/api";

// Register ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Local type extending the API type for color
type LocalStat = {
  value: number;
  suffix: string;
  label: string;
  color: "blue" | "red";
};

// API Partner type is exported from @/types/api so we don't need to define Partner again.

const defaultStats: LocalStat[] = [
  { value: 15000, suffix: "+", label: "monthlySamples", color: "blue" },
  { value: 99.9, suffix: "%", label: "accuracy", color: "red" },
  { value: 450, suffix: "+", label: "activeDoctors", color: "blue" },
  { value: 12, suffix: "+", label: "yearsExperience", color: "red" },
];

const defaultPartners: Partner[] = [
  { name_en: "Hospital A", name_ar: "مستشفى أ", logo: "" },
  { name_en: "Insurance B", name_ar: "تأمين ب", logo: "" },
  { name_en: "Medical Center C", name_ar: "مركز طبي ج", logo: "" },
  { name_en: "Clinic D", name_ar: "عيادة د", logo: "" },
  { name_en: "Health Group E", name_ar: "مجموعة صحية هـ", logo: "" },
  { name_en: "Diagnostics F", name_ar: "تشخيصات و", logo: "" },
  { name_en: "Lab Partners G", name_ar: "شركاء المختبر ز", logo: "" },
  { name_en: "Healthcare H", name_ar: "رعاية صحية ح", logo: "" },
];

export function StatsAndPartners({
  statsData,
  partnersData,
}: {
  statsData?: StatsData;
  partnersData?: Partner[];
}) {
  const t = useTranslations("stats");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const displayStats: LocalStat[] = statsData?.counters?.map((item, index) => ({
    value: item.value || parseFloat((item as any).value?.replace(/[^0-9.]/g, '') || "0") || 0,
    suffix: item.suffix || (item as any).value?.replace(/[0-9.]/g, '') || "",
    label: isRTL ? item.label_ar : item.label_en,
    color: (item.color as "blue" | "red") || (index % 2 === 0 ? "blue" : "red")
  })) || defaultStats;

  const displayPartners = partnersData || defaultPartners;
  const containerRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeInnerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  
  // Create a timeline reference for the marquee to control play/pause
  const marqueeTween = useRef<gsap.core.Tween | null>(null);

  useGSAP(
    () => {
      // 1. Stats Counter Animation
      const statElements = document.querySelectorAll(".stat-item");
      
      statElements.forEach((stat, index) => {
        const valueElement = stat.querySelector(".stat-value");
        if (!valueElement) return;

        const targetValue = displayStats[index].value;
        const isDecimal = targetValue % 1 !== 0;
        
        // Proxy object to animate
        const proxy = { val: 0 };

        gsap.to(proxy, {
          val: targetValue,
          duration: 2.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: stat,
            start: "top 85%", // Start when top of element hits 85% of viewport height
            once: true, // Only animate once
          },
          onUpdate: () => {
            if (valueElement) {
              const current = proxy.val;
              valueElement.textContent = isDecimal 
                ? current.toFixed(1)
                : Math.floor(current).toLocaleString();
            }
          },
        });
      });

      // 2. Infinite Marquee Animation
      if (marqueeInnerRef.current) {
        // We use xPercent: -50 because the inner container has 2x the content
        // This moves it exactly half its width, creating a seamless loop
        marqueeTween.current = gsap.to(marqueeInnerRef.current, {
          xPercent: -50,
          repeat: -1,
          duration: 40,
          ease: "none",
        });
      }
    },
    { scope: containerRef }
  );

  // Handle Play/Pause
  const handleMouseEnter = () => {
    setIsPaused(true);
    marqueeTween.current?.pause();
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    marqueeTween.current?.play();
  };

  return (
    <section 
      ref={containerRef} 
      className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white py-24 dark:from-[#020617] dark:to-[#0a0f1e]"
    >
      {/* Background Pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.15] dark:opacity-[0.08]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(15,23,42,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.08) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* Subtle Ambient Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1a658d]/5 blur-[200px] dark:bg-[#1a658d]/10" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Stats Grid */}
        <div className="mb-20">
          <div className="mb-12 text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.4em] text-[#1a658d] dark:text-[#1a658d] flex justify-center">
              {statsData ? (
                (isRTL ? statsData.title_ar : statsData.title_en) || <div className="h-4 w-32 rounded bg-[#1a658d]/20 animate-pulse" />
              ) : t("title")}
            </div>
            <h2 className="mt-4 text-4xl font-black leading-tight text-slate-900 dark:text-white sm:text-5xl flex justify-center w-full">
              {statsData ? (
                (isRTL ? statsData.subtitle_ar : statsData.subtitle_en) || <div className="h-10 w-2/3 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse mt-2" />
              ) : t("subtitle")}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {displayStats.map((stat, index) => (
              <div key={index} className="stat-item flex flex-col items-center text-center">
                <div 
                  className={`flex text-5xl font-black md:text-6xl ${
                    stat.color === "blue" 
                      ? "text-[#1a658d] dark:text-[#1a658d]" 
                      : "text-[#b9292f] dark:text-[#b9292f]"
                  }`}
                >
                  <span className="stat-value">0</span>
                  <span>{stat.suffix}</span>
                </div>
                <div className="mt-3 text-xs font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-400">
                  {statsData ? stat.label : t(stat.label)}
                </div>
              </div>
            ))}
          </div>
        </div>

       
      </div>
    </section>
  );
}
