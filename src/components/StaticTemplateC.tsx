"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import clsx from "clsx";
import { FlaskConical, Microscope, ShieldCheck } from "lucide-react";
import { WorkflowData } from "@/types/api";

type Locale = "en" | "ar";
type Direction = "rtl" | "ltr";

type GalleryImage = {
  src: string;
  alt: string;
};

type HighlightItem = {
  title: string;
  desc: string;
  icon: "flask" | "shield" | "scope";
};

type RichTextSection = {
  type: "richtext";
  id?: string;
  heading?: string;
  body: string;
};

type BulletsSection = {
  type: "bullets";
  id?: string;
  heading?: string;
  items: string[];
};

type HighlightsSection = {
  type: "highlights";
  id?: string;
  heading?: string;
  items: HighlightItem[];
};

type GallerySection = {
  type: "gallery";
  id?: string;
  heading?: string;
  images: GalleryImage[];
};

type CtaSection = {
  type: "cta";
  heading: string;
  desc?: string;
  button: {
    label: string;
    href: string;
  };
};

type StaticPageSection =
  | RichTextSection
  | BulletsSection
  | HighlightsSection
  | GallerySection
  | CtaSection;

type StaticTemplateContent = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  cover?: {
    src: string;
    alt: string;
  };
  sections: StaticPageSection[];
};

type StaticTemplateProps = {
  content?: StaticTemplateContent;
  dir?: Direction;
  locale?: Locale;
  workflowData?: WorkflowData;
};

const contentByLocale: Record<Locale, StaticTemplateContent> = {
  en: {
    eyebrow: "LAB WORKFLOW",
    title: "From sample to insight, verified at every step.",
    subtitle:
      "Traceable chain-of-custody, calibrated analyzers, and senior review keep results fast and reliable.",
    cover: {
      src: "/lap3.jpg",
      alt: "Automated lab analyzers",
    },
    sections: [
      {
        type: "highlights",
        id: "capabilities",
        heading: "Core capability clusters",
        items: [
          {
            title: "Rapid panels",
            desc: "Same-day CBC, chemistry, and infection screens with controlled turnaround.",
            icon: "flask",
          },
          {
            title: "Specialty immunology",
            desc: "Autoimmune and serology panels with physician-grade interpretation.",
            icon: "shield",
          },
          {
            title: "Molecular diagnostics",
            desc: "PCR workflows with contamination controls and strict validation.",
            icon: "scope",
          },
        ],
      },
      {
        type: "bullets",
        id: "quality",
        heading: "Quality controls",
        items: [
          "Barcode chain-of-custody on every specimen.",
          "Two-level QC and external proficiency testing.",
          "Delta checks and clinical flags before release.",
          "Signed reports with reference ranges and notes.",
        ],
      },
      {
        type: "gallery",
        id: "inside",
        heading: "Inside the lab",
        images: [
          {
            src: "/lap1.jpg",
            alt: "Technician preparing samples",
          },
          {
            src: "/lap2.jpg",
            alt: "High-throughput analyzer",
          },
          {
            src: "/lap4.jpg",
            alt: "Quality control instrumentation",
          },
        ],
      },
      {
        type: "cta",
        heading: "Need results fast?",
        desc: "Schedule a visit or request a home collection today.",
        button: {
          label: "Book a test",
          href: "#book",
        },
      },
    ],
  },
  ar: {
    eyebrow: "مسار العمل",
    title: "من العينة إلى النتيجة، توثيق كامل في كل خطوة.",
    subtitle:
      "سلسلة تتبع دقيقة، أجهزة معايرة، ومراجعة كبار المختصين لنتائج سريعة وموثوقة.",
    cover: {
      src: "/lap3.jpg",
      alt: "أجهزة تحليل مخبرية آلية",
    },
    sections: [
      {
        type: "highlights",
        id: "capabilities",
        heading: "مجالاتنا الأساسية",
        items: [
          {
            title: "فحوصات سريعة",
            desc: "CBC والكيمياء وفحوصات العدوى بزمن إنجاز مضبوط.",
            icon: "flask",
          },
          {
            title: "مناعة تخصصية",
            desc: "لوحات مناعية وسيرولوجيا مع تفسير طبي معتمد.",
            icon: "shield",
          },
          {
            title: "تشخيص جزيئي",
            desc: "إجراءات PCR مع ضوابط تلوث وتحقيق صارم.",
            icon: "scope",
          },
        ],
      },
      {
        type: "bullets",
        id: "quality",
        heading: "ضبط الجودة",
        items: [
          "باركود وتتبع لكل عينة.",
          "ضبط جودة بمستويين واختبارات كفاءة خارجية.",
          "فحص دلتا وتنبيهات سريرية قبل الإصدار.",
          "تقارير موقعة مع القيم المرجعية والملاحظات.",
        ],
      },
      {
        type: "gallery",
        id: "inside",
        heading: "داخل المختبر",
        images: [
          {
            src: "/lap1.jpg",
            alt: "فني يحضر العينات",
          },
          {
            src: "/lap2.jpg",
            alt: "جهاز تحليل عالي الإنتاجية",
          },
          {
            src: "/lap4.jpg",
            alt: "أجهزة ضبط الجودة",
          },
        ],
      },
      {
        type: "cta",
        heading: "تحتاج نتيجة بسرعة؟",
        desc: "احجز زيارة أو اطلب سحب منزلي اليوم.",
        button: {
          label: "سحب منزلي",
          href: "#book",
        },
      },
    ],
  },
};

