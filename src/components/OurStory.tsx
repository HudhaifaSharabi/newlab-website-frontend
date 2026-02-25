"use client";

import { useRef } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AboutStoryData } from "@/types/api";

gsap.registerPlugin(ScrollTrigger);

interface OurStoryProps {
  data: AboutStoryData;
}

export default function OurStory({ data }: OurStoryProps) {
  const locale = useLocale();
  const isRTL = locale === "ar";

  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLDivElement>(null);

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
    <section ref={containerRef} className="bg-slate-50 py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          
          {/* Left Column: Narrative */}
          <div className="order-2 lg:order-1">
            <h2 className="animate-text mb-2 text-3xl font-bold tracking-tight text-[#1a658d] sm:text-4xl">
              {(isRTL ? data.headlineAr : data.headline) || (
                <div className="h-10 w-3/4 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
              )}
            </h2>
            <div className="animate-text mb-6">
              {(isRTL ? data.subheadlineAr : data.subheadline) ? (
                <p className="text-lg font-semibold text-[#1a658d]/80">
                  {isRTL ? data.subheadlineAr : data.subheadline}
                </p>
              ) : (
                <div className="h-6 w-1/2 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
              )}
            </div>
            <div className="animate-text mb-10">
              {(isRTL ? data.bodyAr : data.body) ? (
                <p className="text-lg leading-8 text-slate-600">
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

            {/* Pillars Grid */}
            <div className="animate-text grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
              {data.pillars.map((pillar, i) => (
                <div key={pillar.id} className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 flex-none text-[#b9292f]" />
                  <span className="font-medium text-slate-900">
                    {(isRTL ? pillar.titleAr : pillar.title) || (
                      <div className="h-5 w-32 inline-block align-middle rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Visual Proof (Masonry Grid) */}
          <div ref={imagesRef} className="order-1 lg:order-2 grid grid-cols-2 gap-4 h-[500px]">
            {/* Image 1: Reception (Large Left) */}
            <div className="relative row-span-2 overflow-hidden rounded-2xl shadow-xl bg-slate-200 dark:bg-slate-800">
              {data.image1 ? (
                <>
                  <Image
                    src={data.image1}
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
              {data.image2 ? (
                <Image
                  src={data.image2}
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
              {data.image3 ? (
                <Image
                  src={data.image3}
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
      </div>
    </section>
  );
}
