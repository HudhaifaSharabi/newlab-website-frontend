"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Activity, Beaker, ShieldCheck } from "lucide-react";

type SmartScanCardProps = {
  className?: string;
};

const imageSrc =
  "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?auto=format&fit=crop&w=1400&q=80";

export function SmartScanCard({ className }: SmartScanCardProps) {
  const badges = [
    { icon: ShieldCheck, label: "Analysis 99.2%", tone: "bg-emerald-500/25 text-emerald-50", top: "14%", left: "10%" },
    { icon: Beaker, label: "Culture: Clear", tone: "bg-brand-primary/30 text-white", top: "38%", right: "12%" },
    { icon: Activity, label: "Signal Stable", tone: "bg-brand-accent/25 text-white", top: "64%", left: "14%" }
  ];

  return (
    <div
      className={clsx(
        "relative isolate overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl ring-1 ring-white/10 backdrop-blur-lg",
        "min-h-[380px] w-full",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/8 via-transparent to-black/40" />
      <Image
        src={imageSrc}
        alt="Precision laboratory microscope"
        fill
        className="object-cover"
        sizes="(min-width: 1024px) 520px, 100vw"
        priority
      />

      <motion.div
        className="pointer-events-none absolute inset-x-6 h-24 rounded-full bg-gradient-to-b from-transparent via-white/55 to-transparent mix-blend-screen"
        animate={{ y: ["0%", "70%", "0%"] }}
        transition={{ duration: 6.5, ease: "easeInOut", repeat: Infinity }}
      />

      <div className="absolute inset-0">
        <div className="absolute inset-5 rounded-2xl border border-white/10 bg-gradient-to-br from-white/6 via-transparent to-white/4" />
        {badges.map((badge, idx) => {
          const Icon = badge.icon;
          return (
            <motion.div
              key={badge.label}
              className={clsx(
                "absolute flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-xs font-semibold shadow-lg backdrop-blur",
                badge.tone
              )}
              style={{ top: badge.top, left: badge.left, right: badge.right }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + idx * 0.18, duration: 0.5, ease: "easeOut" }}
            >
              <Icon className="h-4 w-4" />
              <span>{badge.label}</span>
            </motion.div>
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/10" />
      <div className="absolute -bottom-12 left-1/2 h-32 w-4/5 -translate-x-1/2 rounded-full bg-brand-primary/24 blur-3xl dark:bg-brand-accent/26" />
    </div>
  );
}

export default SmartScanCard;
