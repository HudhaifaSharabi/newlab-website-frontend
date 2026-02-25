"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { motion, useMotionValue, useSpring, useTransform, MotionValue } from "framer-motion";

type Particle = {
  id: number;
  xPct: number;
  yPct: number;
  size: number;
  drift: number;
  delay: number;
};

const PARTICLE_COUNT = 18;
const FALLBACK_VIEWPORT = { w: 1280, h: 800 };

function ParticleDot({
  particle,
  mouseX,
  mouseY,
  viewport
}: {
  particle: Particle;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  viewport: { w: number; h: number };
}) {
  const baseX = (particle.xPct / 100) * viewport.w;
  const baseY = (particle.yPct / 100) * viewport.h;
  const repulseRadius = Math.min(viewport.w, viewport.h) * 0.2;

  // @ts-ignore
  const rawX = useTransform([mouseX, mouseY], (values: any) => {
    const [mx, my] = values;
    const dx = mx - baseX;
    const dy = my - baseY;
    const dist = Math.max(Math.hypot(dx, dy), 1);
    const strength = Math.max(0, 1 - dist / repulseRadius) * 46;
    return baseX - (dx / dist) * strength;
  });

  // @ts-ignore
  const rawY = useTransform([mouseX, mouseY], (values: any) => {
    const [mx, my] = values;
    const dx = mx - baseX;
    const dy = my - baseY;
    const dist = Math.max(Math.hypot(dx, dy), 1);
    const strength = Math.max(0, 1 - dist / repulseRadius) * 46;
    return baseY - (dy / dist) * strength;
  });

  const x = useSpring(rawX, { stiffness: 90, damping: 18, mass: 0.7 });
  const y = useSpring(rawY, { stiffness: 90, damping: 18, mass: 0.7 });

  return (
    <motion.span
      className="absolute rounded-full bg-white/40 shadow-[0_0_0_10px_rgba(26,101,141,0.12)] blur-[1px] dark:bg-white/70"
      style={{
        width: particle.size,
        height: particle.size,
        x,
        y
      }}
      animate={{
        opacity: [0.32, 0.6, 0.32],
        scale: [1, 1.12, 1],
        transition: {
          duration: 10 + particle.drift,
          repeat: Infinity,
          ease: "easeInOut",
          delay: particle.delay
        }
      }}
    />
  );
}

export function InteractiveBackground({ className }: { className?: string }) {
  const [viewport, setViewport] = useState(FALLBACK_VIEWPORT);
  const mouseX = useMotionValue<number>(FALLBACK_VIEWPORT.w / 2);
  const mouseY = useMotionValue<number>(FALLBACK_VIEWPORT.h / 2);

  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: PARTICLE_COUNT }).map((_, index) => ({
        id: index,
        xPct: Math.random() * 100,
        yPct: Math.random() * 100,
        size: 8 + Math.random() * 12,
        drift: 6 + Math.random() * 8,
        delay: Math.random() * 2
      })),
    []
  );

  useEffect(() => {
    const updateViewport = () => {
      const next = {
        w: typeof window !== "undefined" ? window.innerWidth || FALLBACK_VIEWPORT.w : FALLBACK_VIEWPORT.w,
        h: typeof window !== "undefined" ? window.innerHeight || FALLBACK_VIEWPORT.h : FALLBACK_VIEWPORT.h
      };
      setViewport(next);
      mouseX.set(next.w / 2);
      mouseY.set(next.h / 2);
    };

    const handleMove = (event: PointerEvent) => {
      mouseX.set(event.clientX);
      mouseY.set(event.clientY);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerleave", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerleave", updateViewport);
    };
  }, [mouseX, mouseY]);

  return (
    <div
      className={clsx(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(26,101,141,0.24),transparent_36%),radial-gradient(circle_at_80%_18%,rgba(26,101,141,0.18),transparent_34%),radial-gradient(circle_at_50%_75%,rgba(168,37,43,0.16),transparent_44%),#0B101B]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(11,16,27,0.6),transparent_55%)]" />
      <div className="absolute inset-0 mix-blend-screen blur-3xl" />

      <motion.div className="absolute inset-0">
        {particles.map((particle) => (
          <ParticleDot key={particle.id} particle={particle} mouseX={mouseX} mouseY={mouseY} viewport={viewport} />
        ))}
      </motion.div>
    </div>
  );
}

export default InteractiveBackground;
