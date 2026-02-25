"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useMotionValueEvent, useSpring, useTransform } from "framer-motion";
import clsx from "clsx";
import { ChevronsLeftRight, Sparkles } from "lucide-react";

type ComparisonSliderProps = {
  isRTL?: boolean;
  labels?: { before: string; after: string };
};

const scienceImage =
  "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1600&q=80";
const lifestyleImage =
  "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1600&q=80";

export function ComparisonSlider({
  isRTL = false,
  labels = { before: "Science", after: "Life" }
}: ComparisonSliderProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const percent = useMotionValue(50);
  const animatedPercent = useSpring(percent, { stiffness: 160, damping: 24, mass: 0.85 });
  const [percentDisplay, setPercentDisplay] = useState(50);
  const percentRef = useRef(50);

  useMotionValueEvent(animatedPercent, "change", (latest) => {
    percentRef.current = latest;
    setPercentDisplay(Math.round(latest));
  });

  useEffect(() => {
    percent.set(50);
  }, [percent]);

  const overlayWidth = useTransform(animatedPercent, (value) => `${value}%`);
  const handleLeft = useTransform(animatedPercent, (value) => `${isRTL ? 100 - value : value}%`);

  const updateFromClientX = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relative = (clientX - rect.left) / rect.width;
    const clamped = Math.min(Math.max(relative, 0), 1);
    const nextPercent = isRTL ? (1 - clamped) * 100 : clamped * 100;
    percent.set(nextPercent);
  };

  const startDrag = (event: React.PointerEvent<HTMLElement>) => {
    event.preventDefault();
    updateFromClientX(event.clientX);
    const move = (e: PointerEvent) => updateFromClientX(e.clientX);
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const delta = event.key === "ArrowLeft" ? -5 : 5;
    const handlePosition = isRTL ? 100 - percentRef.current : percentRef.current;
    const nextHandle = Math.min(Math.max(handlePosition + delta, 0), 100);
    const nextPercent = isRTL ? 100 - nextHandle : nextHandle;
    percent.set(nextPercent);
  };

  const beforeLabel = labels.before;
  const afterLabel = labels.after;

  return (
    <div
      ref={trackRef}
      className={clsx(
        "relative isolate overflow-hidden rounded-3xl border border-white/15 bg-white/15 shadow-2xl ring-1 ring-white/10 backdrop-blur",
        "aspect-[4/3] min-h-[340px] sm:aspect-[5/4] sm:min-h-[420px] md:aspect-[3/2]"
      )}
      onPointerDown={startDrag}
    >
      <Image
        src={lifestyleImage}
        alt={afterLabel}
        fill
        className="object-cover"
        sizes="(min-width: 1024px) 560px, 100vw"
        priority
      />

      <motion.div
        className="absolute inset-0 overflow-hidden"
        style={isRTL ? { right: 0, width: overlayWidth } : { left: 0, width: overlayWidth }}
      >
        <div className="absolute inset-0">
          <Image
            src={scienceImage}
            alt={beforeLabel}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 560px, 100vw"
            priority
          />
          <div
            className={clsx(
              "absolute inset-0",
              isRTL
                ? "bg-gradient-to-l from-brand-primary/40 via-transparent to-transparent dark:from-brand-accent/45"
                : "bg-gradient-to-r from-brand-primary/40 via-transparent to-transparent dark:from-brand-accent/45"
            )}
          />
        </div>
      </motion.div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50" />

      <div
        className={clsx(
          "absolute top-5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white",
          "bg-brand-accent/80 shadow-brandAccent",
          isRTL ? "right-5" : "left-5"
        )}
      >
        {beforeLabel}
      </div>
      <div
        className={clsx(
          "absolute top-5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
          "bg-white/70 text-brand-primary shadow-brand dark:bg-white/15 dark:text-white",
          isRTL ? "left-5" : "right-5"
        )}
      >
        {afterLabel}
      </div>

      <motion.div
        className="absolute top-0 bottom-0 w-px bg-white/70 mix-blend-overlay"
        style={{ left: handleLeft }}
      />

      <motion.button
        type="button"
        role="slider"
        aria-label="Comparison slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percentDisplay)}
        className="group absolute top-1/2 z-10 h-16 w-16 cursor-pointer rounded-full border-2 border-brand-primary bg-white/85 shadow-xl backdrop-blur transition focus:outline-none focus:ring-2 focus:ring-brand-accent dark:border-brand-primary/70 dark:bg-white/10"
        style={{ left: handleLeft, translateX: "-50%", translateY: "-50%" }}
        onPointerDown={(event) => {
          event.stopPropagation();
          startDrag(event);
        }}
        onKeyDown={onKeyDown}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/70 to-white/30 opacity-90 dark:from-brand-primary/25 dark:to-brand-primary/10" />
        <div className="relative z-10 flex h-full w-full items-center justify-center text-brand-primary">
          <ChevronsLeftRight className={clsx("h-6 w-6", isRTL && "-scale-x-100")} />
        </div>
      </motion.button>

      <div className="pointer-events-none absolute inset-4 rounded-[26px] border border-white/10 bg-gradient-to-br from-white/5 via-transparent to-white/10" />
      <div className="absolute -bottom-10 left-1/2 h-40 w-4/5 -translate-x-1/2 rounded-full bg-brand-primary/18 blur-3xl dark:bg-brand-accent/28" />

      <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/40 px-3 py-2 text-xs font-semibold text-white backdrop-blur">
        <Sparkles className="h-4 w-4 text-brand-primary" />
        <span>{percentDisplay}% calibrated</span>
      </div>
    </div>
  );
}

export default ComparisonSlider;
