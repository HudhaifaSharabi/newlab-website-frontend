"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Eye, EyeOff, Lock, ShieldCheck, ChevronDown, AlertCircle, X } from "lucide-react";
import clsx from "clsx";

interface PortalAuthProps {
  onLogin: (phone: string, name: string) => void;
}

interface ToastMessage {
  id: number;
  message: string;
  type: "error" | "warning";
}

export function PortalAuth({ onLogin }: PortalAuthProps) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Validation errors for field highlighting
  const [phoneError, setPhoneError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: "error" | "warning" = "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      dismissToast(id);
    }, 5000);
  };

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Clear field errors when user starts typing
  useEffect(() => { if (phone) setPhoneError(false); }, [phone]);
  useEffect(() => { if (password) setPasswordError(false); }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- Front-end Validation ---
    let hasError = false;
    if (!phone.trim()) {
      setPhoneError(true);
      hasError = true;
    }
    if (!password.trim()) {
      setPasswordError(true);
      hasError = true;
    }
    if (hasError) {
      showToast("يرجى تعبئة جميع الحقول المطلوبة.", "warning");
      return;
    }

    setIsLoading(true);

    try {
      // Use the local Next.js proxy route to bypass CORS restrictions.
      // The proxy forwards the request server-to-server to the upstream API.
      const apiUrl = `/api/portal-login?password=${encodeURIComponent(password)}&phone_number=${encodeURIComponent(phone)}`;

      const res = await fetch(apiUrl, {
        method: "GET",
        credentials: "include", // Ensures session cookies are forwarded back
        headers: {
          "Accept": "application/json",
        },
      });

      // Try to parse JSON response
      let data: any = null;
      try {
        data = await res.json();
      } catch {
        throw new Error("استجابة غير متوقعة من الخادم. يرجى المحاولة لاحقاً.");
      }

      // API Response shape: { message: { status: "success"|"error", message: "..." } }
      const result = data?.message;

      if (result?.status === "success") {
        // API structure: { message: { status:"success", data: { full_name, user_type } } }
        const displayName =
          result?.data?.full_name ||  // ✅ Primary path
          data?.full_name ||           // Fallback: top-level full_name
          phone;                       // Last resort: show phone number
        onLogin(phone, String(displayName));
        return;
      }

      // ❌ Error — API returned a structured error message
      const errMsg =
        result?.message ||
        data?.message ||
        "رقم الهاتف أو كلمة المرور غير صحيحة.";

      setPhoneError(true);
      setPasswordError(true);
      throw new Error(typeof errMsg === "string" ? errMsg : "بيانات الدخول غير صحيحة.");

    } catch (err: any) {
      const message = err?.message || "خطأ غير متوقع. يرجى المحاولة لاحقاً.";
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-900 font-sans">

      {/* ─── Toast Container ─── */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-3 w-full max-w-sm px-4 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={clsx(
              "pointer-events-auto w-full flex items-start gap-3 px-4 py-4 rounded-2xl shadow-2xl border backdrop-blur-md text-sm font-semibold animate-in slide-in-from-top-3 duration-300",
              toast.type === "error"
                ? "bg-red-50 dark:bg-red-950/80 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300"
                : "bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300"
            )}
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="flex-1 leading-relaxed">{toast.message}</p>
            <button
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 opacity-60 hover:opacity-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* ─── Right Panel — Login Form ─── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Mobile background bubbles */}
        <div className="lg:hidden absolute top-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-[#1a658d]/5 blur-[80px]"></div>
        
        <div className="w-full max-w-md relative z-10">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <Image src="/logo.png" alt="شعـار نيو لاب" width={160} height={40} className="object-contain dark:brightness-0 dark:invert" />
          </div>

          <div className="mb-10 text-center lg:text-right">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">بوابة النتائج الآمنة</h2>
            <p className="text-slate-500 dark:text-slate-400">يرجى تسجيل الدخول لعرض تقارير المختبر الخاصة بك.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            
            {/* Phone Number Field */}
            <div className="space-y-2 text-right">
              <label className={clsx(
                "text-sm font-semibold transition-colors",
                phoneError ? "text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-300"
              )}>
                رقم الهاتف {phoneError && <span className="text-xs font-normal mr-1">(مطلوب)</span>}
              </label>
              <div className={clsx(
                "relative flex items-center bg-white dark:bg-slate-800 border-2 rounded-xl overflow-hidden transition-all duration-200",
                phoneError
                  ? "border-red-400 dark:border-red-500 ring-4 ring-red-400/10"
                  : focusedField === "phone"
                  ? "border-[#1a658d] ring-4 ring-[#1a658d]/10"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              )}>
                {/* Prefix */}
                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/50 px-4 py-4 border-l-2 border-slate-200 dark:border-slate-700 cursor-default">
                  <span className="text-xl leading-none">🇾🇪</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mr-1" dir="ltr">+967</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 mr-1" />
                </div>
                <input 
                  dir="ltr"
                  type="tel"
                  placeholder="7XX XXX XXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onFocus={() => setFocusedField("phone")}
                  onBlur={() => setFocusedField(null)}
                  className="flex-1 bg-transparent px-4 py-4 font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none text-right"
                />
                {phoneError && (
                  <div className="pl-4 pr-1">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2 text-right">
              <label className={clsx(
                "text-sm font-semibold transition-colors",
                passwordError ? "text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-300"
              )}>
                كلمة السر {passwordError && <span className="text-xs font-normal mr-1">(مطلوب)</span>}
              </label>
              <div className={clsx(
                "relative flex items-center bg-white dark:bg-slate-800 border-2 rounded-xl overflow-hidden transition-all duration-200",
                passwordError
                  ? "border-red-400 dark:border-red-500 ring-4 ring-red-400/10"
                  : focusedField === "password"
                  ? "border-[#1a658d] ring-4 ring-[#1a658d]/10"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              )}>
                <div className="pr-4">
                  <Lock className={clsx("w-5 h-5 transition-colors", passwordError ? "text-red-400" : "text-slate-400")} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="أدخل كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  className="flex-1 bg-transparent px-3 py-4 font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
                />
                {passwordError && (
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                )}
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full relative overflow-hidden group bg-gradient-to-r from-[#1a658d] to-[#124d6d] text-white py-4 rounded-xl font-bold text-lg shadow-[0_8px_20px_-6px_rgba(26,101,141,0.5)] transition-all duration-300 hover:shadow-[0_12px_24px_-6px_rgba(26,101,141,0.6)] hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin text-white/80" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  جاري التحقق...
                </span>
              ) : (
                <span className="relative z-10">تسجيل الدخول</span>
              )}
            </button>
            
          </form>
          
          <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-sm text-slate-500 font-medium">الوصول مقتصر على الأفراد المصرح لهم فقط.</p>
          </div>

        </div>
      </div>

      {/* ─── Left Panel — Branding ─── */}
      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-bl from-[#0c3e5a] to-[#1a658d] flex-col justify-between p-12 overflow-hidden text-right">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cpath d=\\'M54.627 0l1.373 1.373v57.254L54.627 60H5.373L4 58.627V1.373L5.373 0h49.254zm-1.026 58V2H6.399v56h47.202z\\' fill=\\'%23ffffff\\' fill-rule=\\'evenodd\\'/%3E%3C/svg%3E')" }}></div>
        
        {/* Glowing Orbs */}
        <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-white/10 blur-[120px]"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-[#10b981]/20 blur-[120px]"></div>

        <div className="relative z-10 flex items-center justify-start gap-3">
          <div className="bg-white p-3 rounded-2xl shadow-lg">
            <Image src="/logo.png" alt="شعـار نيو لاب" width={140} height={35} className="object-contain" />
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <ShieldCheck className="w-16 h-16 text-[#10b981] mb-6 inline-block" />
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
            نتائج الفحوصات <br/>
          </h1>
          <p className="text-lg text-slate-200/90 leading-relaxed">
            احصل على تقاريرك المخبرية فوراً عبر بوابتنا الآمنة     .
          </p>
        </div>


      </div>
    </div>
  );
}
