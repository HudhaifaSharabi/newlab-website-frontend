"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Upload, BookOpen, MapPin, MessageCircle } from "lucide-react";
import AlternativeNavbar from "./nav/AlternativeNavbar";
import { HeroData, AboutData } from "@/types/api";
import r2Loader from '@/utils/r2Loader';
gsap.registerPlugin(ScrollTrigger);

/* =========================
   DATA
========================= */

type Language = "en" | "ar";

const content = {
  en: {
    nav: {
      badge: "NEW LAB SPECIALIZED DIAGNOSTICS",
      cta: "Book a test",
      items: ["Services", "Quality", "Team", "Contact"],
    },
    hero: {
      kicker: "SYSTEM-DRIVEN DIAGNOSTICS FOR CLINICAL CONFIDENCE",
      title: "Precision diagnostics for",
      accent: "smarter decisions.",
      body: "Evidence-led testing, calibrated workflows, and specialist review deliver results you can trust - fast, clear, and ready for care decisions.",
      ctaPrimary: "Book a test",
      ctaSecondary: "View capability deck",
      status: ["Clinical Context: Linked", "Reports: Signed", "QC: Verified"],
      imageAlt: "Lab technician at diagnostic workstation",
    },
    quickActions: [
      { icon: "upload", label: "Upload Prescription" },
      { icon: "guide", label: "Test Guide" },
      { icon: "location", label: "Locations" },
      { icon: "whatsapp", label: "WhatsApp" },
    ],
    about: {
      label: "ABOUT",
      heading: "A diagnostic partner built for certainty.",
      body: "From sample intake to validated reporting, every step is logged, controlled, and reviewed to protect accuracy, turnaround, and clinical trust.",
      cards: [
        {
          tag: "WHO WE ARE",
          title: "Specialists in advanced laboratory medicine.",
          body: "Board-certified scientists and clinicians translate complex biomarkers into clear, actionable insights for patients and physicians.",
          image: "/lap7.webp",
        },
        {
          tag: "QUALITY STANDARD",
          title: "ISO-aligned quality control, every run.",
          body: "Multi-level controls, external proficiency testing, and strict calibration keep results consistent and reproducible.",
          image: "/lap6.jpg",
        },
        {
          tag: "WORKFLOW",
          title: "Traceable workflow from collection to report.",
          body: "Barcode chain-of-custody, automated analyzers, and senior review protect accuracy and turnaround.",
          image: "/lap3.jpg",
        },
        {
          tag: "RESPONSIBILITY",
          title: "Responsible care with patient-first privacy.",
          body: "Secure delivery, clear explanations, and physician-ready reports keep sensitive data protected.",
          image: "/lap5.jpg",
        },
      ],
    },
    ui: {
      languageSwitcher: "Language switcher",
      themeSwitcher: "Theme switcher",
      light: "Light",
      dark: "Dark",
    },
  },
  ar: {
    nav: {
      badge: "مختبر نيو لاب التخصصي للتشخيص",
      cta: "سحب منزلي",
      items: ["الخدمات", "الجودة", "الفريق", "تواصل"],
    },
    hero: {
      kicker: "تشخيصات دقيقة مدفوعة بالنظام لثقة سريرية",
      title: "تشخيصات دقيقة من أجل",
      accent: "قرارات أذكى.",
      body: "اختبارات مبنية على الدليل وسير عمل معاير ومراجعة متخصصين لتقديم نتائج موثوقة بسرعة ووضوح وجاهزة لقرارات الرعاية.",
      ctaPrimary: "سحب منزلي",
      ctaSecondary: "عرض دليل القدرات",
      status: ["السياق السريري: مرتبط", "التقارير: موقعة", "ضبط الجودة: متحقق"],
      imageAlt: "فني مختبر في محطة التشخيص",
    },
    quickActions: [
      { icon: "upload", label: "رفع وصفة طبية" },
      { icon: "guide", label: "دليل الفحوصات" },
      { icon: "location", label: "المواقع" },
      { icon: "whatsapp", label: "واتساب" },
    ],
    about: {
      label: "من نحن",
      heading: "شريك تشخيصي يمنحك اليقين.",
      body: "من استقبال العينة إلى التقرير المعتمد، كل خطوة موثقة ومضبوطة وتراجع لحماية الدقة وزمن الإنجاز والثقة السريرية.",
      cards: [
        {
          tag: "من نحن",
          title: "مختصون في طب المختبرات المتقدم.",
          body: "علماء وأطباء معتمدون يحولون المؤشرات المعقدة إلى معلومات واضحة وقابلة للتطبيق للمرضى والأطباء.",
          image: "/lap7.webp",
        },
        {
          tag: "معايير الجودة",
          title: "ضبط جودة متوافق مع ISO في كل تشغيل.",
          body: "مستويات متعددة من الضبط واختبارات كفاءة خارجية ومعايرة صارمة لضمان نتائج متسقة وقابلة للتكرار.",
          image: "/lap6.jpg",
        },
        {
          tag: "سير العمل",
          title: "سير عمل قابل للتتبع من السحب حتى التقرير.",
          body: "سلسلة حيازة بالباركود وأجهزة تحليل آلية ومراجعة كبار المختصين لحماية الدقة وزمن الإنجاز.",
          image: "/lap3.jpg",
        },
        {
          tag: "المسؤولية",
          title: "رعاية مسؤولة بخصوصية المريض أولا.",
          body: "تسليم آمن وشروحات واضحة وتقارير جاهزة للطبيب لحماية البيانات الحساسة.",
          image: "/lap5.jpg",
        },
      ],
    },
    ui: {
      languageSwitcher: "مبدل اللغة",
      themeSwitcher: "مبدل المظهر",
      light: "فاتح",
      dark: "داكن",
    },
  },
} as const;
/* =========================
   COMPONENT
========================= */

