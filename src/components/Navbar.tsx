"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import clsx from "clsx";
import { FlaskConical, Menu, Moon, Sun, X } from "lucide-react";

type Language = "en" | "ar";

type NavbarProps = {
  language: Language;
  onLanguageChange: (language: Language) => void;
  isRTL?: boolean;
};

const navLinks = [
  { key: "services", label: { en: "Services", ar: "الخدمات" }, href: "#services" },
  { key: "about", label: { en: "About Lab", ar: "عن المختبر" }, href: "#about" },
  { key: "physicians", label: { en: "Physicians", ar: "الأطباء" }, href: "#physicians" },
  { key: "results", label: { en: "Results", ar: "النتائج" }, href: "#results" },
  { key: "contact", label: { en: "Contact", ar: "تواصل معنا" }, href: "#contact" },
  { key: "assessment", label: { en: "assessment", ar: "التقييم الصحي الذكي" }, href: "#assessment" }
];

export function Navbar({ language, onLanguageChange, isRTL = false }: NavbarProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = (mounted ? resolvedTheme : "dark") === "dark";
  const ctaText = language === "ar" ? "سحب منزليًا" : "Book a test";

  return (
    <header className="fixed inset-x-0 top-0 z-50" dir={isRTL ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative mt-3 overflow-hidden rounded-full border border-white/30 bg-white/80 px-4 py-2 shadow-2xl backdrop-blur-md backdrop-saturate-150 ring-1 ring-black/5 dark:border-white/10 dark:bg-white/10 dark:ring-white/10">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/60 via-white/40 to-white/10 opacity-80 dark:from-brand-primary/20 dark:via-white/5 dark:to-white/0" />
          <div
            className={clsx(
              "relative flex items-center gap-4",
              isRTL ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div className={clsx("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/40 bg-white/90 text-brand-primary shadow-brand dark:border-white/20 dark:bg-white/10 dark:text-brand-accent">
                <FlaskConical className="h-6 w-6" />
              </div>
              <div className={clsx("leading-tight", isRTL && "text-right")}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-primary dark:text-brand-accent">
                  New Lab Specialized
                </p>
                <p className="text-sm font-semibold">Advanced Diagnostics Lab</p>
              </div>
            </div>

            <nav
              aria-label="Primary navigation"
              className={clsx(
                "hidden flex-1 items-center justify-center gap-6 text-sm font-semibold text-slate-800 transition-colors dark:text-slate-100 lg:flex",
                isRTL && "flex-row-reverse"
              )}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className="group relative px-1 py-2 transition hover:text-brand-primary dark:hover:text-brand-accent"
                >
                  <span className="absolute inset-x-0 -bottom-[2px] h-[2px] origin-center scale-x-0 bg-gradient-to-r from-brand-primary via-brand-accent to-brand-primary transition-transform duration-200 group-hover:scale-x-100" />
                  {link.label[language]}
                </Link>
              ))}
            </nav>

            <div
              className={clsx(
                "ml-auto flex items-center gap-2 text-sm font-semibold",
                isRTL && "ml-0 mr-auto flex-row-reverse"
              )}
            >
              <div
                className={clsx(
                  "hidden items-center rounded-full border border-white/40 bg-white/80 px-1 py-1 text-xs shadow-sm backdrop-blur dark:border-white/15 dark:bg-white/5 lg:flex",
                  isRTL && "flex-row-reverse"
                )}
                aria-label="Language switcher"
              >
                {(["en", "ar"] as Language[]).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => onLanguageChange(code)}
                    className={clsx(
                      "rounded-full px-3 py-1 transition",
                      language === code
                        ? "bg-brand-primary text-white shadow-brand dark:bg-brand-accent"
                        : "text-slate-700 hover:text-brand-primary dark:text-slate-200 dark:hover:text-brand-accent"
                    )}
                    aria-pressed={language === code}
                  >
                    {code.toUpperCase()}
                  </button>
                ))}
              </div>

              <button
                type="button"
                aria-label="Toggle theme"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/80 text-slate-800 transition hover:border-brand-primary hover:text-brand-primary dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:border-brand-accent"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              <Link
                href="#book"
                className="hidden rounded-full bg-brand-accent px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-accent/40 transition hover:brightness-110 lg:inline-flex"
              >
                {ctaText}
              </Link>

              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/70 text-slate-800 transition hover:border-brand-primary hover:text-brand-primary dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:border-brand-accent lg:hidden"
                onClick={() => setOpen((prev) => !prev)}
                aria-label="Toggle menu"
                aria-expanded={open}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        <div
          className={clsx(
            "lg:hidden",
            open ? "max-h-80 opacity-100" : "max-h-0 opacity-0",
            "transition-[max-height,opacity] duration-300 ease-out"
          )}
        >
          <div
            className={clsx(
              "mt-3 overflow-hidden rounded-2xl border border-white/20 bg-white/80 text-slate-800 shadow-xl backdrop-blur-md dark:border-white/15 dark:bg-white/5 dark:text-white",
              isRTL && "text-right"
            )}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold">
                {(["en", "ar"] as Language[]).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      onLanguageChange(code);
                      setOpen(false);
                    }}
                    className={clsx(
                      "rounded-full px-3 py-1 transition",
                      language === code
                        ? "bg-brand-primary text-white shadow-brand dark:bg-brand-accent"
                        : "text-slate-700 hover:text-brand-primary dark:text-slate-200 dark:hover:text-brand-accent"
                    )}
                  >
                    {code.toUpperCase()}
                  </button>
                ))}
              </div>
              <Link
                href="#book"
                className="rounded-full bg-brand-accent px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-brand-accent/40 transition hover:brightness-110"
              >
                {ctaText}
              </Link>
            </div>

            <nav className={clsx("flex flex-col gap-2 px-4 pb-4 text-sm font-semibold", isRTL && "items-end")}>
              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className="rounded-lg px-2 py-2 transition hover:bg-white/60 hover:text-brand-primary dark:hover:bg-white/10 dark:hover:text-brand-accent"
                  onClick={() => setOpen(false)}
                >
                  {link.label[language]}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
