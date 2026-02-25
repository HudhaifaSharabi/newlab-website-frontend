"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/Navbar";
import InteractiveBackground from "@/components/InteractiveBackground";
import Hero from "@/components/Hero";

type Language = "en" | "ar";

export default function Page() {
  const [language, setLanguage] = useState<Language>("en");
  const isRTL = language === "ar";

  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [isRTL, language]);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div
        className={clsx(
          "relative h-screen overflow-hidden bg-brand-night text-white antialiased transition-colors"
        )}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <InteractiveBackground />
        <Navbar language={language} onLanguageChange={setLanguage} isRTL={isRTL} />
        <Hero className="relative z-10" withNavbarPlaceholder={false} />
      </div>
    </ThemeProvider>
  );
}
