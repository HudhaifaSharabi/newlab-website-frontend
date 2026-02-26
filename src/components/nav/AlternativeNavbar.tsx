"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { Menu, X } from "lucide-react";
import Image from "next/image";

type Language = "en" | "ar";

type NavLink = { label: string; href: string };
type NavDropdown = { label: string; trigger: true; children: NavLink[] };
type NavItem = NavLink | NavDropdown;

const content: Record<Language, { nav: { badge: string; cta: string; items: NavItem[] }; ui: { languageSwitcher: string; themeSwitcher: string; light: string; dark: string } }> = {
  en: {
    nav: {
      badge: "NEW LAB SPECIALIZED DIAGNOSTICS",
      cta: "Book a test",
      items: [
        { label: "About Us", href: "/about-us" },
        { 
          label: "Services", 
          trigger: true,
          children: [
            { label: "Test Menu", href: "/tests" },
            { label: "Home Visit", href: "/book" }
          ]
        },
        { label: "Technology", href: "/equipment" },
        { label: "Quality", href: "/certificates" },
        {
          label: "Media Center",
          trigger: true,
          children: [
            { label: "News", href: "/media/news" },
            { label: "Videos", href: "/media/videos" },
            { label: "Articles", href: "/media/articles" }
          ]
        },
        { label: "Contact", href: "/contact" }
      ],
    },
    ui: {
      languageSwitcher: "Language switcher",
      themeSwitcher: "Theme switcher",
      light: "Light",
      dark: "Dark",
    },
  },
  ar: {
    nav: {
      badge: "مختبر نيو لاب التخصصي للتشخيص",
      cta: "سحب منزلي",
      items: [
        { label: "من نحن", href: "/about-us" },
        { 
          label: "الخدمات", 
          trigger: true,
          children: [
             { label: "دليل الفحوصات", href: "/tests" },
             { label: "حجز منزلي", href: "/book" }
          ]
        },
        { label: "التقنيات", href: "/equipment" },
        { label: "الجودة", href: "/certificates" },
        {
          label: "المركز الإعلامي",
          trigger: true,
          children: [
            { label: "أخبار", href: "/media/news" },
            { label: "فيديوهات", href: "/media/videos" },
            { label: "مقالات", href: "/media/articles" }
          ]
        },
        { label: "تواصل", href: "/contact" },
        { label: "التقييم الصحي", href: "/assessment" }
      ],
    },
    ui: {
      languageSwitcher: "مبدل اللغة",
      themeSwitcher: "مبدل المظهر",
      light: "فاتح",
      dark: "داكن",
    },
  },
};

