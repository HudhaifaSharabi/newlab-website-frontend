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
    const stored = getStoredUser();
    if (stored) {
      if (isEntryUser(stored.userType)) {
        router.replace(`/${locale}/chat`);
        return;
      }
      setUserInfo(stored);
    }
    setReady(true);
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

  // Don't render anything until localStorage is read (one synchronous frame)
  if (!ready) return null;

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
