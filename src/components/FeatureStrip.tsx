"use client";

import clsx from "clsx";
import { FileText, HeartPulse, ShieldCheck } from "lucide-react";

type Feature = { title: string; body: string };

type FeatureStripProps = {
  features: Feature[];
  className?: string;
};

const icons = [ShieldCheck, HeartPulse, FileText];

export function FeatureStrip({ features, className }: FeatureStripProps) {
  return (
    <div
      className={clsx(
        "absolute inset-x-0 bottom-0 z-30 border-t border-white/10 bg-white/10 shadow-[0_-24px_80px_rgba(0,0,0,0.35)] backdrop-blur-md",
        className
      )}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3 sm:gap-6">
          {features.slice(0, 3).map((feature, index) => {
            const Icon = icons[index % icons.length];
            return (
              <div
                key={feature.title}
                className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-3 shadow-sm backdrop-blur"
              >
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg border border-white/10 bg-white/10 text-brand-primary dark:text-brand-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">{feature.title}</p>
                  <p className="text-xs text-slate-200/80">{feature.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default FeatureStrip;