const iconMap = {
  flask: FlaskConical,
  shield: ShieldCheck,
  scope: Microscope,
};

const getSectionId = (section: StaticPageSection, index: number) => {
  if ("id" in section && section.id) return section.id;
  return `section-${index + 1}`;
};

const withLocale = (locale: Locale, href: string) => {
  if (!href) return href;
  if (href.startsWith("#") || href.startsWith("http")) return href;
  const normalized = href.startsWith("/") ? href : `/${href}`;
  const prefix = `/${locale}`;
  if (normalized === prefix || normalized.startsWith(`${prefix}/`)) {
    return normalized;
  }
  return `${prefix}${normalized}`;
};

/* ---------------------------
   Active Background Component
---------------------------- */
function ActiveBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Medical Tech Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.35] dark:opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgb(148 163 184 / 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(148 163 184 / 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      
      {/* Floating Element 1: Hexagon */}
      <motion.div
        className="absolute top-20 left-[15%] h-32 w-32"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full opacity-10 dark:opacity-5">
          <polygon
            points="50 1 95 25 95 75 50 99 5 75 5 25"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-teal-500"
          />
          <polygon
            points="50 15 80 32 80 68 50 85 20 68 20 32"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-blue-500"
          />
        </svg>
      </motion.div>

      {/* Floating Element 2: DNA Strand */}
      <motion.div
        className="absolute top-40 right-[20%] h-40 w-24"
        animate={{
          y: [0, 15, 0],
          rotate: [0, -3, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg viewBox="0 0 60 100" className="h-full w-full opacity-10 dark:opacity-5">
          {/* DNA helix representation */}
          <path
            d="M10,10 Q30,25 10,40 T10,70 T10,100"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-teal-500"
          />
          <path
            d="M50,10 Q30,25 50,40 T50,70 T50,100"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-blue-500"
          />
          {/* Cross bars */}
          <line x1="10" y1="20" x2="50" y2="20" stroke="currentColor" strokeWidth="1" className="text-slate-400" />
          <line x1="10" y1="50" x2="50" y2="50" stroke="currentColor" strokeWidth="1" className="text-slate-400" />
          <line x1="10" y1="80" x2="50" y2="80" stroke="currentColor" strokeWidth="1" className="text-slate-400" />
        </svg>
      </motion.div>

      {/* Floating Element 3: Blur Circle */}
      <motion.div
        className="absolute bottom-32 left-[25%] h-48 w-48 rounded-full bg-gradient-to-br from-teal-500/10 to-blue-500/10 blur-3xl"
        animate={{
          y: [0, -25, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating Element 4: Molecular Structure */}
      <motion.div
        className="absolute bottom-20 right-[10%] h-36 w-36"
        animate={{
          y: [0, 20, 0],
          rotate: [0, 10, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full opacity-15 dark:opacity-8">
          {/* Central node */}
          <circle cx="50" cy="50" r="6" fill="currentColor" className="text-teal-500" />
          {/* Peripheral nodes */}
          <circle cx="30" cy="30" r="4" fill="currentColor" className="text-blue-400" />
          <circle cx="70" cy="30" r="4" fill="currentColor" className="text-blue-400" />
          <circle cx="70" cy="70" r="4" fill="currentColor" className="text-blue-400" />
          <circle cx="30" cy="70" r="4" fill="currentColor" className="text-blue-400" />
          {/* Bonds */}
          <line x1="50" y1="50" x2="30" y2="30" stroke="currentColor" strokeWidth="1" className="text-slate-400" />
          <line x1="50" y1="50" x2="70" y2="30" stroke="currentColor" strokeWidth="1" className="text-slate-400" />
          <line x1="50" y1="50" x2="70" y2="70" stroke="currentColor" strokeWidth="1" className="text-slate-400" />
          <line x1="50" y1="50" x2="30" y2="70" stroke="currentColor" strokeWidth="1" className="text-slate-400" />
        </svg>
      </motion.div>

      {/* Ambient blobs */}
      <div className="absolute -top-32 start-1/4 h-80 w-80 rounded-full bg-[#53a1e6]/12 blur-[160px] dark:bg-[#53a1e6]/18" />
      <div className="absolute top-32 end-10 h-96 w-96 rounded-full bg-[#a8252b]/12 blur-[180px] dark:bg-[#a8252b]/18" />
      <div className="absolute -bottom-40 start-10 h-96 w-96 rounded-full bg-slate-200/60 blur-[200px] dark:bg-white/5" />
    </div>
  );
}

/* ---------------------------
   Lightbox via Portal
---------------------------- */
function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}

function Lightbox({
  open,
  onClose,
  src,
  alt,
  indexLabel,
  closeLabel,
}: {
  open: boolean;
  onClose: () => void;
  src: string;
  alt: string;
  indexLabel?: string;
  closeLabel: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useLockBodyScroll(open);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0, y: 10 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-[1100px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 text-slate-900 shadow-2xl dark:border-white/10 dark:bg-slate-950/60 dark:text-white">
              <div className="relative h-[min(75vh,760px)] w-full">
                <Image
                  src={src}
                  alt={alt}
                  fill
                  sizes="(min-width: 1024px) 1100px, 92vw"
                  className="object-contain"
                  priority
                />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(56,189,248,0.18),transparent_55%)]" />
              </div>

              <div className="flex items-center justify-between px-5 py-4 text-xs text-slate-600 dark:text-white/70">
                <span>{indexLabel ?? ""}</span>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-slate-200/70 bg-white/80 px-3 py-1.5 text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/15"
                >
                  {closeLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/* ---------------------------
   Gallery (compact thumbs)
---------------------------- */
function FieldGallery({
  images,
  dir,
  locale,
}: {
  images: GalleryImage[];
  dir: Direction;
  locale: Locale;
}) {
  const safe = useMemo(() => (images ?? []).filter((x) => x?.src), [images]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!safe.length) return null;

  const open = openIndex !== null && !!safe[openIndex];
  const countLabel = locale === "ar" ? "صور" : "photos";
  const hintLabel = locale === "ar" ? "اضغط للتكبير" : "Tap to zoom";

  return (
    <>
      <div className="mt-6">
        <div
          className={clsx(
            "flex gap-3 overflow-x-auto pb-2",
            "snap-x snap-mandatory",
            "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            dir === "rtl" ? "flex-row-reverse" : "flex-row"
          )}
        >
          {safe.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => setOpenIndex(i)}
              className={clsx(
                "group relative flex-none snap-start overflow-hidden",
                "h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32",
                "rounded-2xl border border-slate-200/80 bg-white/90 shadow-soft backdrop-blur",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60",
                "dark:border-white/10 dark:bg-white/5"
              )}
              aria-label={img.alt || `image-${i + 1}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(min-width: 768px) 128px, 96px"
                className="object-cover transition duration-300 group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent opacity-90 dark:from-slate-950/70" />
              <div className="absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
                <div className="absolute -inset-16 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.18),transparent_55%)]" />
              </div>
            </button>
          ))}
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-white/55">
          <span>
            {safe.length} {countLabel}
          </span>
          <span className="opacity-80">{hintLabel}</span>
        </div>
      </div>

      {open && safe[openIndex!] && (
        <Lightbox
          open={open}
          onClose={() => setOpenIndex(null)}
          src={safe[openIndex!].src}
          alt={safe[openIndex!].alt}
          indexLabel={`${openIndex! + 1}/${safe.length}`}
          closeLabel={locale === "ar" ? "إغلاق" : "Close"}
        />
      )}
    </>
  );
}

/* ---------------------------
   Highlights
---------------------------- */
function ProgramsGrid({
  items,
  locale,
}: {
  items: HighlightItem[];
  locale: Locale;
}) {
  const label = locale === "ar" ? "برنامج" : "Program";
  const keyLabel = locale === "ar" ? "أساسي" : "Key";
  const metricLabel = locale === "ar" ? "أثر قابل للقياس" : "Measurable impact";
  const actionLabel = locale === "ar" ? "استكشف" : "Explore";

  return (
    <div className="mt-6 space-y-4">
      {items.map((item, idx) => {
        const Icon = iconMap[item.icon] ?? FlaskConical;
        return (
          <div
            key={item.title}
            className={clsx(
              "group relative w-full",
              "rounded-3xl border border-slate-200/80 bg-white/90 p-6",
              "shadow-soft backdrop-blur-md transition",
              "hover:-translate-y-0.5",
              "dark:border-white/10 dark:bg-white/5"
            )}
          >
            <div className="pointer-events-none absolute -top-24 start-1/3 h-56 w-56 rounded-full bg-brand-primary/10 blur-3xl opacity-0 transition duration-500 group-hover:opacity-100" />

            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/20 dark:bg-white/5 dark:text-white dark:ring-white/10">
                <Icon className="h-6 w-6" />
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.26em] text-brand-primary/80">
                      {label} {String(idx + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                  </div>

                  <span className="rounded-full bg-brand-accent/10 px-3 py-1 text-[11px] text-brand-accent ring-1 ring-brand-accent/15 dark:bg-white/10 dark:text-white/70 dark:ring-white/10">
                    {keyLabel}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-white/75">
                  {item.desc}
                </p>

                <div className="mt-4 flex items-center gap-3 text-xs text-slate-500 dark:text-white/55">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-brand-accent/70" />
                    {metricLabel}
                  </span>
                  <span className="h-px flex-1 bg-slate-200/80 dark:bg-white/10" />
                  <span className="opacity-80">{actionLabel}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------------------
   Main Template
---------------------------- */
export function StaticTemplateC({
  content: contentOverride,
  dir: dirOverride,
  locale: localeOverride,
  workflowData,
}: StaticTemplateProps = {}) {
  const intlLocale = useLocale();
  const resolvedLocale = (localeOverride ?? intlLocale) as Locale;
  const locale: Locale = resolvedLocale === "ar" ? "ar" : "en";
  const dir = dirOverride ?? (locale === "ar" ? "rtl" : "ltr");
  
  // Transform API workflowData to the expected static template format if it exists
  const apiContent: StaticTemplateContent | null = workflowData ? {
    eyebrow: locale === "ar" ? workflowData.badge_ar : workflowData.badge_en,
    title: locale === "ar" ? workflowData.title_ar : workflowData.title_en,
    subtitle: locale === "ar" ? workflowData.subtitle_ar : workflowData.subtitle_en,
    cover: workflowData.coverImage ? {
      src: workflowData.coverImage,
      alt: locale === "ar" ? "غلاف" : "Cover",
    } : undefined,
    sections: [
      {
        type: "highlights",
        id: "capabilities",
        heading: locale === "ar" ? "تخصصاتنا" : "Key Areas",
        items: workflowData.highlights?.map((h) => ({
          title: locale === "ar" ? h.title_ar : h.title_en,
          desc: locale === "ar" ? h.description_ar : h.description_en,
          icon: (h.icon as any) || "flask",
        })) || [],
      },
      {
        type: "bullets",
        id: "quality",
        heading: locale === "ar" ? "معايير الجودة" : "Quality Standards",
        items: locale === "ar" ? workflowData.qualityBullets_ar : workflowData.qualityBullets_en,
      },
      {
        type: "gallery",
        id: "inside",
        heading: locale === "ar" ? "من داخل المختبر" : "Inside the Lab",
        images: workflowData.galleryImages?.map((img) => ({
          src: img.src,
          alt: locale === "ar" ? img.alt_ar : img.alt_en,
        })) || [],
      },
      {
        type: "cta",
        heading: locale === "ar" ? workflowData.cta.title_ar : workflowData.cta.title_en,
        desc: locale === "ar" ? workflowData.cta.description_ar : workflowData.cta.description_en,
        button: {
          label: locale === "ar" ? workflowData.cta.buttonLabel_ar : workflowData.cta.buttonLabel_en,
          href: workflowData.cta.buttonUrl || "/book",
        },
      }
    ]
  } : null;

  const content =
    contentOverride ?? apiContent ?? contentByLocale[locale] ?? contentByLocale.en;

  const ctaSection = content.sections.find(
    (section) => section.type === "cta"
  ) as CtaSection | undefined;

  const chapters = content.sections.filter(
    (section) => section.type !== "cta"
  ) as StaticPageSection[];

  const chapterLabel = locale === "ar" ? "الخطوة" : "Step";

  // Timeline ref for scroll animation
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start center", "end center"],
  });

  // Transform scroll progress to height percentage
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const linePositionClass =
    dir === "rtl"
      ? "end-6 lg:end-1/2 lg:translate-x-1/2"
      : "start-6 lg:start-1/2 lg:-translate-x-1/2";

  const dotPositionClass =
    dir === "rtl"
      ? "end-6 lg:end-1/2 lg:translate-x-1/2"
      : "start-6 lg:start-1/2 lg:-translate-x-1/2";

  const renderChapterContent = (section: StaticPageSection) => {
    if (section.type === "richtext") {
      return (
        <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-white/70">
          {section.body}
        </p>
      );
    }

    if (section.type === "bullets") {
      return (
        <ul className="mt-6 space-y-4 text-sm text-slate-600 dark:text-white/75">
          {section.items.map((item, itemIndex) => (
            <li key={item} className="relative ps-10">
              <span className="absolute start-0 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-brand-accent/10">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-accent" />
              </span>
              <span>{item}</span>
              {itemIndex < section.items.length - 1 && (
                <span
                  className="absolute start-3 top-7 h-full w-px bg-brand-accent/20"
                  aria-hidden="true"
                />
              )}
            </li>
          ))}
        </ul>
      );
    }

    if (section.type === "highlights") {
      return <ProgramsGrid items={section.items} locale={locale} />;
    }

    if (section.type === "gallery") {
      return <FieldGallery images={section.images} dir={dir} locale={locale} />;
    }

    return null;
  };

  return (
    <section
      dir={dir}
      className="relative overflow-hidden bg-slate-50 py-24 text-slate-900 dark:bg-[#020617] dark:text-white"
      aria-label={content.title}
    >
      {/* Active Background with Grid and Floating Elements */}
      <ActiveBackground />

      <div className="relative mx-auto max-w-6xl px-6">
        <motion.header
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, amount: 0.6 }}
          className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
        >
          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/5 px-4 py-1.5 dark:border-white/10 dark:bg-white/5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
              <span className="text-xs font-semibold tracking-widest text-brand-primary dark:text-brand-primary/80 uppercase flex justify-center w-full">
                {content.eyebrow || <div className="h-3 w-20 rounded bg-slate-300 dark:bg-slate-700 animate-pulse" />}
              </span>
            </div>
            <h2 className="text-4xl font-black leading-tight text-slate-900 dark:text-white sm:text-5xl flex justify-center w-full">
              {content.title || (
                <div className="flex flex-col gap-3 mt-2 w-full">
                  <div className="h-12 w-full rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse" />
                  <div className="h-12 w-3/4 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse" />
                </div>
              )}
            </h2>
            <div className="text-base text-slate-600 dark:text-white/70 w-full flex justify-center">
              {(content.subtitle === undefined) ? null : content.subtitle || (
                <div className="flex flex-col gap-2 mt-2 w-full">
                  <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                  <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                </div>
              )}
            </div>
          </div>

          {(content.cover && content.cover.src) ? (
            <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white/80 shadow-soft backdrop-blur-md dark:border-white/10 dark:bg-white/5">
              <div className="relative aspect-[16/10]">
                <Image
                  src={content.cover.src}
                  alt={content.cover.alt}
                  fill
                  sizes="(min-width: 1024px) 900px, 100vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/10 to-transparent dark:from-slate-950/80 dark:via-slate-950/20 dark:to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(83,161,230,0.25),transparent_55%)] opacity-70" />
              </div>
            </div>
          ) : (
            <div className="relative w-full aspect-[16/10] overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-slate-200 shadow-soft backdrop-blur-md dark:border-white/10 dark:bg-slate-800 animate-pulse" />
          )}
        </motion.header>

        <div ref={timelineRef} className="relative mt-16">
          {/* Enhanced Glowing Gradient Timeline */}
          <div
            className={clsx(
              "pointer-events-none absolute inset-y-0 w-[3px] overflow-hidden",
              linePositionClass
            )}
            aria-hidden="true"
          >
            {/* Base gradient line */}
            <div className="absolute inset-0 bg-gradient-to-b from-teal-500 via-blue-500 to-teal-600 opacity-60" />
            
            {/* Animated growing line */}
            <motion.div
              className="absolute inset-x-0 top-0 bg-gradient-to-b from-teal-400 via-blue-400 to-teal-500"
              style={{ height: lineHeight }}
            />
            
            {/* Glow effect */}
            <div 
              className="absolute inset-0 bg-gradient-to-b from-teal-500 via-blue-500 to-teal-600 blur-sm"
              style={{
                boxShadow: '0 0 20px rgba(20, 184, 166, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)',
              }}
            />
          </div>

          <div className="relative space-y-12">
            {chapters.map((section, index) => {
              const sectionId = getSectionId(section, index);
              const heading =
                "heading" in section ? section.heading : undefined;

              const alignToEnd =
                dir === "rtl" ? index % 2 === 0 : index % 2 === 1;

              const columnClass = alignToEnd
                ? "lg:col-start-3 lg:justify-self-end"
                : "lg:col-start-1 lg:justify-self-start";

              return (
                <motion.article
                  key={sectionId}
                  id={sectionId}
                  className="relative scroll-mt-28"
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  viewport={{ once: false, amount: 0.35 }}
                >
                  <span
                    className={clsx(
                      "absolute top-8 z-10 h-4 w-4 rounded-full border-2 border-white/80 bg-gradient-to-br from-teal-400 to-blue-500 shadow-[0_0_20px_rgba(20,184,166,0.6)]",
                      "dark:border-white/10",
                      dotPositionClass
                    )}
                    aria-hidden="true"
                  />

                  <div className="relative ps-14 lg:grid lg:grid-cols-[minmax(0,1fr)_120px_minmax(0,1fr)] lg:gap-10 lg:ps-0">
                    <div className={columnClass}>
                      <div className="rounded-[2.5rem] border border-slate-200/80 bg-white/70 p-8 shadow-soft backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/5">
                        <p className="text-xs uppercase tracking-[0.3em] text-brand-primary/80">
                          {chapterLabel} {String(index + 1).padStart(2, "0")}
                        </p>

                        {heading && (
                          <h3 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
                            {heading}
                          </h3>
                        )}

                        {renderChapterContent(section)}
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>

        {ctaSection && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: false, amount: 0.4 }}
            className="mt-20"
          >
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-brand-primary via-[#2a6f96] to-brand-accent px-10 py-12 text-white shadow-brand">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_55%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(255,255,255,0.25),_transparent_60%)]" />
              <div className="relative space-y-4">
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  {ctaSection.heading}
                </h2>
                {ctaSection.desc && (
                  <p className="max-w-2xl text-sm text-white/85 sm:text-base">
                    {ctaSection.desc}
                  </p>
                )}
                <Link
                  href={withLocale(locale, ctaSection.button.href)}
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-primary shadow-soft transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
                >
                  {ctaSection.button.label}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
