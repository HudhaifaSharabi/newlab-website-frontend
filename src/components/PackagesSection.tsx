"use client";

import { useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Activity, Sparkles, Heart, Check } from "lucide-react";
import { PackagesData } from "@/types/api";

gsap.registerPlugin(ScrollTrigger);

type Locale = "en" | "ar";

type Package = {
  id: string;
  name: string;
  nameAr: string;
  price: string;
  priceAr: string;
  icon: "activity" | "sparkles" | "heart";
  featured: boolean;
  features: string[];
  featuresAr: string[];
};

const content = {
  en: {
    eyebrow: "HEALTH PACKAGES",
    title: "Precision diagnostics, tailored for you.",
    subtitle: "Choose the package that fits your health goals. All include specialist review and certified reporting.",
    cta: "Book now",
    bestValue: "Best Value",
  },
  ar: {
    eyebrow: "باقات الصحة",
    title: "تشخيصات دقيقة، مصممة لك.",
    subtitle: "اختر الباقة التي تناسب أهدافك الصحية. جميعها تشمل مراجعة الأخصائي والتقارير المعتمدة.",
    cta: "احجز الآن",
    bestValue: "أفضل قيمة",
  },
};

export function PackagesSection({
  packagesData
}: {
  packagesData?: PackagesData;
}) {
  const locale = useLocale() as Locale;
  const isRTL = locale === "ar";
  const copy = packagesData ? {
    eyebrow: isRTL ? packagesData.badge_ar : packagesData.badge_en,
    title: isRTL ? packagesData.title_ar : packagesData.title_en,
    subtitle: isRTL ? packagesData.subtitle_ar : packagesData.subtitle_en,
    cta: isRTL ? "احجز الآن" : "Book now", // Assuming cta is not in api data
    bestValue: isRTL ? "أفضل قيمة" : "Best Value",
  } : (content[locale] ?? content.en);

  const displayPackages = packagesData?.items || [];

  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // GSAP Animations
  useGSAP(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Title entrance animation
      if (titleRef.current) {
        gsap.from(titleRef.current, {
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top bottom-=100",
            toggleActions: "play none none reverse",
          },
        });
      }

      // Cards stagger entrance
      gsap.from(cardsRef.current.filter(Boolean), {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom-=150",
          toggleActions: "play none none reverse",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Hover animations for individual cards
  const handleCardHover = (index: number, isEntering: boolean) => {
    const card = cardsRef.current[index];
    if (!card) return;

    const icon = card.querySelector(".package-icon");
    const border = card.querySelector(".package-border");

    if (isEntering) {
      gsap.to(icon, { scale: 1.1, duration: 0.3, ease: "power2.out" });
      gsap.to(border, { opacity: 1, duration: 0.3 });
    } else {
      gsap.to(icon, { scale: 1, duration: 0.3, ease: "power2.out" });
      gsap.to(border, { opacity: 0, duration: 0.3 });
    }
  };

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "activity":
        return Activity;
      case "sparkles":
        return Sparkles;
      case "heart":
        return Heart;
      default:
        return Activity;
    }
  };

  return (
    <section
      ref={sectionRef}
      dir={isRTL ? "rtl" : "ltr"}
      className="relative overflow-hidden bg-white py-24 text-slate-900 dark:bg-[#020617] dark:text-white"
    >
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Medical Tech Grid */}
        <div
          className="absolute inset-0 opacity-[0.15] dark:opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(15,23,42,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.08) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Gradient Blobs */}
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/10 blur-[200px] dark:bg-teal-500/5" />
        <div className="absolute right-10 bottom-20 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[180px] dark:bg-blue-500/5" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <div ref={titleRef} className="mb-16 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-[#1a658d] dark:text-[#1a658d]">
            {copy.eyebrow}
          </p>
          <h2 className="mt-4 text-4xl font-black leading-tight text-slate-900 dark:text-white sm:text-5xl">
            {copy.title}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-600 dark:text-slate-300">
            {copy.subtitle}
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {displayPackages.length > 0 ? displayPackages.map((pkg, index) => {
            const Icon = getIcon(pkg.icon);
            const packageName = isRTL ? (pkg as any).name_ar || (pkg as any).nameAr : (pkg as any).name_en || (pkg as any).name;
            const packagePrice = isRTL ? (pkg as any).price_ar || (pkg as any).priceAr : (pkg as any).price_en || (pkg as any).price;
            const packageFeatures = isRTL ? (pkg as any).features_ar || (pkg as any).featuresAr : (pkg as any).features_en || (pkg as any).features;

            return (
              <div
                key={pkg.id}
                ref={(el) => { cardsRef.current[index] = el; }}
                onMouseEnter={() => handleCardHover(index, true)}
                onMouseLeave={() => handleCardHover(index, false)}
                className="group relative"
              >
                {/* Best Value Badge */}
                {((pkg as any).featured || (pkg as any).isFeatured) && (
                  <div className="absolute -top-4 left-1/2 z-10 -translate-x-1/2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#b9292f]/20 bg-gradient-to-r from-[#b9292f] to-[#d33f46] px-4 py-1.5 text-xs font-semibold text-white shadow-lg">
                      <Sparkles className="h-3 w-3" />
                      {copy.bestValue}
                    </span>
                  </div>
                )}

                {/* Card */}
                <div
                  className={`relative h-full overflow-hidden rounded-3xl border backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 group-hover:shadow-2xl ${
                    ((pkg as any).featured || (pkg as any).isFeatured)
                      ? "border-[#b9292f] bg-[#b9292f] shadow-[0_20px_60px_rgba(185,41,47,0.3)]"
                      : "border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900/20 group-hover:border-[#b9292f] group-hover:bg-[#b9292f]"
                  }`}
                >
                  {/* Spotlight Effect (Subtle) */}
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(26,101,141,0.05),transparent_70%)] opacity-100 group-hover:opacity-0 transition-opacity duration-300" />
                  
                  {/* Red Hover Gradient Overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-black/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="relative p-8">
                    {/* Icon */}
                    <div className="mb-6 flex justify-center">
                      <div className="package-icon relative transition-transform duration-300 group-hover:scale-110">
                        <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-300 ${((pkg as any).featured || (pkg as any).isFeatured) ? "bg-white/20" : "bg-teal-500/10 group-hover:bg-white/20"}`} />
                        <div className={`relative flex h-20 w-20 items-center justify-center rounded-full border transition-all duration-300 ${
                          ((pkg as any).featured || (pkg as any).isFeatured)
                            ? "border-white/30 bg-white/10"
                            : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 group-hover:border-white/30 group-hover:bg-white/10"
                        }`}>
                          <Icon className={`h-10 w-10 transition-colors duration-300 ${((pkg as any).featured || (pkg as any).isFeatured) ? "text-white" : "text-[#1a658d] dark:text-[#1a658d] group-hover:text-white"}`} strokeWidth={1.5} />
                        </div>
                      </div>
                    </div>

                    {/* Header */}
                    <div className="mb-6 text-center">
                      <h3 className={`text-2xl font-bold transition-colors duration-300 ${((pkg as any).featured || (pkg as any).isFeatured) ? "text-white" : "text-slate-900 dark:text-white group-hover:text-white"}`}>
                        {packageName}
                      </h3>
                      <p className={`mt-2 text-3xl font-black transition-colors duration-300 ${((pkg as any).featured || (pkg as any).isFeatured) ? "text-white" : "text-[#1a658d] dark:text-[#1a658d] group-hover:text-white"}`}>
                        {packagePrice}
                      </p>
                    </div>

                    {/* Features List */}
                    <ul className="mb-8 space-y-3">
                      {packageFeatures.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                            ((pkg as any).featured || (pkg as any).isFeatured) ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800 group-hover:bg-white/20"
                          }`}>
                            <Check className={`h-3 w-3 transition-colors duration-300 ${((pkg as any).featured || (pkg as any).isFeatured) ? "text-white" : "text-[#1a658d] dark:text-[#1a658d] group-hover:text-white"}`} strokeWidth={3} />
                          </div>
                          <span className={`text-sm transition-colors duration-300 ${((pkg as any).featured || (pkg as any).isFeatured) ? "text-white/90" : "text-slate-600 dark:text-slate-300 group-hover:text-white/90"}`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <button
                      className={`group/btn relative w-full overflow-hidden rounded-full border px-6 py-3 text-sm font-semibold transition-all duration-300 
                        ${((pkg as any).featured || (pkg as any).isFeatured)
                          ? "border-white bg-white text-[#b9292f] shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5"
                          : "border-slate-200 bg-transparent text-slate-900 group-hover:border-white group-hover:bg-white group-hover:text-[#b9292f] group-hover:shadow-lg dark:border-slate-700 dark:text-white"
                        }`}
                    >
                      <span className="relative z-10">{copy.cta}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          }) : (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[500px] w-full rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
