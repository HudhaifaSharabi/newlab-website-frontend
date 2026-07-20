"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useTheme } from "next-themes";
import { RoleSelector } from "@/components/chat/RoleSelector";
import { PatientChatView } from "@/components/chat/PatientChatView";
import { LabChatView } from "@/components/chat/LabChatView";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

type Role = "center" | "lab" | "entry" | null;

function ChatPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roleParam = searchParams.get("role");

  const { theme, setTheme, resolvedTheme } = useTheme();
  const [role, setRole] = useState<Role>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(resolvedTheme === "dark" || document.documentElement.classList.contains("dark"));
  }, [resolvedTheme]);

  useEffect(() => {
    let target: Role = "lab";
    try {
      const stored = localStorage.getItem("portal_user_v2");
      const currentUser = localStorage.getItem("newlab_current_user");

      // 🚨 التحقق الفوري: إذا لم يكن هناك مستخدم في الذاكرة (سجل خروج أو لم يسجل بعد)، يتم التوجيه لصفحة الدخول فوراً
      if (!stored && !currentUser) {
        console.warn("=== [Auth Guard] No active login in localStorage. Redirecting to login (/ar/results) ===");
        router.replace("/ar/results");
        return;
      }

      // التحقق عبر السيرفر من صلاحية الجلسة (cookie session)
      fetch("/api/portal-session", { credentials: "include", cache: "no-store" })
        .then(r => r.json())
        .then(data => {
          if (!data?.authenticated || data?.user === "Guest" || !data?.user) {
            console.warn("=== [Auth Guard] Backend session expired or Guest. Redirecting to login ===");
            localStorage.removeItem("portal_user_v2");
            localStorage.removeItem("newlab_current_user");
            router.replace("/ar/results");
          }
        })
        .catch(() => {});

      console.log("=== [ChatPageContent Debug] Raw portal_user_v2 ===", stored);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log("=== [ChatPageContent Debug] Parsed user info ===", parsed);
        const st = (parsed?.userType || "").toLowerCase().trim();
        if (
          st === "center" ||
          st === "patient" ||
          st === "lab center" ||
          st === "lab patient" ||
          st.includes("center") ||
          st.includes("patient")
        ) {
          target = "center";
        } else {
          target = "lab";
        }
      } else if (roleParam === "center" || roleParam === "Lab Center" || roleParam === "Patient") {
        target = "center";
      } else {
        target = "lab";
      }
    } catch (err) {
      console.error("=== [ChatPageContent Debug] Error reading localStorage ===", err);
    }
    console.log("=== [ChatPageContent Debug] Resolved Role ===", target);
    setRole(target);
  }, [roleParam, router]);

  const handleLogout = async () => {
    try {
      // Remove user identity
      localStorage.removeItem("portal_user_v2");
      localStorage.removeItem("newlab_current_user");
      sessionStorage.clear();

      // Clear all chat-related caches so next user never sees stale messages
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith("newlab_chat") ||
          key.startsWith("newlab_patient")
        )) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch {}

    fetch("/api/portal-logout", {
      method: "GET",
      credentials: "include",
    }).catch(() => {});

    router.replace("/ar/results");
  };

  const toggleTheme = () => {
    const nextTheme = isDark ? "light" : "dark";
    setTheme(nextTheme);
    try {
      localStorage.setItem("theme", nextTheme);
    } catch {}
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
    setMenuOpen(false);
  };

  const selectRole = (r: Role) => {
    setRole(r);
    if (r) {
      router.push(`?role=${r}`);
    } else {
      router.push(`?`);
    }
  };

  if (!role) {
    return <RoleSelector onSelectRole={selectRole} />;
  }

  return (
    <main className="w-full h-screen h-[100dvh] bg-slate-50 dark:bg-slate-950 flex flex-col" dir="rtl">
      {/* Header Full Width */}
      <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex justify-between items-center z-50 shadow-sm flex-shrink-0">
        {/* Header Title based on user role */}
        {role === "lab" || role === "entry" ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-emerald-400 text-lg shadow-sm">
              💬
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-800 dark:text-slate-100 text-base md:text-lg">
                بوابة مراسلة المراكز الطبية
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                إدارة المحادثات والاستفسارات المباشرة
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-bl from-[#1a658d] to-[#124d6d] flex items-center justify-center text-white font-bold text-base shadow-sm">
              م
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-800 dark:text-slate-100 text-base md:text-lg">
                المختبر الرئيسي
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                متصل الآن
              </span>
            </div>
          </div>
        )}

        {/* Right side: Menu Button */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <svg className="w-6 h-6 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}></div>
              <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <button
                  onClick={toggleTheme}
                  className="w-full text-right px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
                >
                  <span className="text-lg">{isDark ? "☀️" : "🌙"}</span>
                  <span className="font-semibold">{isDark ? "الوضع الفاتح" : "الوضع الداكن"}</span>
                </button>
                {role !== "lab" && (
                  <Link
                    href="/ar/results"
                    className="w-full text-right px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="text-lg">📊</span>
                    <span className="font-semibold">صفحة النتائج</span>
                  </Link>
                )}
                <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full text-right px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-3 transition-colors font-semibold"
                >
                  <span className="text-lg">🚪</span>
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex w-full">
        {role === "center" && <PatientChatView role={role} />}
        {(role === "lab" || role === "entry") && <LabChatView />}
      </div>
    </main>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}
