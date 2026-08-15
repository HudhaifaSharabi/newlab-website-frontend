"use client";
import React, { useEffect, useState } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";

export default function NotificationBanner({ userIdentifier }: { userIdentifier?: string }) {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    try {
      const p = await Notification.requestPermission();
      setPermission(p);
      if (p === "granted" && userIdentifier) {
        // Trigger firebase token generation
        import("@/lib/firebase").then(({ requestNotificationPermission }) => {
          requestNotificationPermission(userIdentifier).then(token => {
            if (token) localStorage.setItem("fcm_sender_token", token);
          });
        });
      }
    } catch (e) {
      console.error("Failed to request permission", e);
    }
  };

  if (!mounted || !("Notification" in window)) return null;

  if (permission === "granted") {
    return (
      <div 
        title="الإشعارات مفعلة"
        className="bg-green-500/10 text-green-600 dark:text-green-400 p-2 rounded-full border border-green-500/20 shadow-sm flex items-center justify-center pointer-events-none"
      >
        <Bell className="w-5 h-5" />
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <button 
        onClick={() => alert("لقد قمت بحظر الإشعارات من المتصفح. يرجى الدخول إلى إعدادات المتصفح (أيقونة القفل بجانب الرابط) والسماح بالإشعارات.")}
        title="الإشعارات محظورة"
        className="bg-red-500 text-white p-2 rounded-full shadow-sm flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
      >
        <BellOff className="w-5 h-5" />
      </button>
    );
  }

  // default / not requested yet
  return (
    <button 
      onClick={requestPermission}
      title="انقر لتفعيل الإشعارات"
      className="bg-amber-500 text-white px-3 py-1.5 rounded-full shadow-sm flex items-center justify-center gap-2 hover:bg-amber-600 transition-colors cursor-pointer animate-pulse"
    >
      <BellRing className="w-4 h-4" />
      <span className="text-xs font-bold hidden md:inline">تفعيل الإشعارات</span>
    </button>
  );
}
