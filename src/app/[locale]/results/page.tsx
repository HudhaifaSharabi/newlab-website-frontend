"use client";

import AlternativeNavbar from "@/components/nav/AlternativeNavbar";
import { NewLabFooter } from "@/components/footer/NewLabFooter";
import { Hammer, Pickaxe, Settings } from "lucide-react";
import { useLocale } from "next-intl";

export default function ResultsPage() {
  const locale = useLocale();
  const isRTL = locale === "ar";

  return (
    <>
      <AlternativeNavbar />
      <div className="flex min-h-[80vh] w-full flex-col items-center justify-center bg-slate-50 px-6 py-24 text-center dark:bg-slate-900">
        <div className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 shadow-inner">
          <Settings className="h-12 w-12 animate-[spin_4s_linear_infinite] text-[#1a658d]" />
          <Hammer className="absolute bottom-2 right-2 h-6 w-6 text-slate-500" />
        </div>
        
        <h1 className="mb-4 text-4xl font-extrabold text-slate-900 md:text-5xl dark:text-white">
          {isRTL ? "تحت الصيانة" : "Under Maintenance"}
        </h1>
        
        <p className="mx-auto max-w-lg text-lg text-slate-600 dark:text-slate-400">
          {isRTL 
            ? "نعمل حالياً على تطوير بوابة النتائج لتقديم تجربة أسرع وأكثر أماناً. نعتذر عن هذا الإزعاج المؤقت، يرجى العودة لاحقاً."
            : "We are currently upgrading our results portal to provide a faster and more secure experience. We apologize for the temporary inconvenience."}
        </p>

        <a 
          href={`/${locale}`}
          className="mt-8 rounded-full bg-[#1a658d] px-8 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          {isRTL ? "العودة للرئيسية" : "Return to Home"}
        </a>
      </div>
      <NewLabFooter />
    </>
  );
}
