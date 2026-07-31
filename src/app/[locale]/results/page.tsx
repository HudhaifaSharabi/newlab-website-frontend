"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { PortalAuth } from "@/components/results/PortalAuth";
import { PortalDashboard } from "@/components/results/PortalDashboard";

interface UserInfo {
  phone: string;
  name: string;
  userType?: string;
}

const STORAGE_KEY = "portal_user_v2";

function isEntryUser(userType?: string): boolean {
  if (!userType) return false;
  const lower = userType.toLowerCase().trim();
  return lower === "entry" || lower === "results entry" || lower.includes("entry");
}

// Synchronous read from localStorage — called before first render
function getStoredUser(): UserInfo | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserInfo;
    return parsed?.name ? parsed : null;
  } catch {
    return null;
  }
}

export default function ResultsPortalPage() {
  const router = useRouter();
  const locale = useLocale();

  // Initialize from localStorage synchronously to avoid any flash
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [ready, setReady] = useState(false);

  // useEffect reads localStorage after first render — avoids SSR warning
  useEffect(() => {
    try {
      const stored = getStoredUser();
      if (stored) {
        if (isEntryUser(stored.userType)) {
          setReady(true);
          router.replace(`/${locale}/chat`);
          return;
        }
        setUserInfo(stored);
      }
    } catch (e) {
      console.error("Error reading stored user:", e);
    } finally {
      setReady(true);
    }
  }, [router, locale]);

  const handleLogin = (phone: string, name: string, userType?: string) => {
    const info: UserInfo = { phone, name, userType };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
    } catch {}

    if (isEntryUser(userType)) {
      router.push(`/${locale}/chat`);
      return;
    }

    setUserInfo(info);
  };

  const handleLogout = async () => {
    // Clear local state immediately — UI responds instantly
    setUserInfo(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.clear();
    } catch {}

    // Call logout API in background (fire-and-forget)
    fetch("/api/portal-logout", {
      method: "GET",
      credentials: "include", // withCredentials: true
    }).catch(() => {});
  };

  // Render centered loading indicator while reading storage instead of returning blank null
  if (!ready) {
    return (
      <div className="w-full min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-100" dir="rtl">
        <div className="w-9 h-9 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-sm font-medium text-slate-400">جاري تحميل بوابة النتائج...</span>
      </div>
    );
  }

  return (
    <main className="w-full min-h-screen bg-slate-50 dark:bg-slate-900">
      {!userInfo ? (
        <PortalAuth onLogin={handleLogin} />
      ) : (
        <PortalDashboard
          userName={userInfo.name}
          userPhone={userInfo.phone}
          userType={userInfo.userType}
          onLogout={handleLogout}
        />
      )}
    </main>
  );
}