export default function HeroWithAbout({
  heroData,
  aboutData,
}: {
  heroData?: HeroData;
  aboutData?: AboutData;
}) {
  /* ---------- HERO ---------- */
  const heroRef = useRef<HTMLElement | null>(null);
  const visualOuterRef = useRef<HTMLDivElement | null>(null);
  const visualInnerRef = useRef<HTMLDivElement | null>(null);
  const scanRef = useRef<HTMLDivElement | null>(null);
  const underlineRef = useRef<HTMLSpanElement | null>(null);
  const accentRef = useRef<HTMLSpanElement | null>(null);
  const floatingEl1 = useRef<HTMLDivElement | null>(null);
  const floatingEl2 = useRef<HTMLDivElement | null>(null);
  const floatingEl3 = useRef<HTMLDivElement | null>(null);

  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [imgIndex, setImgIndex] = useState(0);

  const images = useMemo(() => ["/lap1.jpg", "/lap2.jpg", "/lap4.jpg"], []);

  const locale = useLocale() as Language;
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isRTL = locale === "ar";
  
  // Use API data, fallback to empty or skeleton-specific data
  const heroContent = heroData || {
    kicker_en: "", kicker_ar: "",
    title_en: "", title_ar: "",
    accent_en: "", accent_ar: "",
    description_en: "", description_ar: "",
    primaryCta_en: "", primaryCta_ar: "", primaryCtaUrl: "",
    secondaryCta_en: "", secondaryCta_ar: "", secondaryCtaUrl: "",
    statusIndicators_en: [], statusIndicators_ar: [],
    slideshowImages: [],
  };
  
  // Quick Actions can remain as they are generic UI navigation not CMS text usually, but if needed we can empty them.
  const quickActionsContent = content[locale]?.quickActions || content.en.quickActions;
  
  const aboutContent = aboutData || {
    badge_en: "", badge_ar: "",
    title_en: "", title_ar: "",
    description_en: "", description_ar: "",
    cards: [],
  };
  
  const aboutCards = aboutContent.cards || [];
  const activeTheme = mounted && resolvedTheme ? resolvedTheme : "dark";
  const isDark = activeTheme === "dark";

  const localeHrefs = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const buildHref = (nextLocale: Language) => {
      if (segments.length === 0) {
        return `/${nextLocale}`;
      }
      const nextSegments = [...segments];
      nextSegments[0] = nextLocale;
      return `/${nextSegments.join("/")}`;
    };
    return {
      en: buildHref("en"),
      ar: buildHref("ar"),
    };
  }, [pathname]);

  useEffect(() => setMounted(true), []);

  /* ---------- ABOUT ---------- */
  const aboutRef = useRef<HTMLElement | null>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);
  const imageRefs = useRef<HTMLDivElement[]>([]);
  const [failedCardImages, setFailedCardImages] = useState<Record<number, number>>({});
  const fallbackCardImages = ["/lap7.webp", "/lap6.jpg", "/lap3.jpg", "/lap5.jpg"];

  const resolveCardImage = (rawSrc: string | undefined, idx: number) => {
    const failCount = failedCardImages[idx] || 0;
    const fallback = fallbackCardImages[idx % fallbackCardImages.length];
    if (!rawSrc || failCount >= 2) return fallback;
    if (failCount === 1) {
      if (rawSrc.startsWith("/files/") && process.env.NEXT_PUBLIC_API_URL) {
        return `${process.env.NEXT_PUBLIC_API_URL}${rawSrc}`;
      }
      return fallback;
    }
    return rawSrc;
  };

  /* =========================
     IMAGE ROTATION
  ========================= */

  const activeImages = useMemo(() => {
    return heroContent.slideshowImages?.length > 0 ? heroContent.slideshowImages : images;
  }, [heroContent.slideshowImages, images]);

  useEffect(() => {
    if (!activeImages || activeImages.length === 0) return;
    const id = setInterval(
      () => setImgIndex((i) => (i + 1) % activeImages.length),
      5500,
    );
    return () => clearInterval(id);
  }, [activeImages]);

  /* =========================
     GSAP (useGSAP)
  ========================= */

  useGSAP(
    () => {
      /* ---------- HERO HOVER ---------- */
      if (visualOuterRef.current && visualInnerRef.current && scanRef.current) {
        gsap.set(visualInnerRef.current, { scale: 1 });
        gsap.set(scanRef.current, { opacity: 0, yPercent: -40 });

        const enter = () => {
          gsap.to(visualInnerRef.current, { scale: 1.02, duration: 0.4 });
          gsap.fromTo(
            scanRef.current,
            { opacity: 0, yPercent: -40 },
            { opacity: 1, yPercent: 120, duration: 1.2 },
          );
        };

        const leave = () => {
          gsap.to(visualInnerRef.current, { scale: 1, duration: 0.35 });
          gsap.to(scanRef.current, { opacity: 0, duration: 0.2 });
        };

        visualOuterRef.current.addEventListener("mouseenter", enter);
        visualOuterRef.current.addEventListener("mouseleave", leave);
      }

      /* ---------- HERO INTRO ---------- */
      const introTl = gsap.timeline();
      introTl
        .from(".anim-kicker", { opacity: 0, y: 18, duration: 0.6 })
        .from(
          ".anim-headline",
          { opacity: 0, y: 22, stagger: 0.1, duration: 0.6 },
          "-=0.3",
        )
        .from(".anim-body", { opacity: 0, y: 18, duration: 0.6 }, "-=0.2")
        .from(
          ".anim-cta",
          { opacity: 0, y: 16, stagger: 0.1, duration: 0.5 },
          "-=0.2",
        )
        .set(".anim-cta", { clearProps: "all" }); // Clear GSAP inline styles after animation

      gsap.fromTo(
        underlineRef.current,
        { scaleX: 0, transformOrigin: "center" },
        { scaleX: 1, duration: 1.4, ease: "power2.out" },
      );

      /* ---------- RESPONSIVE ANIMATIONS ---------- */
      const mm = gsap.matchMedia();

      /* --- DESKTOP: Hero Pin + About Pin --- */
      mm.add("(min-width: 1024px)", () => {
        // Hero Pinning
        ScrollTrigger.create({
          trigger: heroRef.current,
          start: "top top",
          endTrigger: aboutRef.current,
          end: "top top",
          pin: true,
          scrub: true,
          pinSpacing: false,
        });

        // About Pinning (Desktop)
        setupAboutAnimation();
      });

      /* --- MOBILE: No Hero Pin, About Pin with Offset --- */
      mm.add("(max-width: 1023px)", () => {
        // About Pinning (Mobile)
        setupAboutAnimation("top top");
      });

      function setupAboutAnimation(startPosition = "top top") {
        const validCards = cardRefs.current.slice(0, aboutCards.length).filter(Boolean);
        const validImages = imageRefs.current.slice(0, aboutCards.length).filter(Boolean);
        if (validCards.length === 0) return;

        /* Set initial states — only first card is visible to prevent text ghosting/bleeding */
        validCards.forEach((card, i) => {
          gsap.set(card, {
            y: i === 0 ? 0 : 36,
            scale: i === 0 ? 1 : 0.96,
            opacity: i === 0 ? 1 : 0,
            zIndex: i === 0 ? 20 : 10 - i,
            pointerEvents: i === 0 ? "auto" : "none",
          });
        });

        validImages.forEach((img, i) => {
          gsap.set(img, {
            opacity: i === 0 ? 1 : 0,
            scale: i === 0 ? 1 : 1.05,
            zIndex: i === 0 ? 20 : 10 - i,
          });
        });

        if (aboutCards.length <= 1) return;

        const scrollDistance = Math.max(1, aboutCards.length - 1) * 90;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: aboutRef.current,
            start: startPosition,
            end: `+=${scrollDistance}%`,
            scrub: 0.6,
            pin: true,
          },
        });

        aboutCards.forEach((_, i) => {
          if (i === aboutCards.length - 1) return;
          const currentCard = validCards[i];
          const nextCard = validCards[i + 1];
          const currentImg = validImages[i];
          const nextImg = validImages[i + 1];

          if (currentCard) {
            tl.to(
              currentCard,
              {
                y: -36,
                opacity: 0,
                scale: 0.97,
                pointerEvents: "none",
                duration: 0.45,
                ease: "power2.inOut",
              },
              i,
            );
          }

          if (nextCard) {
            tl.to(
              nextCard,
              {
                y: 0,
                opacity: 1,
                scale: 1,
                zIndex: 20 + i + 1,
                pointerEvents: "auto",
                duration: 0.5,
                ease: "power2.out",
              },
              i + 0.35,
            );
          }

          if (currentImg) {
            tl.to(
              currentImg,
              { opacity: 0, scale: 0.98, duration: 0.5, ease: "power2.inOut" },
              i + 0.1,
            );
          }

          if (nextImg) {
            tl.to(
              nextImg,
              {
                opacity: 1,
                scale: 1,
                zIndex: 20 + i + 1,
                duration: 0.55,
                ease: "power2.out",
              },
              i + 0.2,
            );
          }
        });
      }
    },
    { scope: heroRef },
  );

  /* =========================
     REFRESH FIX (CRITICAL)
  ========================= */

  useEffect(() => {
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  /* =========================
     HELPERS
  ========================= */

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setMouse({
      x: (e.clientX - r.left) / r.width,
      y: (e.clientY - r.top) / r.height,
    });
  };

  const parallax = (v = 10) =>
    `translate3d(${(mouse.x - 0.5) * v}px, ${(mouse.y - 0.5) * v}px, 0)`;

  const spotlightStyle = {
    background: isDark
      ? `radial-gradient(
        520px at ${mouse.x * 100}% ${mouse.y * 100}%,
        rgba(168,37,43,0.22),
        transparent 65%
      )`
      : `radial-gradient(
        520px at ${mouse.x * 100}% ${mouse.y * 100}%,
        rgba(83,161,230,0.18),
        transparent 60%
      )`,
  };

  /* =========================
     JSX
  ========================= */

  return (
    <>
      {/* Keyframe animations for pulse shadow */}
      <style jsx global>{`
        @keyframes pulse-shadow {
          0%,
          100% {
            box-shadow: 0 10px 30px rgba(20, 184, 166, 0.3);
          }
          50% {
            box-shadow:
              0 15px 40px rgba(20, 184, 166, 0.5),
              0 0 0 8px rgba(20, 184, 166, 0.1);
          }
        }
        .animate-pulse-shadow {
          animation: pulse-shadow 2s ease-in-out infinite;
        }
      `}</style>

      <AlternativeNavbar />

      {/* ================= HERO ================= */}
      <section
        ref={heroRef}
        dir={isRTL ? "rtl" : "ltr"}
        onMouseMove={onMouseMove}
        className="relative isolate min-h-[100svh] w-full overflow-hidden bg-white text-slate-900 dark:bg-[#0f172a] dark:text-white"
        style={
          {
            // allow CSS vars usage
          } as React.CSSProperties
        }
      >
        {/* Soft Mesh Gradients */}
        <div className="pointer-events-none absolute inset-0 ">
          {/* Light mode: subtle teal and electric blue radial gradients */}
          <div className="absolute left-[10%] top-[15%] h-[500px] w-[500px] rounded-full bg-gradient-radial from-[#14b8a6]/[0.08] to-transparent blur-[100px]" />
          <div className="absolute right-[15%] top-[25%] h-[450px] w-[450px] rounded-full bg-gradient-radial from-[#3b82f6]/[0.06] to-transparent blur-[90px]" />
          <div className="absolute left-[40%] bottom-[20%] h-[400px] w-[400px] rounded-full bg-gradient-radial from-[#14b8a6]/[0.05] to-transparent blur-[80px]" />

          {/* Dark mode: ambient mesh gradients in corners */}
          <div className="absolute left-[-5%] top-[-5%] h-[600px] w-[600px] rounded-full bg-gradient-radial from-[#14b8a6]/[0.15] to-transparent blur-[120px] opacity-0 dark:opacity-100" />
          <div className="absolute right-[-8%] bottom-[-5%] h-[650px] w-[650px] rounded-full bg-gradient-radial from-[#3b82f6]/[0.12] to-transparent blur-[130px] opacity-0 dark:opacity-100" />
          <div className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-gradient-radial from-white/[0.03] to-transparent blur-[100px] opacity-0 dark:opacity-100" />
        </div>

        {/* Subtle video background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-10 dark:mix-blend-overlay dark:opacity-20 will-change-transform"
          style={{
            transform: "translate3d(var(--vx, 0px), var(--vy, 0px), 0)",
          }}
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>

        <div className="relative z-20 mx-auto mt-4 grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-12 lg:py-20">
          <div className="lg:col-span-6">
            <span className="anim-kicker inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-[11px] font-semibold tracking-[0.22em] text-slate-600 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1a658d]" />
              {(isRTL ? heroContent.kicker_ar : heroContent.kicker_en) || <div className="h-3 w-24 rounded bg-slate-300 dark:bg-slate-600 animate-pulse" />}
            </span>

            <h1 className="mt-6 text-5xl font-black leading-tight text-slate-900 dark:text-white sm:text-6xl lg:text-7xl">
              {(isRTL ? heroContent.title_ar : heroContent.title_en) ? (
                <div className="anim-headline leading-tight">
                  {(isRTL ? heroContent.title_ar : heroContent.title_en)?.split(" ").slice(0, -1).join(" ")}{" "}
                  <span className="bg-gradient-to-r from-[#1a658d] to-[#b9292f] bg-clip-text text-transparent">
                    {(isRTL ? heroContent.title_ar : heroContent.title_en)?.split(" ").slice(-1)}
                  </span>
                  {" "}
                  <span className="relative inline-block bg-gradient-to-r from-[#1a658d] via-[#b9292f] to-[#1a658d] bg-clip-text text-transparent">
                    {isRTL ? heroContent.accent_ar : heroContent.accent_en}
                    <span
                      ref={underlineRef}
                      className="absolute -bottom-1 left-0 h-[3px] w-full bg-gradient-to-r from-[#1a658d] to-[#b9292f]"
                    />
                  </span>
                </div>
              ) : (
                <div className="flex flex-col gap-4 mt-2">
                  <div className="h-16 w-3/4 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  <div className="h-16 w-1/2 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
                </div>
              )}
            </h1>

            <div className="anim-body mt-8 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {(isRTL ? heroContent.description_ar : heroContent.description_en) || (
                <div className="flex flex-col gap-3">
                  <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  <div className="h-4 w-4/6 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                </div>
              )}
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
              {/* Primary CTA - Brand Accent (Red) */}
              <Link href={heroContent.primaryCtaUrl || "/book"} passHref>
                <button className="anim-cta group relative overflow-hidden rounded-full bg-gradient-to-r from-[#b9292f] to-[#d33f46] px-10 py-5 text-base font-semibold text-white shadow-[0_8px_16px_rgba(185,41,47,0.35)] transition-all duration-300 hover:shadow-[0_12px_24px_rgba(185,41,47,0.45)] hover:-translate-y-0.5 border-t border-white/20 w-full sm:w-auto">
                  <span className="relative z-10">{isRTL ? heroContent.primaryCta_ar : heroContent.primaryCta_en}</span>
                  {/* Laser Sheen - Hidden Initially, Sweeps on Hover */}
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full rotate-12 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-[400%]" />
                </button>
              </Link>
              {/* Secondary CTA - Brand Primary (Blue) */}
              <Link href={heroContent.secondaryCtaUrl || "/capabilities"} passHref>
                <button className="anim-cta group relative overflow-hidden rounded-full border-2 border-[#1a658d] bg-white/80 px-10 py-5 text-base font-semibold text-black shadow-sm backdrop-blur-xl transition-all duration-300 hover:bg-[#1a658d] hover:text-white hover:shadow-md hover:-translate-y-0.5 dark:border-[#1a658d] dark:bg-white/10 dark:text-white dark:hover:bg-[#1a658d] w-full sm:w-auto">
                  <span className="relative z-10">
                    {isRTL ? heroContent.secondaryCta_ar : heroContent.secondaryCta_en}
                  </span>
                </button>
              </Link>
            </div>

            {/* Clinical Console Bar */}
            <div className="mt-12 grid grid-cols-1 gap-2 rounded-2xl border border-slate-200/80 bg-white/80 p-4 text-sm text-slate-700 backdrop-blur sm:grid-cols-3 dark:border-white/10 dark:bg-white/5 dark:text-white/80">
              {(isRTL ? heroContent.statusIndicators_ar : heroContent.statusIndicators_en).map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-900/5 px-3 py-2 dark:bg-white/5"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/90 shadow-[0_0_18px_rgba(16,185,129,0.45)]" />
                  <span className="font-semibold tracking-wide">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative lg:col-span-6">
            <div
              ref={visualOuterRef}
              className="group relative isolate h-[580px] lg:h-[620px] overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-[0_20px_80px_rgba(20,184,166,0.15)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_100px_rgba(20,184,166,0.25)] dark:border-slate-700/50 dark:bg-slate-800/50 dark:shadow-[0_20px_80px_rgba(20,184,166,0.2)] will-change-transform"
              style={{
                transform: "translate3d(var(--px, 0px), var(--py, 0px), 0)",
              }}
            >
              <div ref={visualInnerRef} className="absolute inset-0">
                {activeImages.map((src: string, i: number) => (
                  <div
                    key={src}
                    className="absolute inset-0 transition-opacity duration-700"
                    style={{
                      opacity: imgIndex === i ? 1 : 0,
                      zIndex: imgIndex === i ? 10 : 0,
                    }}
                  >
                    <Image
                      src={src}
                      alt={isRTL ? "مختبر نيولاب" : "Newlab Diagnostic"}
                      fill
                      priority={i === 0}
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                ))}
              </div>

              {/* Floating Medical Elements (3D) */}
              <div className="pointer-events-none absolute inset-0 z-20">
                {/* DNA Helix shape */}
                <div
                  ref={floatingEl1}
                  className="absolute top-[15%] right-[10%] w-24 h-32 opacity-30 dark:opacity-20"
                  style={{ transform: parallax(15) }}
                >
                  <div className="relative w-full h-full">
                    <div className="absolute top-0 left-1/2 w-3 h-3 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 blur-sm -translate-x-1/2" />
                    <div className="absolute top-[15%] left-[70%] w-2 h-2 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 blur-sm -translate-x-1/2" />
                    <div className="absolute top-[30%] left-[30%] w-2.5 h-2.5 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 blur-sm -translate-x-1/2" />
                    <div className="absolute top-[45%] left-[75%] w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 blur-sm -translate-x-1/2" />
                    <div className="absolute top-[60%] left-[25%] w-2 h-2 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 blur-sm -translate-x-1/2" />
                    <div className="absolute top-[75%] left-[65%] w-2.5 h-2.5 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 blur-sm -translate-x-1/2" />
                    <div className="absolute top-[90%] left-1/2 w-3 h-3 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 blur-sm -translate-x-1/2" />
                  </div>
                </div>

                {/* Molecular structure */}
                <div
                  ref={floatingEl2}
                  className="absolute bottom-[20%] left-[8%] opacity-25 dark:opacity-15"
                  style={{ transform: parallax(20) }}
                >
                  <div className="relative w-20 h-20">
                    <div className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 blur-[2px] -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute top-0 left-1/2 w-3 h-3 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 blur-[2px] -translate-x-1/2" />
                    <div className="absolute bottom-0 left-1/2 w-3 h-3 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 blur-[2px] -translate-x-1/2" />
                    <div className="absolute top-1/2 left-0 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 blur-[2px] -translate-y-1/2" />
                    <div className="absolute top-1/2 right-0 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 blur-[2px] -translate-y-1/2" />
                  </div>
                </div>

                {/* Abstract particles */}
                <div
                  ref={floatingEl3}
                  className="absolute top-[40%] left-[15%] opacity-20 dark:opacity-10"
                  style={{ transform: parallax(12) }}
                >
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 blur-[1px]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 blur-[1px]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 blur-[1px]" />
                  </div>
                </div>
              </div>

              {/* --- Authority overlays --- */}
              <div className="pointer-events-none absolute inset-0">
                {/* Signature grid */}
                <div
                  className="absolute inset-0 opacity-[0.08] dark:opacity-[0.12]"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, rgba(255,255,255,0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.10) 1px, transparent 1px)",
                    backgroundSize: "44px 44px",
                  }}
                />

                {/* Crosshair */}
                <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25 dark:border-white/20" />
                <div className="absolute left-1/2 top-1/2 h-px w-24 -translate-x-1/2 bg-white/25 dark:bg-white/20" />
                <div className="absolute left-1/2 top-1/2 h-24 w-px -translate-y-1/2 bg-white/25 dark:bg-white/20" />

                {/* Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.20)_70%,rgba(0,0,0,0.45)_100%)] opacity-25 dark:opacity-40" />

                {/* Subtle grain */}
                <div
                  className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
                  style={{
                    backgroundImage:
                      "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22/%3E%3C/filter%3E%3Crect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')",
                  }}
                />
              </div>

              {/* Softer sheen */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-1/2 top-0 h-full w-[80%] rotate-[18deg] bg-gradient-to-r from-transparent via-white/18 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>

              <div
                ref={scanRef}
                className="pointer-events-none absolute left-0 top-0 z-10 h-28 w-full bg-gradient-to-b from-transparent via-teal-500/20 to-transparent blur-[14px]"
              />
            </div>
          </div>
        </div>

        {/* Section Separator - Gradient Bridge */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-64 bg-gradient-to-t from-slate-50 via-teal-50/20 to-transparent dark:from-slate-900 dark:via-teal-900/10 dark:to-transparent"
          aria-hidden="true"
        />

        {/* Integrated Glass Dock - Tech-Medical HUD */}
        {/* <div className="absolute bottom-0 left-0 right-0 z-30">
          <div className="mx-auto max-w-7xl px-6 pb-8">
            <div className="mx-auto max-w-5xl rounded-t-2xl border-t border-slate-200/60 bg-white/60 backdrop-blur-md dark:border-slate-700/30 dark:bg-slate-900/40">
              <div className="flex items-center justify-evenly divide-x divide-slate-200/60 dark:divide-slate-700/30">
                {quickActionsContent.map((action, idx) => {
                  const Icon =
                    action.icon === "upload"
                      ? Upload
                      : action.icon === "guide"
                        ? BookOpen
                        : action.icon === "location"
                          ? MapPin
                          : MessageCircle;

                  return (
                    <button
                      key={action.label}
                      className="group flex flex-1 flex-col items-center gap-2 px-4 py-5 transition-all duration-300 hover:bg-slate-900/5 dark:hover:bg-white/5 md:flex-row md:justify-center md:gap-3"
                    >
                      <Icon
                        className="h-5 w-5 text-slate-500 transition-colors duration-300 group-hover:text-[#b9292f] dark:text-slate-400 dark:group-hover:text-[#b9292f]"
                        strokeWidth={1.5}
                      />
                      <span className="text-xs font-medium uppercase tracking-widest text-slate-600 transition-colors duration-300 group-hover:text-slate-900 dark:text-slate-300 dark:group-hover:text-white">
                        {action.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div> */}
      </section>

      {/* ================= ABOUT ================= */}

      {/* Modern Footer */}

      {/* ================= ABOUT ================= */}
      {/* ================= ABOUT ================= */}
      {/* ================= ABOUT / من نحن ================= */}
      <section
        ref={aboutRef}
        dir={isRTL ? "rtl" : "ltr"}
        className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-white pt-20 pb-16 text-slate-900 lg:pt-24 lg:pb-24 dark:bg-[#020617] dark:text-white"
      >
        {/* ===== DEPTH / SIGNATURE BACKGROUND ===== */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          {/* Base */}
          <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white dark:from-[#020617] dark:via-[#060d1f] dark:to-[#020617]" />

          {/* Authority grid */}
          <div
            className="absolute inset-0 opacity-[0.35] dark:opacity-[0.12]"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(15,23,42,0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.10) 1px, transparent 1px)",
              backgroundSize: "52px 52px",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.06] dark:opacity-[0.10]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, rgba(168,37,43,0.16), transparent 55%), radial-gradient(circle at 80% 65%, rgba(26,101,141,0.18), transparent 55%)",
            }}
          />

          {/* Ambient glows */}
          <div className="absolute left-[-12%] top-[8%] h-[520px] w-[520px] rounded-full bg-[#1a658d]/5 blur-[190px] dark:bg-[#1a658d]/10" />
          <div className="absolute right-[-10%] bottom-[10%] h-[520px] w-[520px] rounded-full bg-[#b9292f]/5 blur-[200px] dark:bg-[#b9292f]/10" />

          {/* Center depth */}
          <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-200/70 blur-[240px] dark:bg-white/5" />

          {/* Subtle noise */}
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22/%3E%3C/filter%3E%3Crect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')",
            }}
          />
        </div>

        {/* ===== CONTENT ===== */}
        <div className="relative mx-auto w-full max-w-7xl px-6 lg:px-8">
          {/* ===== Header ===== */}
          <div className="mb-6 lg:mb-8 max-w-3xl">
            <div className="mb-3 flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#1a658d]/25 bg-[#1a658d]/10 px-4 py-1.5 text-xs font-bold tracking-wider text-[#1a658d] backdrop-blur dark:border-sky-400/30 dark:bg-sky-500/10 dark:text-sky-300">
                <span className="h-2 w-2 rounded-full bg-[#b9292f]" />
                {isRTL ? aboutContent.badge_ar : aboutContent.badge_en}
              </span>
              <span className="h-px w-14 bg-gradient-to-r from-[#1a658d]/60 to-transparent dark:from-sky-400/50" />
            </div>

            <h2 className="text-3xl font-black leading-tight sm:text-4xl lg:text-[40px] bg-gradient-to-r from-[#1a658d] via-[#257ca8] to-[#b9292f] dark:from-sky-300 dark:via-white dark:to-[#ef4444] bg-clip-text text-transparent">
              {isRTL ? aboutContent.title_ar : aboutContent.title_en}
            </h2>

            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed dark:text-slate-300/85">
              {isRTL ? aboutContent.description_ar : aboutContent.description_en}
            </p>
          </div>

          {/* ===== Cards + Visual ===== */}
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-8">
            {/* ===== Cards Stack ===== */}
            <div className="relative h-[460px] sm:h-[400px] lg:col-span-6 lg:h-[360px]">
              {aboutCards.map((c, i) => {
                const imgSrc = resolveCardImage(c.image, i);

                return (
                  <div
                    key={c.title_en + i}
                    ref={(el) => {
                      if (el) cardRefs.current[i] = el;
                    }}
                    className="
                      absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[26px]
                      border border-slate-200/90
                      bg-white
                      shadow-[0_14px_40px_rgba(15,23,42,0.08)]
                      hover:shadow-[0_20px_50px_rgba(26,101,141,0.18)]
                      p-6 sm:p-8
                      transition-shadow
                      duration-300
                      dark:border-slate-800
                      dark:bg-[#0f172a]
                      dark:shadow-[0_16px_44px_rgba(0,0,0,0.45)]
                      dark:hover:shadow-[0_20px_54px_rgba(26,101,141,0.25)]
                    "
                  >
                    {/* Top line accent */}
                    <div
                      className={`absolute inset-x-0 top-0 h-[3px] ${
                        isRTL
                          ? "bg-gradient-to-l from-[#b9292f] via-[#1a658d] to-transparent"
                          : "bg-gradient-to-r from-[#b9292f] via-[#1a658d] to-transparent"
                      }`}
                    />

                    <div>
                      {/* Mobile Image */}
                      <div className="relative mb-4 h-40 w-full overflow-hidden rounded-2xl lg:hidden">
                        <Image
                          src={imgSrc}
                          alt={(isRTL ? c.title_ar : c.title_en) || "NewLab"}
                          fill
                          className="object-cover"
                          onError={() =>
                            setFailedCardImages((prev) => ({
                              ...prev,
                              [i]: (prev[i] || 0) + 1,
                            }))
                          }
                        />
                      </div>

                      {/* Tag + Step Counter */}
                      <div className="flex items-center justify-between gap-4">
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#b9292f]/10 px-3 py-1 text-xs font-bold tracking-wide text-[#b9292f] dark:bg-[#b9292f]/15 dark:text-red-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#b9292f] dark:bg-red-400" />
                          {isRTL ? c.tag_ar : c.tag_en}
                        </span>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5">
                            {aboutCards.map((_, dotIdx) => (
                              <span
                                key={dotIdx}
                                className={`h-1.5 rounded-full transition-all ${
                                  dotIdx === i
                                    ? "w-5 bg-[#b9292f]"
                                    : "w-1.5 bg-slate-300 dark:bg-slate-700"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">
                            0{i + 1}/0{aboutCards.length}
                          </span>
                        </div>
                      </div>

                      {/* Divider */}
                      <div
                        className={`my-4 h-px w-16 ${
                          isRTL
                            ? "bg-gradient-to-l from-[#1a658d] to-transparent dark:from-sky-400"
                            : "bg-gradient-to-r from-[#1a658d] to-transparent dark:from-sky-400"
                        }`}
                      />

                      {/* Title */}
                      <h3 className="text-xl sm:text-2xl font-black leading-snug text-slate-900 dark:text-white">
                        {isRTL ? c.title_ar : c.title_en}
                      </h3>

                      {/* Body */}
                      <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed dark:text-slate-300 line-clamp-3">
                        {isRTL ? c.description_ar : c.description_en}
                      </p>
                    </div>

                    {/* Chips (system feel) */}
                    <div className="mt-5 flex flex-wrap gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                      {(isRTL ? c.badges_ar : c.badges_en)?.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-[#1a658d]/20 bg-[#1a658d]/5 px-3.5 py-1 text-xs font-semibold text-[#1a658d] dark:border-sky-400/25 dark:bg-sky-500/10 dark:text-sky-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ===== Image Stack / Console Frame ===== */}
            <div className="relative hidden h-[360px] lg:col-span-6 lg:block">
              {aboutCards.map((c, i) => {
                const imgSrc = resolveCardImage(c.image, i);

                return (
                  <div
                    key={c.image + i}
                    ref={(el) => {
                      if (el) imageRefs.current[i] = el;
                    }}
                    className="absolute inset-0 overflow-hidden rounded-[26px] border border-slate-200/80 bg-slate-900 shadow-[0_16px_44px_rgba(0,0,0,0.3)] dark:border-slate-800"
                  >
                    <Image
                      src={imgSrc}
                      alt={(isRTL ? c.title_ar : c.title_en) || "NewLab"}
                      fill
                      className="object-cover"
                      onError={() =>
                        setFailedCardImages((prev) => ({
                          ...prev,
                          [i]: (prev[i] || 0) + 1,
                        }))
                      }
                    />

                    {/* Console overlays */}
                    <div className="pointer-events-none absolute inset-0">
                      {/* vignette */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                      {/* ring */}
                      <div className="absolute inset-0 ring-1 ring-inset ring-white/15 dark:ring-white/10 rounded-[26px]" />
                      {/* corner ticks */}
                      <div className="absolute left-4 top-4 h-5 w-5 border-l-2 border-t-2 border-white/40 rounded-tl-md" />
                      <div className="absolute right-4 top-4 h-5 w-5 border-r-2 border-t-2 border-white/40 rounded-tr-md" />
                      <div className="absolute left-4 bottom-4 h-5 w-5 border-l-2 border-b-2 border-white/40 rounded-bl-md" />
                      <div className="absolute right-4 bottom-4 h-5 w-5 border-r-2 border-b-2 border-white/40 rounded-br-md" />

                      {/* Caption overlay at bottom of image */}
                      <div className="absolute bottom-5 inset-x-6 flex items-center justify-between text-white">
                        <span className="text-xs font-bold tracking-wider uppercase bg-white/15 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                          {isRTL ? c.tag_ar : c.tag_en}
                        </span>
                        <span className="font-mono text-xs text-white/75">
                          0{i + 1} / 0{aboutCards.length}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
    </>
  );
}
