"use client";

import React, { useState } from "react";

export type MessageStatus = "sending" | "sent" | "read";

export interface MessageData {
  id: string;
  text?: string;
  fileName?: string;
  fileSize?: string;
  isPdf?: boolean;
  attachmentUrl?: string;
  reportName?: string;
  time: string;
  rawTimestamp?: number;
  isOutgoing: boolean;
  status?: MessageStatus;
  isUrgent?: boolean | number;
}

interface Props {
  message: MessageData;
}

export function ChatMessage({ message }: Props) {
  const { text, fileName, fileSize, isPdf, attachmentUrl, reportName, time, isOutgoing, status, isUrgent } = message;
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    const targetUrl = reportName || attachmentUrl || fileName;
    if (!targetUrl || isDownloading) return;
    const directUrl = attachmentUrl || (targetUrl.startsWith("http") || targetUrl.startsWith("/") || targetUrl.startsWith("blob:") ? targetUrl : "");
    
    setIsDownloading(true);
    try {
      // 1. إذا كان الملف محلياً (blob/data)
      if (directUrl && (directUrl.startsWith("blob:") || directUrl.startsWith("data:"))) {
        const a = document.createElement("a");
        a.href = directUrl;
        a.download = fileName || (isPdf ? "report.pdf" : "attachment");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setIsDownloading(false);
        return;
      }

      // 2. جميع المرفقات والتقارير في السحابة (R2) يجب أن تمر عبر وسيط اللوحة واستدعاء download_single_pdf
      const targetName = reportName || attachmentUrl || fileName || targetUrl;
      const fetchUrl = `/api/portal-file?result_name=${encodeURIComponent(targetName)}&url=${encodeURIComponent(attachmentUrl || "")}&download=1&filename=${encodeURIComponent(fileName || (isPdf ? "report.pdf" : "attachment"))}`;

      const res = await fetch(fetchUrl, {
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("🚨 Portal File Download Error details:", res.status, errorData);
        alert(`فشل التحميل (${res.status}):\n${errorData.message || errorData.frappe_body || "خطأ في السيرفر"}`);
        throw new Error(`Failed to download: ${res.status}`);
      }

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName || (isPdf ? "report.pdf" : "attachment");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch (error) {
      console.error("Download failed:", error);
      alert("تعذر تحميل الملف.");
    } finally {
      setIsDownloading(false);
    }
  };

  function directPathHelper(path: string) {
    return path.startsWith('/') ? path : '/' + path;
  }

  return (
    <div
      className={`max-w-[85%] md:max-w-[70%] mb-4 p-3 rounded-xl relative flex flex-col shadow-sm transition-all ${
        isOutgoing
          ? "self-start bg-brand-primary/10 dark:bg-brand-primary/20 border border-brand-primary/5 rounded-tr-none rtl:self-start rtl:rounded-tr-none"
          : "self-end bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-tl-none rtl:self-end rtl:rounded-tl-none"
      } ${
        Boolean(isUrgent) ? "border-2 border-red-500 ring-4 ring-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.35)]" : ""
      }`}
    >
      {Boolean(isUrgent) && (
        <div className="flex items-center gap-1 mb-2 text-red-600 dark:text-red-400 font-bold text-[11px]">
          <span>🔴</span> حالة حرجة (Critical)
        </div>
      )}

      {text && (
        <div className="text-[14px] md:text-[15px] text-slate-800 dark:text-slate-200 leading-relaxed mb-1 whitespace-pre-wrap">
          {text}
        </div>
      )}

      {(attachmentUrl || reportName || fileName) && (
        <div 
          role="button"
          tabIndex={0}
          onClick={handleDownload}
          className="flex flex-col gap-2 bg-white dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200 dark:border-slate-700 mb-1 cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden group block text-left rtl:text-right"
        >
          {/* Decorative side accent */}
          <div className={`absolute right-0 top-0 bottom-0 w-1 ${isUrgent ? 'bg-red-500' : 'bg-brand-primary'}`}></div>
          
          <div className="flex items-center gap-3 pl-1">
            <div className={`flex items-center justify-center w-10 h-10 shrink-0 rounded-lg text-xs font-bold ${
              isPdf ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-800/40' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-100 dark:border-blue-800/40'
            }`}>
              {isPdf ? 'PDF' : 'ملف'}
            </div>
            <div className="flex flex-col overflow-hidden w-full">
              <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate" dir="ltr">
                {fileName || "ملف مرفق"}
              </span>
              {fileSize && (
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                  {fileSize}
                </span>
              )}
            </div>
          </div>
          
          <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
          
          <div className="flex justify-between items-center pl-1">
            <span className="text-[11px] text-slate-400">
              انقر للتحميل والمشاهدة
            </span>
            <span className="text-[11px] font-bold text-brand-primary dark:text-brand-primary group-hover:underline">
              {isDownloading ? (
                <span className="flex items-center gap-1 opacity-70">
                  <span className="w-3 h-3 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></span>
                  جاري التحميل...
                </span>
              ) : (
                "تحميل المرفق ⬇️"
              )}
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-1.5 mt-1">
        <span className="text-[10px] md:text-[11px] text-slate-400 dark:text-slate-500 font-mono">{time}</span>
        {isOutgoing && (
          <span className="text-[12px]">
            {status === "sending" && "⏳"}
            {status === "sent" && <span className="text-slate-400">✓</span>}
            {status === "read" && <span className="text-[#34b7f1]">✔✔</span>}
          </span>
        )}
      </div>
    </div>
  );
}