export default function AlternativeNavbar() {
  const locale = useLocale() as Language;
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isRTL = locale === "ar";
  const copy = content[locale] ?? content.en;
  const navItemsActive = copy.nav.items;
  const uiCopy = copy.ui;
  const languageOptions: Language[] = isRTL ? ["ar", "en"] : ["en", "ar"];
  const activeTheme = mounted && resolvedTheme ? resolvedTheme : "dark";
  const isDark = activeTheme === "dark";

  const localeHrefs = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const buildHref = (nextLocale: Language) => {
      if (segments.length === 0) {
        return `/${nextLocale}`;
      }
      const nextSegments = [...segments];
      nextSegments[0] = nextLocale;
      return `/${nextSegments.join("/")}`;
    };
    return {
      en: buildHref("en"),
      ar: buildHref("ar"),
    };
  }, [pathname]);

  useEffect(() => setMounted(true), []);

  /* =========================
     SCROLL EFFECT
  ========================= */
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div className={`mx-auto transition-all duration-300 ${scrolled ? "max-w-6xl px-4" : "max-w-7xl px-6"}`}>
        <div 
          className={`flex items-center justify-between border border-slate-200/70 bg-white/80 text-slate-900 backdrop-blur-xl dark:border-white/10 dark:bg-black/50 dark:text-white transition-all duration-300 ${
            scrolled ? "h-14 rounded-2xl shadow-lg" : "h-16 rounded-2xl"
          }`}
        >
          <div className="flex items-center gap-4 px-4">
            <Link href={`/${locale}`} className="relative h-10 w-32 shrink-0 transition-transform hover:scale-105">
              <Image 
                src="/logo.png" 
                alt="New Lab Logo" 
                fill 
                className="object-contain"
                priority 
              />
            </Link>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            {navItemsActive.map((item, index) => {
              if ('trigger' in item && item.trigger) {
                const isOpen = openDropdown === item.label;
                return (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(item.label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button className="flex items-center gap-1 text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-white/70 dark:hover:text-white">
                      {item.label}
                      <svg
                        className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div
                      className={`absolute top-full pt-4 w-48 transition-all duration-300 ${
                        isOpen ? "opacity-100 translate-y-0 visible" : "opacity-0 translate-y-2 invisible"
                      } ${isRTL ? "left-0 origin-top-left" : "right-0 origin-top-right"}`}
                    >
                      <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white/90 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#1a658d]/90">
                        <div className="flex flex-col p-2">
                          {item.children.map((child) => (
                            <Link
                              key={child.label}
                              href={`/${locale}${child.href}`}
                              className="rounded-lg px-4 py-2 text-sm text-slate-600 transition hover:bg-[#1a658d]/10 hover:text-[#1a658d] dark:text-slate-300 dark:hover:bg-blue-500/20 dark:hover:text-blue-400"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              const linkItem = item as NavLink;
              return (
              <Link
                key={linkItem.label}
                href={`/${locale}${linkItem.href}`}
                className="relative text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-white/70 dark:hover:text-white"
              >
                {linkItem.label}
                <span className="absolute -bottom-2 left-0 h-[2px] w-full origin-center scale-x-0 bg-gradient-to-r from-[#a8252b] to-[#1a658d] transition group-hover:scale-x-100" />
              </Link>
            )})}
          </nav>

          <div className="flex items-center gap-2 px-4">
            <div
              className="hidden items-center rounded-full border border-slate-200/70 bg-white/80 p-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 md:flex dark:border-white/15 dark:bg-white/5 dark:text-white/70"
              aria-label={uiCopy.languageSwitcher}
            >
              {languageOptions.map((code) => (
                <Link
                  key={code}
                  href={localeHrefs[code]}
                  className={`rounded-full px-3 py-1 transition ${
                    locale === code
                      ? "bg-[#1a658d] text-white shadow-sm dark:bg-white/20 dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-white/60 dark:hover:text-white"
                  }`}
                  aria-current={locale === code ? "page" : undefined}
                >
                  {code.toUpperCase()}
                </Link>
              ))}
            </div>

            <div
              className="hidden items-center rounded-full border border-slate-200/70 bg-white/80 p-1 text-[11px] font-semibold text-slate-600 md:flex dark:border-white/15 dark:bg-white/5 dark:text-white/70"
              aria-label={uiCopy.themeSwitcher}
            >
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`rounded-full px-3 py-1 transition ${
                  activeTheme === "light"
                    ? "bg-[#1a658d] text-white shadow-sm dark:bg-white/20 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-white/60 dark:hover:text-white"
                }`}
                aria-pressed={activeTheme === "light"}
              >
                {uiCopy.light}
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`rounded-full px-3 py-1 transition ${
                  isDark
                    ? "bg-[#1a658d] text-white shadow-sm dark:bg-white/20 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-white/60 dark:hover:text-white"
                }`}
                aria-pressed={isDark}
              >
                {uiCopy.dark}
              </button>
            </div>

            <button className="hidden md:block rounded-full bg-[#a8252b] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#a8252b]/30 hover:brightness-110">
              {copy.nav.cta}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="group flex md:hidden items-center justify-center p-2 text-slate-600 dark:text-white transition-colors hover:text-[#1a658d] dark:hover:text-[#1a658d]"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[150] bg-white dark:bg-slate-950 p-6 flex flex-col animate-in slide-in-from-right duration-300">
          <div className="flex items-center justify-between mb-8">
            <Link href={`/${locale}`} onClick={() => setMobileMenuOpen(false)} className="relative h-10 w-32 shrink-0">
              <Image 
                src="/logo.png" 
                alt="New Lab Logo" 
                fill 
                className="object-contain"
                priority 
              />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white transition-colors hover:bg-slate-200 dark:hover:bg-white/20"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            <nav className="flex flex-col gap-6">
              {navItemsActive.map((item) => (
                <div
                  key={item.label}
                  className="border-b border-slate-100 dark:border-white/5 pb-4 last:border-0"
                >
                  {'trigger' in item && item.trigger ? (
                    <div className="space-y-3">
                      <div className="text-xl font-bold text-slate-900 dark:text-white">
                        {item.label}
                      </div>
                      <div className="pl-4 flex flex-col gap-3 border-l-2 border-slate-100 dark:border-white/10">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={`/${locale}${child.href}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-base font-medium text-slate-600 dark:text-white/60 hover:text-[#1a658d] dark:hover:text-white transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={`/${locale}${(item as NavLink).href}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xl font-bold text-slate-900 dark:text-white hover:text-[#1a658d] transition-colors block"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/10 space-y-6">
            {/* Language Switcher */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{uiCopy.languageSwitcher}</span>
              <div className="flex bg-slate-100 dark:bg-white/5 rounded-full p-1">
                {languageOptions.map((code) => (
                  <Link
                    key={code}
                    href={localeHrefs[code]}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      locale === code
                        ? "bg-white shadow-sm text-slate-900 dark:bg-slate-800 dark:text-white"
                        : "text-slate-500 hover:text-slate-900 dark:text-white/50 dark:hover:text-white"
                    }`}
                  >
                    {code.toUpperCase()}
                  </Link>
                ))}
              </div>
            </div>

            {/* Theme Switcher */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{uiCopy.themeSwitcher}</span>
              <div className="flex bg-slate-100 dark:bg-white/5 rounded-full p-1">
                <button
                  onClick={() => setTheme("light")}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeTheme === "light"
                      ? "bg-white shadow-sm text-slate-900 dark:bg-slate-800 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 dark:text-white/50 dark:hover:text-white"
                  }`}
                >
                  {uiCopy.light}
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isDark
                      ? "bg-white shadow-sm text-slate-900 dark:bg-slate-800 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 dark:text-white/50 dark:hover:text-white"
                  }`}
                >
                  {uiCopy.dark}
                </button>
              </div>
            </div>

            {/* Mobile CTA */}
            <button className="w-full rounded-xl bg-[#a8252b] py-4 text-base font-bold text-white shadow-lg shadow-[#a8252b]/30 active:scale-[0.98] transition-transform">
              {copy.nav.cta}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
