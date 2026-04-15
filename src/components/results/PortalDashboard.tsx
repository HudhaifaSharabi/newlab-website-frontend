"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { 
  Search, Calendar, MapPin, Download, FileText, User, 
  LogOut, ChevronDown, CheckSquare, Square, 
  Eye, EyeOff, Activity, Lock,
  Moon, Sun, X, ChevronRight, ChevronLeft,
  AlertCircle, RefreshCw
} from "lucide-react";
import clsx from "clsx";

interface PortalDashboardProps {
  onLogout: () => void;
  userName: string;
  userPhone: string;
}

// ─── API Report shape (matches Frappe get_results response) ───────────────
interface LabReport {
  name: string;         // Visit ID e.g. "VIS-994812"
  patient_name: string;
  branch: string;
  result_date: string;  // ISO date "2026-10-24"
  is_read: boolean;
  result_pdf: string;   // URL or file path to PDF
}

const DEFAULT_BRANCH = "كل الفروع";

// Format ISO date to Arabic display
function formatDate(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("ar-SA", {
      year: "numeric", month: "long", day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function PortalDashboard({ onLogout, userName, userPhone }: PortalDashboardProps) {
  // ─── Data State ───────────────────────────────────────────────────────────
  const [reports, setReports] = useState<LabReport[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ─── UI State ─────────────────────────────────────────────────────────────
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [isZipLoading, setIsZipLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  // Default ticker messages in case API fails
  const [tickerMessages, setTickerMessages] = useState<string[]>([
    "🧪 نتائج فحوصاتك جاهزة — يمكنك عرضها وتحميلها بسهولة",
    "🔒 بياناتك محمية بأعلى معايير الخصوصية",
    "📅 مواعيد عمل مختبر نيو لاب: من السبت إلى الخميس، 8 صباحاً — 8 مساءً",
    "📞 للاستفسار تواصل معنا: 967-XXX-XXXX+",
    "✨ شكراً لثقتكم بمختبر نيو لاب — نسعى دائماً لتقديم أفضل خدمة",
  ]);

  const showToast = (message: string, type: "success" | "info" | "error" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  // Tracks which report card is currently loading (view or download)
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // ─── Filters ──────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(DEFAULT_BRANCH);

  // Default date range: yesterday → today
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
  });
  const [toDate, setToDate] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10); // today
  });
  const [branches, setBranches] = useState<string[]>([DEFAULT_BRANCH]);

  // ─── Pagination ───────────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // ─── Change Password ──────────────────────────────────────────────────────
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  // Visibility and specific error states
  const [showPwCurrent, setShowPwCurrent] = useState(false);
  const [showPwNew, setShowPwNew] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);
  const [pwCurrentError, setPwCurrentError] = useState(false);
  const [pwNewError, setPwNewError] = useState(false);
  const [pwConfirmError, setPwConfirmError] = useState(false);

  // ─── Theme ────────────────────────────────────────────────────────────────
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // ─── Fetch Branches on Mount ──────────────────────────────────────────────
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const res = await fetch("/api/portal-branches", { credentials: "include" });
        const data = await res.json();
        const raw = data?.message?.data ?? data?.message ?? [];
        if (Array.isArray(raw) && raw.length > 0) {
          const names: string[] = raw.map((b: any) =>
            typeof b === "string" ? b : (b?.branch_name ?? b?.name ?? String(b))
          );
          setBranches([DEFAULT_BRANCH, ...names]);
        }
      } catch { /* Fail silently */ }
    };

    const loadTicker = async () => {
      try {
        const res = await fetch("/api/portal-ticker");
        const data = await res.json();
        // Handle: { message: { data: [...] } } OR { message: [...] }
        let msgs: string[] = [];
        if (Array.isArray(data?.message?.data)) {
          msgs = data.message.data;
        } else if (Array.isArray(data?.message)) {
          msgs = data.message;
        } else if (Array.isArray(data?.data)) {
          msgs = data.data;
        }

        if (msgs.length > 0) {
          setTickerMessages(msgs);
        }
      } catch { /* Fallback to defaults */ }
    };

    loadBranches();
    loadTicker();
  }, []);

  // ─── Fetch Reports from Real API ──────────────────────────────────────────
  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);

    const params = new URLSearchParams({
      limit_start: String((currentPage - 1) * itemsPerPage),
      limit_page_length: String(itemsPerPage),
    });
    if (searchQuery.trim())                                     params.set("search_term", searchQuery.trim());
    if (selectedBranch !== DEFAULT_BRANCH)                      params.set("branch", selectedBranch);
    if (fromDate)                                               params.set("from_date", fromDate);
    if (toDate)                                                 params.set("to_date", toDate);

    try {
      const res = await fetch(`/api/portal-results?${params.toString()}`, {
        credentials: "include",
      });

      // ─ Session check: 401/403 = sid expired or empty → force logout
      if (res.status === 401 || res.status === 403) {
        setSessionExpired(true);
        setTimeout(() => onLogout(), 2200);
        return;
      }

      const data = await res.json();

      // Frappe sometimes returns 200 with AuthenticationError in body
      if (data?.exc_type === "AuthenticationError" || data?.exc?.includes("AuthenticationError")) {
        setSessionExpired(true);
        setTimeout(() => onLogout(), 2200);
        return;
      }

      if (data?.message?.status === "success") {
        setReports(data.message.data ?? []);
        setTotalCount(data.message.total_count ?? 0);
      } else if (data?.message?.status === "error") {
        setFetchError(data.message.message ?? "حدث خطأ أثناء جلب البيانات.");
      } else {
        setFetchError("استجابة غير متوقعة من الخادم.");
      }
    } catch {
      setFetchError("تعذر الاتصال بالخادم. يرجى التحقق من اتصالك.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, selectedBranch, fromDate, toDate, onLogout]);

  // Refetch when filters/page change — debounce search input
  useEffect(() => {
    const timer = setTimeout(fetchReports, searchQuery ? 500 : 0);
    return () => clearTimeout(timer);
  }, [fetchReports, searchQuery]);

  // Reset page when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedBranch, fromDate, toDate, itemsPerPage]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // ─── Selection ────────────────────────────────────────────────────────────
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    const allIds = reports.map(r => r.name);
    const allSelected = allIds.every(id => selectedIds.has(id));
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allSelected && allIds.length > 0) allIds.forEach(id => next.delete(id));
      else allIds.forEach(id => next.add(id));
      return next;
    });
  };

  // ─── Mark Report as Read (fire-and-forget + optimistic UI) ──────────────
  const markAsRead = (reportName: string) => {
    // Optimistic update: flip is_read immediately in local state
    setReports(prev =>
      prev.map(r => r.name === reportName ? { ...r, is_read: true } : r)
    );
    // Fire API in background
    fetch(`/api/portal-mark-read?result_name=${encodeURIComponent(reportName)}`, {
      credentials: "include",
    }).catch(() => {}); // silent fail — not critical
  };

  // ─── PDF Actions ──────────────────────────────────────────────────────────
  // FAST: point iframe directly at proxy URL — browser streams PDF without buffering
  const handleViewPdf = (pdfPath: string, reportName: string) => {
    if (!reportName) return;
    markAsRead(reportName);
    showToast("جاري فتح التقرير...", "info");
    setPdfPreviewUrl(`/api/portal-file?result_name=${encodeURIComponent(reportName)}`);
  };

  const closePdfPreview = () => setPdfPreviewUrl(null);

  // FAST: trigger download via anchor href — browser handles it directly
  const handleDownload = (report: LabReport) => {
    if (!report.name) return;
    markAsRead(report.name);
    showToast("جاري بدء التحميل...", "info");
    const a = document.createElement("a");
    a.href = `/api/portal-file?result_name=${encodeURIComponent(report.name)}&download=1`;
    a.download = `NewLab_${report.name}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleBulkDownload = async () => {
    if (selectedIds.size === 0 || isZipLoading) return;

    setIsZipLoading(true);
    showToast("جاري تجهيز الملف المضغوط...", "info");
    
    try {
      const resultNames = Array.from(selectedIds);
      const res = await fetch("/api/portal-bulk-zip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ result_names: resultNames }),
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        showToast(err?.message ?? "فشل تحميل الملف.", "error");
        return;
      }

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `NewLab_Results_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
      setSelectedIds(new Set());
      showToast("بدأ التحميل بنجاح", "success");

    } catch {
      showToast("تعذر الاتصال بالخادم.", "error");
    } finally {
      setIsZipLoading(false);
    }
  };

  // ─── Change Password ──────────────────────────────────────────────────────
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);
    setPwCurrentError(false);
    setPwNewError(false);
    setPwConfirmError(false);

    if (!pwCurrent) { setPwCurrentError(true); setPwError("يرجى تعبئة جميع الحقول."); return; }
    if (!pwNew) { setPwNewError(true); setPwError("يرجى تعبئة جميع الحقول."); return; }
    if (!pwConfirm) { setPwConfirmError(true); setPwError("يرجى تعبئة جميع الحقول."); return; }

    if (pwNew !== pwConfirm) {
      setPwNewError(true);
      setPwConfirmError(true);
      setPwError("كلمتا المرور غير متطابقتين.");
      return;
    }
    if (pwNew.length < 6) {
      setPwNewError(true);
      setPwError("يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.");
      return;
    }

    setPwLoading(true);
    try {
       const params = new URLSearchParams({

        old_password: pwCurrent,

        new_password: pwNew,

      });



      const res = await fetch(`/api/portal-change-password?${params.toString()}`, {

        method: "GET",

      });
      const data = await res.json();

      if (res.ok && data.message?.status !== "error") {
        setPwSuccess(true);
        showToast("تم تغيير كلمة المرور بنجاح!", "success");
        setTimeout(() => {
          setPasswordModalOpen(false);
          setPwSuccess(false);
          setPwCurrent("");
          setPwNew("");
          setPwConfirm("");
        }, 1500);
      } else {
        setPwError(data.message?.message || data.message || "فشل تغيير كلمة المرور. يرجى التأكد من كلمة المرور الحالية.");
      }
    } catch (err) {
      setPwError("تعذر الاتصال بالخادم. يرجى المحاولة لاحقاً.");
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">

      {/* ─── Toast Notification ─── */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={clsx(
            "px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 font-bold text-sm backdrop-blur-md",
            toast.type === "success" && "bg-emerald-500/90 text-white border-emerald-400",
            toast.type === "info" && "bg-[#1a658d]/90 text-white border-blue-400",
            toast.type === "error" && "bg-red-500/90 text-white border-red-400"
          )}>
            {toast.type === "info" && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {toast.message}
          </div>
        </div>
      )}

      {/* ─── Session Expired Overlay ─── */}
      {sessionExpired && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-10 shadow-2xl text-center max-w-sm mx-4 border border-slate-200 dark:border-slate-700">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">انتهت صلاحية الجلسة</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              انتهت جلستك أو أنك غير مسجل دخول. سيتم توجيهك لصفحة تسجيل الدخول...
            </p>
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
              <div className="h-1.5 bg-[#1a658d] rounded-full animate-[width_2.2s_linear_forwards]" style={{ width: "100%", animation: "shrink 2.2s linear forwards" }}></div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Announcement Ticker ─── */}
      <div 
        className="bg-gradient-to-r from-[#0c3e5a] via-[#1a658d] to-[#0c3e5a] text-white text-sm font-semibold overflow-hidden py-2 select-none"
        style={{ direction: 'ltr' }} // Force LTR for the scrolling container logic
      >
        <div 
          key={tickerMessages.join('')} // Reset animation if content changes to recalculate width
          className="flex w-max whitespace-nowrap hover:[animation-play-state:paused] cursor-default" 
          style={{ 
            animation: 'marquee-infinite 120s linear infinite'
          }}
        >
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes marquee-infinite {
              0% { transform: translate3d(0, 0, 0); }
              100% { transform: translate3d(-50%, 0, 0); }
            }
          `}} />
          {/* Using exactly 2 identical sets for a perfect 50% loop */}
          {[1, 2].map((group) => (
            <div key={group} className="flex shrink-0 items-center">
              {/* Internal repeat to ensure minimum width coverage */}
              {Array.from({ length: 4 }).flatMap(() => tickerMessages).map((msg, i) => (
                <div key={i} dir="rtl" className="flex items-center gap-6 px-16">
                  <span className="shrink-0">{msg}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 shadow-[0_0_8px_rgba(255,255,255,0.5)]"></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Header ─── */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="شعـار نيو لاب" width={80} height={35} className="object-contain dark:brightness-0 dark:invert" />
          </div>

          <div className="text-sm font-medium text-slate-500 dark:text-slate-400 hidden xl:block">
            مرحباً بعودتك، <span className="text-slate-900 dark:text-white font-bold">{userName}</span>
          </div>

          <div className="flex items-center gap-4">
            {mounted && (
              <button onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition">
                {resolvedTheme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}

            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                <div className="w-8 h-8 rounded-full bg-gradient-to-bl from-[#1a658d] to-[#124d6d] flex items-center justify-center text-white font-bold text-xs">
                  {userName.charAt(0)}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>

              {profileOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-50 text-right">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{userName}</p>
                    <p className="text-xs text-slate-500" dir="ltr">{userPhone}</p>
                  </div>
                  <button onClick={() => { setProfileOpen(false); setPasswordModalOpen(true); }}
                    className="w-full flex justify-end flex-row-reverse items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium">
                    تغيير كلمة المرور <Lock className="w-4 h-4 ml-auto" />
                  </button>
                  <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                  <button onClick={onLogout}
                    className="w-full flex justify-end flex-row-reverse items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition font-medium">
                    تسجيل الخروج <LogOut className="w-4 h-4 ml-auto" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ─── KPI Banner ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">إجمالي التقارير</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{isLoading ? "—" : totalCount}</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-[#124d6d] to-[#1a658d] p-6 rounded-2xl shadow-lg flex items-center gap-4 text-white relative overflow-hidden">
            <div className="absolute left-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="p-3 bg-white/20 rounded-xl"><Activity className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-white/80">غير مقروءة</p>
              <p className="text-2xl font-bold">{isLoading ? "—" : reports.filter(r => !r.is_read).length}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">الصفحة الحالية</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{isLoading ? "—" : reports.length}</p>
            </div>
          </div>
        </div>

        {/* ─── Filters Bar ─── */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col lg:flex-row gap-4 justify-between items-center sticky top-16 z-30">
          <div className="flex w-full lg:w-auto items-center gap-3">
            <button onClick={toggleAll} disabled={reports.length === 0}
              title="تحديد الكل في هذه الصفحة"
              className="p-2 text-slate-400 hover:text-[#1a658d] transition disabled:opacity-50">
              {reports.length > 0 && reports.every(r => selectedIds.has(r.name))
                ? <CheckSquare className="w-6 h-6 text-[#1a658d]" />
                : <Square className="w-6 h-6" />}
            </button>
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="text" placeholder="ابحث برقم الزيارة أو اسم المريض..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-[#1a658d] focus:ring-1 focus:ring-[#1a658d] dark:text-white" />
            </div>
          </div>

          <div className="flex w-full lg:w-auto gap-3 items-center overflow-x-auto pb-2 lg:pb-0">
            {/* Date Range */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shrink-0">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex items-center gap-2">
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
                  className="bg-transparent text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 outline-none cursor-pointer" />
                <span className="text-slate-400 text-sm">-</span>
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
                  className="bg-transparent text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 outline-none cursor-pointer" />
              </div>
            </div>

            {/* Branch */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shrink-0">
              <MapPin className="w-4 h-4 text-slate-400" />
              <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}
                className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 outline-none w-32 cursor-pointer dark:bg-slate-900">
                {branches.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {/* Bulk Download */}
            <button
              onClick={handleBulkDownload}
              disabled={selectedIds.size === 0 || isZipLoading}
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-[#1a658d] hover:text-white text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-100 disabled:hover:text-slate-700 shrink-0 min-w-[110px] justify-center"
            >
              {isZipLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  جاري التحضير...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> تحميل ZIP ({selectedIds.size})
                </>
              )}
            </button>

            {/* Refresh */}
            <button onClick={fetchReports} disabled={isLoading}
              title="تحديث"
              className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:text-[#1a658d] transition disabled:opacity-50">
              <RefreshCw className={clsx("w-4 h-4", isLoading && "animate-spin")} />
            </button>
          </div>
        </div>

        {/* ─── Error State ─── */}
        {fetchError && !isLoading && (
          <div className="flex items-center gap-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 p-5 rounded-2xl font-semibold">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <p>{fetchError}</p>
            <button onClick={fetchReports} className="mr-auto text-sm underline opacity-70 hover:opacity-100">
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* ─── Reports Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: itemsPerPage > 6 ? 6 : itemsPerPage }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm animate-pulse flex flex-col h-[260px]">
                <div className="flex justify-between mb-6">
                  <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                  <div className="w-16 h-6 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-md w-1/2"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-1/3"></div>
                </div>
                <div className="flex gap-2 mb-auto">
                  <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-24"></div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                  <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                </div>
              </div>
            ))
          ) : reports.length > 0 ? (
            reports.map((report) => (
              <div key={report.name} className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-[#1a658d]/30 transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
                <div className="p-6 flex-1 flex flex-col">
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-4">
                    <button onClick={() => toggleSelection(report.name)}
                      className="text-slate-300 hover:text-[#1a658d] transition">
                      {selectedIds.has(report.name)
                        ? <CheckSquare className="w-6 h-6 text-[#1a658d]" />
                        : <Square className="w-6 h-6" />}
                    </button>
                    {!report.is_read && (
                      <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">
                        جديد
                      </span>
                    )}
                  </div>

                  {/* Visit ID + Date */}
                  <div className="mb-5">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1" dir="rtl"> 
                       
                      <User className="w-5 h-5 text-slate-400" /> {report.patient_name} 
                    </h3>
                    <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-slate-400" /> {formatDate(report.result_date)}
                    </p>
                  </div>

                  {/* Patient + Branch */}
                  <div className="space-y-3 mb-5 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
                   
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" /> {report.branch || "—"}
                    </p>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-b-2xl">
                  {/* View Button */}
                  <button
                    onClick={() => handleViewPdf(report.result_pdf, report.name)}
                    disabled={!report.result_pdf || loadingId === report.name}
                    className="flex justify-center items-center gap-2 text-sm font-bold text-[#1a658d] dark:text-white border-2 border-[#1a658d]/20 hover:border-[#1a658d] bg-white dark:bg-slate-700 py-2.5 rounded-xl transition-all hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loadingId === report.name ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                    {loadingId === report.name ? "جاري التحميل..." : "عرض"}
                  </button>

                  {/* Download Button */}
                  <button
                    onClick={() => handleDownload(report)}
                    disabled={!report.result_pdf || loadingId === report.name}
                    className="flex justify-center items-center gap-2 text-sm font-bold text-white bg-[#1a658d] hover:bg-[#124d6d] py-2.5 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(26,101,141,0.39)] hover:shadow-[0_6px_20px_rgba(26,101,141,0.23)] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loadingId === report.name ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {loadingId === report.name ? "جاري..." : "تحميل"}
                  </button>
                </div>
              </div>
            ))
          ) : !fetchError ? (
            <div className="col-span-1 md:col-span-2 xl:col-span-3 flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full border-8 border-white dark:border-slate-900 mb-6 shadow-xl">
                <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">لا توجد نتائج</h3>
              <p className="text-slate-500 max-w-md">لم يتم العثور على تقارير. يرجى تجربة تعديل الفلاتر.</p>
            </div>
          ) : null}
        </div>

        {/* ─── Pagination ─── */}
        {!isLoading && totalCount > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
              <span>عرض</span>
              <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 outline-none text-slate-700 dark:text-slate-300 cursor-pointer focus:border-[#1a658d] transition">
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={50}>50</option>
              </select>
              <span>نتيجة من أصل {totalCount}</span>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:text-[#1a658d] disabled:opacity-50 disabled:cursor-not-allowed transition">
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="flex flex-wrap items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button key={i} onClick={() => setCurrentPage(i + 1)}
                      className={clsx(
                        "w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition",
                        currentPage === i + 1
                          ? "bg-[#1a658d] text-white shadow-md shadow-[#1a658d]/30"
                          : "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      )}>
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:text-[#1a658d] disabled:opacity-50 disabled:cursor-not-allowed transition">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* ─── PDF Modal ─── */}
      {pdfPreviewUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">معاينة التقرير الطبي</h3>
              <button onClick={closePdfPreview}
                className="p-2 text-slate-500 bg-slate-200 dark:bg-slate-700 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 relative bg-slate-100 dark:bg-slate-900 rounded-b-2xl overflow-hidden">
              <iframe src={pdfPreviewUrl} className="absolute inset-0 w-full h-full border-none" title="معاينة التقرير" />
            </div>
          </div>
        </div>
      )}

      {/* ─── Change Password Modal ─── */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#1a658d]" /> تغيير كلمة المرور
              </h3>
              <button onClick={() => setPasswordModalOpen(false)}
                className="p-2 text-slate-500 bg-slate-200 dark:bg-slate-700 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleChangePasswordSubmit} className="p-6 space-y-4">
              {pwError && <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm font-semibold text-center border border-red-200">{pwError}</div>}
              {pwSuccess && <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl text-sm font-semibold text-center border border-emerald-200">تم تغيير كلمة المرور بنجاح!</div>}
              
              {[
                { 
                  label: "كلمة المرور الحالية", 
                  val: pwCurrent, 
                  set: (v: string) => { setPwCurrent(v); setPwCurrentError(false); }, 
                  ph: "أدخل كلمة المرور الحالية",
                  show: showPwCurrent,
                  toggle: () => setShowPwCurrent(!showPwCurrent),
                  hasError: pwCurrentError
                },
                { 
                  label: "كلمة المرور الجديدة", 
                  val: pwNew, 
                  set: (v: string) => { setPwNew(v); setPwNewError(false); }, 
                  ph: "أدخل كلمة المرور الجديدة",
                  show: showPwNew,
                  toggle: () => setShowPwNew(!showPwNew),
                  hasError: pwNewError
                },
                { 
                  label: "تأكيد كلمة المرور الجديدة", 
                  val: pwConfirm, 
                  set: (v: string) => { setPwConfirm(v); setPwConfirmError(false); }, 
                  ph: "أعد إدخال كلمة المرور",
                  show: showPwConfirm,
                  toggle: () => setShowPwConfirm(!showPwConfirm),
                  hasError: pwConfirmError
                },
              ].map(({ label, val, set, ph, show, toggle, hasError }) => (
                <div key={label} className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>
                  <div className="relative">
                    <input 
                      type={show ? "text" : "password"} 
                      value={val} 
                      onChange={(e) => set(e.target.value)} 
                      placeholder={ph}
                      className={clsx(
                        "w-full bg-slate-50 dark:bg-slate-900 border rounded-xl pl-12 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-1 dark:text-white transition-all",
                        hasError 
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
                          : "border-slate-200 dark:border-slate-700 focus:border-[#1a658d] focus:ring-[#1a658d]"
                      )} 
                    />
                    <button
                      type="button"
                      onClick={toggle}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                    >
                      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
              <button type="submit" disabled={pwLoading || pwSuccess}
                className="w-full mt-6 flex justify-center items-center gap-2 text-white bg-[#1a658d] hover:bg-[#124d6d] py-3.5 rounded-xl text-sm font-bold transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed">
                {pwLoading
                  ? <><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg> جاري الحفظ...</>
                  : "حفظ التغييرات"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
