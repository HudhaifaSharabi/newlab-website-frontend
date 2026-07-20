"use client";

import React from "react";

type Role = "center" | "lab" | "entry";

interface Props {
  onSelectRole: (role: Role) => void;
}

export function RoleSelector({ onSelectRole }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4" dir="rtl">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-soft p-8 text-center border border-slate-100 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
          اختبار واجهة المراسلة
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          الرجاء اختيار صلاحيتك لمعاينة الواجهة المناسبة:
        </p>
        
        <div className="flex flex-col gap-4">
          <button
            onClick={() => onSelectRole("center")}
            className="w-full py-4 px-5 bg-accent-subtle text-accent hover:bg-accent/20 dark:bg-accent/20 dark:text-accent-primary rounded-xl font-semibold transition-all flex flex-col items-center gap-1 border border-accent/20"
          >
            <span className="text-base font-bold">صلاحية مركز طبي (Lab Center)</span>
            <span className="text-xs opacity-80">الصفحة الخاصة بالمختبرات (لا يظهر لها قائمة بالمختبرات)</span>
          </button>
          
          <button
            onClick={() => onSelectRole("lab")}
            className="w-full py-4 px-5 bg-brand-primary text-white hover:bg-brand-primary/90 rounded-xl font-semibold transition-all shadow-brand flex flex-col items-center gap-1"
          >
            <span className="text-base font-bold">صلاحية إدخال المستخدم (User entry)</span>
            <span className="text-xs text-white/90">واجهة الإدخال والمراسلة (يظهر فيها قائمة بالمختبرات للإرسال إليها)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
