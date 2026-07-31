"use client";

import React, { useState, useEffect } from "react";
import { Bell, X, CheckCircle2, AlertCircle } from "lucide-react";
import { requestNotificationPermission } from "@/lib/firebase";

export default function NotificationBanner({ userIdentifier }: { userIdentifier?: string }) {
  const [showBanner, setShowBanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [isDenied, setIsDenied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        setEnabled(true);
        setShowBanner(false);
      } else if (Notification.permission === "denied") {
        setIsDenied(true);
        setShowBanner(true);
      } else {
        setShowBanner(true);
      }
    }
  }, []);

  const handleEnable = async () => {
    if (isDenied) {
      alert("الإشعارات محظورة حالياً في متصفحك.\nيرجى الضغط على أيقونة القفل (🔒) بجانب عنوان الموقع أعلى المتصفح، ثم تفعيل خيار (Notifications / الإشعارات).");
      return;
    }

    setLoading(true);
    try {
      const token = await requestNotificationPermission(userIdentifier);
      if (token) {
        setEnabled(true);
        setShowBanner(false);
      } else {
        if (typeof window !== "undefined" && Notification.permission === "denied") {
          setIsDenied(true);
        }
      }
    } catch (e) {
      console.error("Failed to enable notifications:", e);
    } finally {
      setLoading(false);
    }
  };

  if (enabled || !showBanner) return null;

  return (
    <div className="w-full bg-gradient-to-r from-cyan-900 via-[#1a658d] to-slate-900 text-white px-4 py-2.5 border-b border-cyan-500/40 flex items-center justify-between shadow-lg animate-in fade-in duration-300 z-50 flex-shrink-0" dir="rtl">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
          <Bell className="w-4 h-4 animate-bounce" />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm">
          <span className="font-bold">تفعيل الإشعارات المباشرة:</span>
          <span className="text-slate-300 text-xs">
            {isDenied
              ? "الإشعارات محظورة في متصفحك. اضغط لتصفح كيفية السماح بها."
              : "احصل على تنبيهات فورية عند وصول نتائجك أو رسائل محادثة جديدة"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleEnable}
          disabled={loading}
          className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
          ) : isDenied ? (
            <AlertCircle className="w-3.5 h-3.5" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5" />
          )}
          <span>{loading ? "جاري التفعيل..." : isDenied ? "كيفية التفعيل 🔒" : "تفعيل الإشعارات"}</span>
        </button>

        <button
          onClick={() => setShowBanner(false)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          title="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
