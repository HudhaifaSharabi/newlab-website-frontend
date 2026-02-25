"use client";

import { useTranslations } from "next-intl";
import { Microscope, HeartHandshake, Award, Maximize } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export default function AboutSection() {
  const t = useTranslations("about.section");
  const container = useRef(null);
  const leftCol = useRef(null);
  const rightCol = useRef(null);

  useGSAP(() => {
    // Staggered entrance for grid items
    gsap.from(".feature-card", {
      scrollTrigger: {
        trigger: rightCol.current,
        start: "top 80%",
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: "power3.out",
    });

    // Parallax effect
    gsap.to(leftCol.current, {
      scrollTrigger: {
        trigger: container.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
      y: 50, // Moves slower than right column
      ease: "none",
    });
  }, { scope: container });

  const features = [
    {
      key: "tech",
      icon: <Microscope className="h-8 w-8 transition-colors duration-300 group-hover:text-[#b9292f]" />,
    },
    {
      key: "env",
      icon: <Maximize className="h-8 w-8 transition-colors duration-300 group-hover:text-[#b9292f]" />,
    },
    {
      key: "care",
      icon: <HeartHandshake className="h-8 w-8 transition-colors duration-300 group-hover:text-[#b9292f]" />,
    },
    {
      key: "quality",
      icon: <Award className="h-8 w-8 transition-colors duration-300 group-hover:text-[#b9292f]" />,
    },
  ];

  return (
    <section ref={container} className="relative overflow-hidden bg-slate-50 py-24 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          
          {/* Left Column: Narrative */}
          <div ref={leftCol} className="relative z-10">
            <span className="mb-4 inline-block font-bold tracking-wider text-[#1a658d] dark:text-[#60a5fa]">
              {t("tag")}
            </span>
            <h2 className="mb-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              {t("headline")}
            </h2>
            
            <div className="mb-8 border-l-4 border-gradient-to-b from-blue-500 to-red-500 pl-6 border-[#1a658d]">
              <p className="text-xl font-medium italic leading-relaxed text-slate-800 dark:text-slate-200">
                &quot;{t("vision")}&quot;
              </p>
              <p className="mt-2 font-bold text-[#b9292f]">
                &mdash; {t("motto")}
              </p>
            </div>

            <p className="text-lg leading-8 text-slate-600 dark:text-slate-400">
              {t("story")}
            </p>
          </div>

          {/* Right Column: 2x2 Interactive Grid */}
          <div ref={rightCol} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.key}
                className="feature-card group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:bg-slate-800"
              >
                {/* Subtle Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/medical-icons.png')]" />
                
                <div className="relative z-10">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-[#1a658d]/5 text-[#1a658d] transition-colors duration-300 group-hover:bg-[#b9292f]/5 dark:bg-blue-900/20 dark:text-blue-400">
                    {feature.icon}
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-[#1a658d] dark:text-white">
                    {t(`pillars.${feature.key}`)}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t(`pillars.${feature.key}Desc`)}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
