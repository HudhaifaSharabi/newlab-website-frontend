"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { motion } from "framer-motion";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const navItems = ["الخدمات", "الجودة", "الفريق", "تواصل"];

const heroCopy = {
  eyebrow: "بروتوكولات مخبرية معتمدة",
  headline: "نتائج لا تُناقش. تُعتمد دون تشويش.",
  accent: "تُعتمد",
  body: "تحليل سريري مضبوط، توقيع رقمي موثَّق، وتوافق مع بروتوكولات ISO لتقرير واضح يدعم القرار الطبي.",
  badges: [
    { label: "ISO-ready QC", value: "99.2%" },
    { label: "Signed validation", value: "موثَّق" },
    { label: "Clinical context", value: "متكامل" },
  ],
  ctaPrimary: "سحب منزلي",
  ctaSecondary: "استكشف البروتوكول",
  microTrust: "نتائج واضحة… دون تشويش.",
};

const statusStrip = [
  { label: "QC", value: "Active" },
  { label: "Samples", value: "Tracked" },
  { label: "Reports", value: "Verified" },
];

const visualImages = [
  "/lab-equipment.webp",
  "/lab-equipment-2.webp",
  "/lab-equipment-3.webp",
  "/lab-technician.webp",
  "/lab-technician-2.webp",
  "/lab-technician-3.webp",
];

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Hero({
  className,
  withNavbarPlaceholder,
}: {
  className?: string;
  withNavbarPlaceholder?: boolean;
} = {}) {
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [imageIndex, setImageIndex] = useState(0);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const visualRef = useRef<HTMLDivElement | null>(null);
  const scanRef = useRef<HTMLDivElement | null>(null);
  const underlineRef = useRef<SVGPathElement | null>(null);
  const timelineRef = useRef<gsap.Context | null>(null);
  
  // Navigation states
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const navRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const quickRotateX = useRef<gsap.QuickToFunc | null>(null);
  const quickRotateY = useRef<gsap.QuickToFunc | null>(null);
  const quickShadow = useRef<gsap.QuickToFunc | null>(null);
  const quickBg = useRef<gsap.QuickToFunc | null>(null);

  const motionDisabled = useMemo(prefersReducedMotion, []);

  useEffect(() => {
    if (motionDisabled) return;
    const id = setInterval(
      () => setImageIndex((i) => (i + 1) % visualImages.length),
      6200
    );
    return () => clearInterval(id);
  }, [motionDisabled]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    setMouse({ x, y });
    if (motionDisabled) return;
    if (quickRotateX.current && quickRotateY.current && quickShadow.current) {
      const tiltX = (y - 0.5) * -10;
      const tiltY = (x - 0.5) * 12;
      quickRotateX.current(tiltX);
      quickRotateY.current(tiltY);
      quickShadow.current((x - 0.5) * 10);
    }
    if (quickBg.current) {
      quickBg.current((x - 0.5) * 6);
    }
  };

  useLayoutEffect(() => {
    if (!heroRef.current || motionDisabled) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      tl.from(".nav-rail", { opacity: 0, y: -12, duration: 0.5 })
        .from(".hero-rail-top", { opacity: 0, y: -8, duration: 0.5 }, "-=0.2")
        .from(".hero-rail-bottom", { opacity: 0, y: 8, duration: 0.5 }, "-=0.4")
        .from(".headline-line", { opacity: 0, y: 18, stagger: 0.08, duration: 0.6 }, "-=0.2")
        .from(".badge-pop", { opacity: 0, scale: 0.94, stagger: 0.05, duration: 0.4 }, "-=0.2")
        .from(visualRef.current, { opacity: 0, y: 26, rotateX: 8, duration: 0.7, ease: "power3.out" }, "-=0.3");

      if (underlineRef.current) {
        const length = underlineRef.current.getTotalLength();
        gsap.set(underlineRef.current, { strokeDasharray: length, strokeDashoffset: length });
        tl.to(underlineRef.current, { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" }, "-=0.4");
      }

      if (scanRef.current) {
        gsap.to(scanRef.current, {
          yPercent: 110,
          duration: 1.2,
          ease: "power1.inOut",
          repeat: -1,
          repeatDelay: 7,
        });
      }

      const heroEl = heroRef.current;
      ScrollTrigger.create({
        trigger: heroEl,
        start: "top top",
        end: "bottom top",
        scrub: 0.6,
        animation: gsap.to(".content-shift", { yPercent: -8, ease: "none" }),
      });
    }, heroRef);
    timelineRef.current = ctx;
    return () => ctx.revert();
  }, [motionDisabled]);

  useEffect(() => {
    if (!visualRef.current || motionDisabled) return;
    quickRotateX.current = gsap.quickTo(visualRef.current, "rotateX", { duration: 0.3, ease: "power2.out" });
    quickRotateY.current = gsap.quickTo(visualRef.current, "rotateY", { duration: 0.3, ease: "power2.out" });
    quickShadow.current = gsap.quickTo(visualRef.current, "boxShadow", {
      duration: 0.3,
      ease: "power2.out",
      modifier: (value: number | string) => `0 25px 60px ${Number(value).toFixed(1)}px rgba(0,0,0,0.35)`,
    });
    quickBg.current = gsap.quickTo(bgRef.current, "x", { duration: 0.4, ease: "power2.out" });
    return () => {
      quickRotateX.current = null;
      quickRotateY.current = null;
      quickShadow.current = null;
      quickBg.current = null;
    };
  }, [motionDisabled]);

  const spotlightStyle = {
    background: `radial-gradient(520px at ${mouse.x * 100}% ${mouse.y * 100}%, rgba(168,37,43,0.16), transparent 64%)`,
  };

  return (
    <section
      ref={heroRef}
      dir="rtl"
      className="relative isolate min-h-[100svh] w-full overflow-hidden bg-slate-950 text-white"
      onMouseMove={handleMouseMove}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/55" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/40 via-transparent to-slate-900/40" />
      <div className="pointer-events-none absolute inset-0 mix-blend-screen opacity-90" ref={bgRef}>
        <video
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b1726]/60 via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0" style={spotlightStyle} />
        <div className="absolute inset-0 opacity-60">
          {[...Array(40)].map((_, i) => (
            <span
              key={i}
              className="absolute h-[2px] w-[2px] rounded-full bg-white/35"
              style={{
                top: `${(i * 37) % 100}%`,
                left: `${(i * 59) % 100}%`,
                opacity: 0.4 + (i % 5) * 0.05,
              }}
            />
          ))}
        </div>
        <div className="center-spine absolute left-1/2 top-10 h-[82%] w-[2px] -translate-x-1/2 bg-gradient-to-b from-transparent via-cyan-300/60 to-transparent blur-[1px]" />
        <div className="hero-rail-top absolute left-1/2 top-4 h-[3px] w-[72%] -translate-x-1/2 rounded-full bg-white/10 blur-[1px]" />
        <div className="hero-rail-bottom absolute left-1/2 bottom-6 h-[3px] w-[68%] -translate-x-1/2 rounded-full bg-white/8 blur-[1px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col gap-6 px-4 py-6 sm:px-8 md:px-10 lg:px-12">
        <div className="nav-rail sticky top-6 z-30 mx-auto w-full max-w-5xl">
          <div className="flex items-center justify-between gap-4 rounded-full border border-white/12 bg-white/10 px-5 py-3 shadow-xl backdrop-blur">
            <div className="rounded-xl bg-white/15 px-4 py-2 text-xs font-semibold tracking-[0.12em] text-white">
              ADVANCED LAB
            </div>
            <div className="relative hidden items-center gap-4 text-sm font-semibold text-white/80 md:flex">
              {navItems.map((item, idx) => (
                <button
                  key={item}
                  ref={(el) => { navRefs.current[idx] = el; }}
                  onMouseEnter={() => setHoveredNav(item)}
                  onMouseLeave={() => setHoveredNav(null)}
                  className="relative px-3 py-1 transition hover:text-white"
                >
                  {item}
                  {hoveredNav === item && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute inset-x-1 bottom-0 h-0.5 rounded-full bg-gradient-to-l from-[#a8252b] via-white to-[#53a1e6]"
                    />
                  )}
                </button>
              ))}
            </div>
            <button className="rounded-full bg-[#a8252b] px-4 py-2 text-sm font-semibold text-white shadow-brand transition hover:brightness-110 active:scale-95">
              سحب منزلي
            </button>
          </div>
        </div>

        <div className="content-shift grid flex-1 grid-cols-12 items-center gap-6 lg:gap-8">
          <div className="col-span-12 space-y-5 lg:col-span-6">
            <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-white/70">
              <span className="inline-block h-1 w-1 rounded-full bg-[#53a1e6]" />
              {heroCopy.eyebrow}
            </div>
            <div className="space-y-2 text-white">
              <p className="headline-line text-4xl font-black leading-[1.1] sm:text-5xl">
                نتائج لا تُناقش.
              </p>
              <p className="headline-line text-3xl font-black leading-[1.05] text-[#53a1e6] sm:text-4xl">
                <span className="relative inline-block">
                  {heroCopy.accent}
                  <svg
                    className="absolute -bottom-2 right-0 h-3 w-full"
                    viewBox="0 0 120 10"
                    fill="none"
                  >
                    <path
                      ref={underlineRef}
                      d="M2 6 C30 10 90 2 118 6"
                      stroke="url(#grad)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="120" y2="0" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#a8252b" />
                        <stop offset="0.5" stopColor="#ffffff" />
                        <stop offset="1" stopColor="#53a1e6" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </p>
            </div>
            <p className="max-w-2xl text-base leading-relaxed text-white/80">{heroCopy.body}</p>

            <div className="flex flex-wrap gap-3">
              {heroCopy.badges.map((item) => (
                <div
                  key={item.label}
                  className="badge-pop flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-semibold text-white/80"
                >
                  <span className="inline-block h-2 w-2 rounded-full bg-[#53a1e6]" />
                  {item.label}
                  <span className="text-white/60">•</span>
                  <span className="text-white">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button className="magnetic relative overflow-hidden rounded-full bg-[#a8252b] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#a8252b]/30 transition hover:brightness-110 active:scale-95">
                {heroCopy.ctaPrimary}
              </button>
              <button className="magnetic rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20 active:scale-95">
                {heroCopy.ctaSecondary}
              </button>
            </div>
            <p className="text-[12px] font-semibold tracking-wide text-white/60">
              {heroCopy.microTrust}
            </p>
          </div>

          <div className="col-span-12 lg:col-span-6">
            <div
              ref={visualRef}
              className="group relative aspect-[4/5] w-full overflow-hidden rounded-[28px] border border-white/12 bg-white/5 shadow-[0_30px_60px_-35px_rgba(0,0,0,0.6)] backdrop-blur-xl transition will-change-transform"
              style={{ transformStyle: "preserve-3d" }}
            >
              <svg width="0" height="0" className="absolute">
                <defs>
                  <clipPath id="panel-mask" clipPathUnits="objectBoundingBox">
                    <path d="M0.10,0.22 C0.32,0.02 0.76,-0.02 0.90,0.20 C1.04,0.44 1.02,0.70 0.88,0.86 C0.70,1.04 0.32,1.04 0.12,0.82 C-0.02,0.66 -0.04,0.40 0.10,0.22 Z" />
                  </clipPath>
                </defs>
              </svg>

              <div className="absolute inset-0" style={{ clipPath: "url(#panel-mask)" }}>
                {visualImages.map((src, idx) => (
                  <Image
                    key={src}
                    src={src}
                    alt="مختبر متقدم"
                    fill
                    className="object-cover transition duration-700"
                    style={{
                      opacity: imageIndex === idx ? 1 : 0,
                      transform: imageIndex === idx ? "scale(1.02)" : "scale(1)",
                    }}
                    sizes="(min-width: 1024px) 520px, 100vw"
                    priority={idx === 0}
                  />
                ))}
                <div
                  ref={scanRef}
                  className="pointer-events-none absolute left-0 top-[-120%] h-1/3 w-full bg-gradient-to-b from-transparent via-white/18 to-transparent mix-blend-screen"
                />
              </div>

              <div className="absolute inset-0 rounded-[28px] border border-white/15 opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-[#53a1e6]/10 opacity-60 mix-blend-screen" />

              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-6 top-6 flex flex-col gap-2 text-[11px] font-semibold text-white/80">
                  <span>QC: 99.2%</span>
                  <span>Turnaround: 46m</span>
                </div>
                <div className="absolute right-6 bottom-6 flex flex-col gap-2 text-[11px] font-semibold text-white/80 text-left">
                  <span>Verified: نعم</span>
                  <span>Trace: AES-256</span>
                </div>
              </div>

              <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-70">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/14 to-transparent blur-2xl" />
              </div>
            </div>
          </div>
        </div>

        <div className="hero-rail-bottom relative z-20 mx-auto mt-2 flex w-full max-w-5xl items-center justify-between gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[12px] font-semibold text-white/70 backdrop-blur">
          {statusStrip.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#53a1e6]" />
              {item.label}: <span className="text-white/90">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Hero;
