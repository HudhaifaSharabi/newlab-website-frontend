"use client";

import { useLocale } from "next-intl";
import { MessageCircle, X, ChevronRight, Phone, Home } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";

export interface ChatBranch {
  id: string;
  name_en: string;
  name_ar: string;
  whatsapp_number: string;
}

export interface ChatWidgetData {
  title_en: string;
  title_ar: string;
  branches: ChatBranch[];
  action_button: {
    text_en: string;
    text_ar: string;
    link_en: string;
    link_ar: string;
  };
}

export default function FloatingContactWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<ChatWidgetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const locale = useLocale();
  const isRTL = locale === "ar";
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const fetchWidgetData = async () => {
      try {
        const res = await fetch("/api/method/newlab_site.api.get_chat_widget");
        const json = await res.json();
        
        // Handle Frappe's stringified JSON or nested messages gracefully
        let payload = json.message;
        if (typeof payload === 'string') {
          try { payload = JSON.parse(payload); } catch(e) {}
        }
        
        let widgetData = null;
        if (payload?.message?.title_en) {
          widgetData = payload.message;
        } else if (payload?.title_en) {
          widgetData = payload;
        } else if (json.data?.title_en) {
          widgetData = json.data;
        }
        
        // Also sometimes it's returned as an array wrapper [ { title_en: ... } ]
        if (Array.isArray(widgetData)) {
          widgetData = widgetData[0];
        }
        
        // Ensure branches exists
        if (widgetData && !widgetData.branches) {
           widgetData.branches = [];
        }

        setData(widgetData);
      } catch (error) {
        console.error("Failed to fetch chat widget data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWidgetData();
  }, []);

  const toggleWidget = () => {
    if (!isOpen) {
      setIsOpen(true);
      // Open Animation
      gsap.fromTo(popoverRef.current, 
        { scale: 0.8, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }
      );
    } else {
      // Close Animation
      gsap.to(popoverRef.current, {
        scale: 0.8, 
        opacity: 0, 
        y: 20, 
        duration: 0.3, 
        ease: "power2.in",
        onComplete: () => setIsOpen(false)
      });
    }
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        if (isOpen) toggleWidget();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`fixed bottom-6 z-50 ${isRTL ? "left-6" : "right-6"}`}>
      
      {/* Popover Menu */}
      <div 
        ref={popoverRef}
        className={`absolute bottom-20 mb-2 w-72 rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#1a658d]/90 ${!isOpen ? "invisible opacity-0" : ""} ${isRTL ? "left-0 origin-bottom-left" : "right-0 origin-bottom-right"}`}
      >
        <div className="mb-3 flex items-center justify-between border-b border-dashed border-slate-200 pb-3 dark:border-slate-700">
          <h3 className="font-bold text-slate-800 dark:text-white">
            {isLoading ? (
              <div className="h-5 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700"></div>
            ) : data ? (
              isRTL ? data.title_ar : data.title_en
            ) : (
              isRTL ? "تحدث مع فرعك" : "Chat with a Branch"
            )}
          </h3>
          <span className="flex h-2 w-2 relative">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        </div>

        <div className="space-y-2">
          {isLoading ? (
            // Skeleton for branches
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg p-3 animate-pulse bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                  <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700"></div>
                </div>
              </div>
            ))
          ) : data?.branches?.length ? (
            // Actual branches mapping
            data.branches.map((branch, index) => (
              <a 
                key={index} 
                href={`https://api.whatsapp.com/send/?phone=${branch.whatsapp_number}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366]">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {/* @ts-ignore */}
                    {isRTL ? (branch.name_ar || branch.nameAr) : (branch.name_en || branch.name)}
                  </span>
                </div>
                <ChevronRight className={`h-4 w-4 text-slate-400 ${isRTL ? "rotate-180" : ""}`} />
              </a>
            ))
          ) : (
            // Fallback
            <a href="https://api.whatsapp.com/send/?phone=967777000000" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366]">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {isRTL ? "المركز الرئيسي" : "Main Center"}
                </span>
              </div>
              <ChevronRight className={`h-4 w-4 text-slate-400 ${isRTL ? "rotate-180" : ""}`} />
            </a>
          )}
        </div>

        <div className="my-3 border-t border-slate-200 dark:border-slate-700" />

        {/* Action Button */}
        {isLoading ? (
          <div className="h-11 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700"></div>
        ) : data?.action_button ? (
          <Link 
              href={isRTL ? data.action_button.link_ar : data.action_button.link_en} 
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#b9292f] py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02] hover:bg-[#a02025]"
              onClick={() => setIsOpen(false)}
          >
            <Home className="h-4 w-4" />
            {isRTL ? data.action_button.text_ar : data.action_button.text_en}
          </Link>
        ) : (
          <Link 
              href={`/${locale}/book`} 
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#b9292f] py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02] hover:bg-[#a02025]"
              onClick={() => setIsOpen(false)}
          >
            <Home className="h-4 w-4" />
            {isRTL ? "حجز زيارة منزلية" : "Book Home Visit"}
          </Link>
        )}
      </div>

      {/* Main Toggle Button */}
      <button
        ref={buttonRef}
        onClick={toggleWidget}
        className={`relative flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 ${isOpen ? "bg-slate-800 dark:bg-white text-white dark:text-slate-900 rotate-90" : "bg-[#1a658d] text-white"}`}
        aria-label="Toggle Contact Menu"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <>
            <MessageCircle className="h-7 w-7" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] font-bold text-white items-center justify-center">1</span>
            </span>
          </>
        )}
      </button>
    </div>
  );
}
