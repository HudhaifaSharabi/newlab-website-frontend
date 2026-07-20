"use client";

import React, { useState, useRef, KeyboardEvent } from "react";

interface Props {
  onSendMessage: (text: string, files: File[], isUrgent?: boolean) => void;
  hideQuickReplies?: boolean;
  disableAttachments?: boolean;
}

const QUICK_REPLIES = [
  "النتائج جاهزة ومرفقة.",
  "يرجى إعادة إرسال العينة.",
  "النتيجة تحتاج ساعتين إضافيتين.",
  "شكراً لكم."
];

export function ChatInput({ onSendMessage, hideQuickReplies, disableAttachments }: Props) {
  const [text, setText] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isUrgent, setIsUrgent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!text.trim() && pendingFiles.length === 0) return;
    onSendMessage(text.trim(), pendingFiles, isUrgent);
    setText("");
    setPendingFiles([]);
    setIsUrgent(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const allFiles = Array.from(e.target.files);
      const validPdfFiles = allFiles.filter(f => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
      if (validPdfFiles.length !== allFiles.length) {
        alert("يُسمح بإرسال ملفات بصيغة PDF فقط (.pdf). تم استبعاد الملفات غير المدعومة.");
      }
      setPendingFiles((prev) => [...prev, ...validPdfFiles]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuickReply = (reply: string) => {
    setText(reply);
  };

  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 relative z-20">
      {/* Quick Replies row */}
      {!hideQuickReplies && (
        <div className="flex gap-2 p-2 overflow-x-auto border-b border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-950 scrollbar-hide">
          <button 
            onClick={() => setIsUrgent(!isUrgent)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${isUrgent ? 'bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:border-red-800/50' : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
          >
            {isUrgent ? '🔴 حالة حرجة (مُفعّل)' : '⚪ تحديد كحالة حرجة'}
          </button>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 self-center"></div>
          {QUICK_REPLIES.map((reply, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickReply(reply)}
              className="flex-shrink-0 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-semibold text-brand-primary dark:text-brand-primary hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary dark:hover:text-white transition-colors"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* File Previews */}
      {pendingFiles.length > 0 && (
        <div className="flex gap-2 p-3 overflow-x-auto border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          {pendingFiles.map((file, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-white dark:bg-slate-700 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-600 shadow-sm animate-in fade-in slide-in-from-bottom-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
                📄 {file.name}
              </span>
              <button
                onClick={() => removeFile(idx)}
                className="w-5 h-5 flex items-center justify-center rounded-full bg-red-50 text-brand-accent hover:bg-brand-accent hover:text-white dark:bg-red-900/30 dark:hover:bg-brand-accent transition-colors text-[10px]"
                title="إزالة"
              >
                ✖
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center p-2 md:p-3 gap-2 md:gap-3">
        {!disableAttachments && (
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-400 hover:text-brand-primary dark:text-slate-500 dark:hover:text-brand-primary transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex-shrink-0"
              title="إرفاق ملف PDF"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={handleFileSelect}
            />
          </>
        )}

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="اكتب رسالة هنا..."
          className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-full outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-brand-primary/20 transition-all text-[14px] md:text-[15px]"
        />

        <button
          onClick={handleSend}
          disabled={!text.trim() && pendingFiles.length === 0}
          className={`w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-full transition-transform flex-shrink-0 ${
            !text.trim() && pendingFiles.length === 0
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              : 'bg-brand-primary text-white hover:bg-brand-primary/90 shadow-brand hover:scale-105 active:scale-95'
          }`}
          title="إرسال"
        >
          <svg className="w-5 h-5 translate-x-[-1px]" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
        </button>
      </div>
    </div>
  );
}
