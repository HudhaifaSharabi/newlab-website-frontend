"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft, CheckCircle2, Cpu, Activity, Server } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import AlternativeNavbar from "@/components/nav/AlternativeNavbar";
import { NewLabFooter } from "@/components/footer/NewLabFooter";
import { EquipmentItemData } from "@/types/api";

interface EquipmentDetailClientProps {
  device: EquipmentItemData;
}

export default function EquipmentDetailClient({ device }: EquipmentDetailClientProps) {
  const t = useTranslations("equipment");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const container = useRef(null);

  useGSAP(() => {
    // Reveal animation
    gsap.from(".reveal-text", {
      y: 30,
      opacity: 0,
      duration: 1,
      stagger: 0.1,
      ease: "power3.out",
    });

    // Circular Progress Animation
    gsap.to(".progress-ring-circle", {
      strokeDashoffset: (i, target) => {
        const circum = 2 * Math.PI * 40; // r=40
        const percent = target.dataset.percent;
        return circum - (percent / 100) * circum;
      },
      duration: 1.5,
      ease: "power2.out",
      delay: 0.5,
    });
  }, { scope: container });

  return (
    <div className="min-h-screen bg-[#1a658d]text-slate-100">
      <AlternativeNavbar />
      
      <main ref={container} className="relative mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Back Button */}
        <Link href={`/${locale}/equipment`} className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
          {t("back")}
        </Link>
        
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          
          {/* Left Column: Visual */}
          <div className="relative h-[400px] w-full lg:h-[600px]">
            <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full opacity-20" />
            <Image
              src={device.image}
              alt={isRTL ? device.nameAr : device.name}
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
            {/* Tech Decoration */}
            <div className="absolute top-10 left-10 h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <div className="absolute bottom-20 right-20 h-2 w-2 rounded-full bg-blue-500 animate-ping delay-700" />
            <div className="absolute top-1/2 left-1/2 h-[1px] w-32 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent -translate-x-1/2 rotate-45" />
          </div>

          {/* Right Column: Dashboard */}
          <div>
            <div className="mb-2 flex items-center gap-3">
              <span className="rounded bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-400 border border-slate-700">
                ID: {device.id.toUpperCase()}
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400 border border-green-500/20">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500"></span>
                </span>
                {t(`status.${device.status}`)}
              </span>
            </div>

            <h1 className="reveal-text mb-2 text-4xl font-bold tracking-tight dark:text-white sm:text-5xl">
              {isRTL ? device.nameAr : device.name}
            </h1>
            <p className="reveal-text mb-8 text-lg font-medium dark:text-blue-400">
              {isRTL ? device.manufacturerAr : device.manufacturer}
            </p>

            {/* Metrics Dashboard */}
            <div className="reveal-text mb-8 grid grid-cols-2 gap-4 rounded-2xl border border-slate-800 bg-slate-800/50 p-6 backdrop-blur-sm">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="relative mb-2 h-20 w-20">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" className="fill-none stroke-slate-700 stroke-[8px]" />
                    <circle 
                      cx="50" cy="50" r="40" 
                      className="progress-ring-circle fill-none stroke-cyan-500 stroke-[8px] transition-all duration-1000"
                      strokeDasharray="251.2"
                      strokeDashoffset="251.2"
                      data-percent={95}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                    {(isRTL ? device.speedAr : device.speed).split(' ')[0]}
                  </div>
                </div>
                <div className="text-xs text-white">{t("specs.speed")}</div>
              </div>

              <div className="flex flex-col items-center justify-center text-center">
                <div className="relative mb-2 h-20 w-20">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" className="fill-none stroke-slate-700 stroke-[8px]" />
                    <circle 
                      cx="50" cy="50" r="40" 
                      className="progress-ring-circle fill-none stroke-blue-500 stroke-[8px] transition-all duration-1000"
                      strokeDasharray="251.2"
                      strokeDashoffset="251.2"
                      data-percent={device.accuracy}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                    {device.accuracy}%
                  </div>
                </div>
                <div className="text-xs text-white">{t("specs.accuracy")}</div>
              </div>
            </div>

            <div className="reveal-text space-y-6">
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-300">
                  <Server className="h-4 w-4 text-blue-500" />
                  System Overview
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {isRTL ? device.descriptionAr : device.description}
                </p>
              </div>

              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-300">
                  <Cpu className="h-4 w-4 text-blue-500" />
                  Key Features
                </h3>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {(isRTL ? device.featuresAr : device.features).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-400">
                      <CheckCircle2 className="h-4 w-4 text-green-500/80" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="border-t border-slate-800 pt-6">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-300">
                  <Activity className="h-4 w-4 text-blue-500" />
                  {t("specs.related")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(isRTL ? device.relatedTestsAr : device.relatedTests).map((test) => (
                    <span key={test} className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                      {test}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
      
      <NewLabFooter />
    </div>
  );
}
