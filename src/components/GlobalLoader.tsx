"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function GlobalLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    setIsLoading(true);

    const handleComplete = () => {
      // Small delay works well to ensure everything is visually ready
      setTimeout(() => setIsLoading(false), 500);
    };

    if (document.readyState === "complete") {
      handleComplete();
    } else {
      window.addEventListener("load", handleComplete);
      const fallbackTimer = setTimeout(handleComplete, 6000);
      return () => {
        window.removeEventListener("load", handleComplete);
        clearTimeout(fallbackTimer);
      };
    }
  }, [pathname]);

  // Keep it in DOM momentarily to allow transition to play
  const [mounted, setMounted] = useState(true);
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setMounted(false), 500); // Wait for transition duration
      return () => clearTimeout(timer);
    } else {
      setMounted(true);
    }
  }, [isLoading]);

  if (!mounted) return null;

  return (
    <div 
      className={clsx(
        "fixed inset-0 z-[99999] flex items-center justify-center bg-brand-mist dark:bg-brand-slate transition-opacity duration-500",
        isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="relative w-32 h-32 md:w-48 md:h-48 animate-pulse">
        <Image
          src="/logo.png"
          alt="Loading..."
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
