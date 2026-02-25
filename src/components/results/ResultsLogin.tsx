"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Lock, Phone, FileText } from "lucide-react";
import clsx from "clsx";

interface ResultsLoginProps {
  onLogin: (sampleId: string, phone: string) => void;
}

export function ResultsLogin({ onLogin }: ResultsLoginProps) {
  const t = useTranslations("results.login");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [sampleId, setSampleId] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ sampleId?: string; phone?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validate = () => {
    const newErrors: { sampleId?: string; phone?: string } = {};

    if (!sampleId) {
      newErrors.sampleId = t("errors.sampleIdRequired");
    } else if (!/^\d{10}$/.test(sampleId)) {
      newErrors.sampleId = t("errors.sampleIdInvalid");
    }

    if (!phone) {
      newErrors.phone = t("errors.phoneRequired");
    } else if (!phone.startsWith("7")) {
      newErrors.phone = t("errors.phoneInvalid");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLogin(sampleId, phone);
    }, 1500);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231a658d' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Gradient Orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-[20%] h-[400px] w-[400px] rounded-full bg-[#1a658d]/10 blur-[100px]" />
        <div className="absolute right-[15%] bottom-[20%] h-[350px] w-[350px] rounded-full bg-[#b9292f]/10 blur-[100px]" />
      </div>

      {/* Login Card */}
      <div className="relative flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-2xl bg-gradient-to-br from-[#1a658d] to-[#b9292f] p-4 shadow-lg">
                <Lock className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">
              {t("title")}
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              {t("subtitle")}
            </p>
          </div>

          {/* Form Card */}
          <form onSubmit={handleSubmit} dir={isRTL ? "rtl" : "ltr"}>
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-800/80">
              <div className="space-y-6">
                {/* Sample ID Input */}
                <div>
                  <label
                    htmlFor="sampleId"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    {t("sampleId")}
                  </label>
                  <div className="relative">
                    <div className={clsx(
                      "absolute inset-y-0 flex items-center px-4",
                      isRTL ? "right-0" : "left-0"
                    )}>
                      <FileText className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="sampleId"
                      type="text"
                      value={sampleId}
                      onChange={(e) => setSampleId(e.target.value)}
                      onFocus={() => setFocusedField("sampleId")}
                      onBlur={() => setFocusedField(null)}
                      placeholder={t("sampleIdPlaceholder")}
                      className={clsx(
                        "w-full rounded-xl border-2 bg-white px-14 py-4 text-slate-900 transition-all duration-300 placeholder:text-slate-400",
                        "focus:outline-none dark:bg-[#1a658d]dark:text-white dark:placeholder:text-slate-500",
                        isRTL ? "text-right" : "text-left",
                        errors.sampleId
                          ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                          : focusedField === "sampleId"
                          ? "border-[#1a658d] ring-4 ring-[#1a658d]/20 shadow-lg shadow-[#1a658d]/10"
                          : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
                      )}
                    />
                  </div>
                  {errors.sampleId && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {errors.sampleId}
                    </p>
                  )}
                </div>

                {/* Phone Input */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    {t("phone")}
                  </label>
                  <div className="relative">
                    <div className={clsx(
                      "absolute inset-y-0 flex items-center px-4",
                      isRTL ? "right-0" : "left-0"
                    )}>
                      <Phone className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onFocus={() => setFocusedField("phone")}
                      onBlur={() => setFocusedField(null)}
                      placeholder={t("phonePlaceholder")}
                      className={clsx(
                        "w-full rounded-xl border-2 bg-white px-14 py-4 text-slate-900 transition-all duration-300 placeholder:text-slate-400",
                        "focus:outline-none dark:bg-[#1a658d]dark:text-white dark:placeholder:text-slate-500",
                        isRTL ? "text-right" : "text-left",
                        errors.phone
                          ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                          : focusedField === "phone"
                          ? "border-[#1a658d] ring-4 ring-[#1a658d]/20 shadow-lg shadow-[#1a658d]/10"
                          : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
                      )}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={clsx(
                    "w-full rounded-xl bg-gradient-to-r from-[#1a658d] to-[#1a658d] py-4 text-base font-semibold text-white shadow-lg transition-all duration-300",
                    "hover:shadow-xl hover:-translate-y-0.5",
                    isLoading
                      ? "cursor-not-allowed opacity-70"
                      : "hover:from-[#1a658d] hover:to-[#145a7a] shadow-[#1a658d]/30"
                  )}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="h-5 w-5 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      {t("loading")}
                    </span>
                  ) : (
                    t("submit")
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Security Note */}
          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            <Lock className="mr-1 inline h-4 w-4" />
            Your data is encrypted and secure
          </p>
        </div>
      </div>
    </div>
  );
}
