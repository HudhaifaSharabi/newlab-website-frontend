"use client";

import { useEffect } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for diagnostics
    console.error("Caught client-side exception:", error);
  }, [error]);

  const handleReload = () => {
    try {
      // Clear session cache if any
      sessionStorage.clear();
    } catch {}
    
    // Attempt React reset or full page refresh
    reset();
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-slate-900 text-slate-100 p-6">
      <div className="max-w-md w-full bg-slate-800/90 border border-slate-700/80 backdrop-blur-md rounded-2xl p-8 text-center shadow-2xl flex flex-col items-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">
            حدث خطأ غير متوقع في التطبيق
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            حدث تنبيه مؤقت في النظام. يمكنك إعادة تحميل الصفحة للمتابعة كالمعتاد.
          </p>
        </div>

        <button
          onClick={handleReload}
          className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-lg shadow-cyan-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <RefreshCw className="w-4 h-4 animate-spin-hover" />
          <span>إعادة تحديث الصفحة</span>
        </button>
      </div>
    </main>
  );
}
