"use client";

import { useTranslations, useLocale } from "next-intl";
import { 
  MapPin, Phone, User, Building, Home, Search, Upload, FileText, 
  Calendar, Clock, Check, X, ChevronRight, ChevronLeft, Filter
} from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import type { TestCategoryData, TestItemData } from '@/types/api';
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

// Types
export type BookingData = {
  name: string;
  phone: string;
  locationType: "home" | "office";
  address: string;
  selectedTests: string[];
  prescriptionFile: File | null;
  date: string;
  timeSlot: string;
};

// --- Step 1: Location ---
export function StepLocation({ 
  data, 
  updateData, 
  errors 
}: { 
  data: BookingData; 
  updateData: (fields: Partial<BookingData>) => void;
  errors: Record<string, string>;
}) {
  const t = useTranslations("booking.location");
  const locale = useLocale();
  const isRTL = locale === "ar";

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("nameLabel")}
          </label>
          <div className="relative">
            <User className={clsx("absolute top-3.5 h-5 w-5 text-slate-400", isRTL ? "right-3" : "left-3")} />
            <input
              type="text"
              value={data.name}
              onChange={(e) => updateData({ name: e.target.value })}
              placeholder={t("namePlaceholder")}
              className={clsx(
                "w-full rounded-xl border bg-slate-50 py-3 text-slate-900 transition-all focus:outline-none focus:ring-4 dark:bg-slate-800 dark:text-white",
                isRTL ? "pr-10 pl-4" : "pl-10 pr-4",
                errors.name 
                  ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200"
                  : "border-slate-200 focus:border-[#1a658d] focus:bg-white focus:ring-[#1a658d]/10 dark:border-slate-700"
              )}
            />
          </div>
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("phoneLabel")}
          </label>
          <div className="relative">
            <Phone className={clsx("absolute top-3.5 h-5 w-5 text-slate-400", isRTL ? "right-3" : "left-3")} />
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => updateData({ phone: e.target.value })}
              placeholder={t("phonePlaceholder")}
              className={clsx(
                "w-full rounded-xl border bg-slate-50 py-3 text-slate-900 transition-all focus:outline-none focus:ring-4 dark:bg-slate-800 dark:text-white",
                isRTL ? "pr-10 pl-4" : "pl-10 pr-4",
                errors.phone 
                  ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200"
                  : "border-slate-200 focus:border-[#1a658d] focus:bg-white focus:ring-[#1a658d]/10 dark:border-slate-700"
              )}
            />
          </div>
          {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
        </div>
      </div>

      <div>
        <label className="mb-3 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {t("typeLabel")}
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => updateData({ locationType: "home" })}
            className={clsx(
              "flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all",
              data.locationType === "home"
                ? "border-[#1a658d] bg-[#1a658d]/5 text-[#1a658d]"
                : "border-slate-200 bg-white text-slate-500 hover:border-[#1a658d]/50 dark:border-slate-700 dark:bg-slate-800"
            )}
          >
            <Home className="mb-2 h-6 w-6" />
            <span className="font-medium">{t("types.home")}</span>
          </button>
          <button
            onClick={() => updateData({ locationType: "office" })}
            className={clsx(
              "flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all",
              data.locationType === "office"
                ? "border-[#1a658d] bg-[#1a658d]/5 text-[#1a658d]"
                : "border-slate-200 bg-white text-slate-500 hover:border-[#1a658d]/50 dark:border-slate-700 dark:bg-slate-800"
            )}
          >
            <Building className="mb-2 h-6 w-6" />
            <span className="font-medium">{t("types.office")}</span>
          </button>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {t("addressLabel")}
        </label>
        <div className="relative">
          <textarea
            value={data.address}
            onChange={(e) => updateData({ address: e.target.value })}
            placeholder={t("addressPlaceholder")}
            rows={3}
            className={clsx(
              "w-full rounded-xl border p-4 pb-10 text-slate-900 transition-all focus:outline-none focus:ring-4 dark:bg-slate-800 dark:text-white",
              errors.address 
                ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200"
                : "border-slate-200 bg-slate-50 focus:border-[#1a658d] focus:bg-white focus:ring-[#1a658d]/10 dark:border-slate-700"
            )}
          />
          <button
            type="button"
            className={clsx(
              "absolute bottom-4 flex items-center gap-1 text-xs font-semibold text-[#1a658d] transition-colors hover:text-[#145a7a]",
              isRTL ? "left-4" : "right-4"
            )}
          >
            <MapPin className="h-3 w-3" />
            {t("useCurrentLocation")}
          </button>
        </div>
        {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
      </div>
    </div>
  );
}

// --- Step 2: Tests ---
export function StepTests({ 
  data, 
  updateData,
  categories,
  tests 
}: { 
  data: BookingData; 
  updateData: (fields: Partial<BookingData>) => void;
  categories: TestCategoryData[];
  tests: TestItemData[];
}) {
  const t = useTranslations("booking.tests");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const [activeTab, setActiveTab] = useState<"upload" | "manual">(
    data.selectedTests.length > 0 ? "manual" : "upload"
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      const matchesCategory = selectedCategory === 'all' || test.categoryId === selectedCategory;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' || 
        (test.name && test.name.toLowerCase().includes(searchLower)) ||
        (test.nameAr && test.nameAr.includes(searchQuery)) ||
        (test.code && test.code.toLowerCase().includes(searchLower));
      
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory, tests]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      updateData({ prescriptionFile: e.target.files[0] });
    }
  };

  const toggleTest = (testId: string) => {
    const newSelection = data.selectedTests.includes(testId)
      ? data.selectedTests.filter(id => id !== testId)
      : [...data.selectedTests, testId];
    updateData({ selectedTests: newSelection });
  };

  return (
    <div className="space-y-6">
      <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        <button
          onClick={() => setActiveTab("upload")}
          className={clsx(
            "flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all",
            activeTab === "upload"
              ? "bg-white text-[#1a658d] shadow-sm dark:bg-slate-700 dark:text-white"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
          )}
        >
          {t("uploadTab")}
        </button>
        <button
          onClick={() => setActiveTab("manual")}
          className={clsx(
            "flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all",
            activeTab === "manual"
              ? "bg-white text-[#1a658d] shadow-sm dark:bg-slate-700 dark:text-white"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
          )}
        >
          {t("manualTab")}
        </button>
      </div>

      {activeTab === "upload" ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={clsx(
            "group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 transition-all hover:border-[#1a658d] hover:bg-[#1a658d]/5 dark:border-slate-700 dark:bg-slate-800",
            data.prescriptionFile && "border-[#1a658d] bg-[#1a658d]/5"
          )}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*,.pdf"
          />
          <div className="mb-4 rounded-full bg-white p-4 shadow-sm group-hover:scale-110 transition-transform dark:bg-slate-700">
            {data.prescriptionFile ? (
              <FileText className="h-8 w-8 text-[#1a658d]" />
            ) : (
              <Upload className="h-8 w-8 text-[#1a658d]" />
            )}
          </div>
          {data.prescriptionFile ? (
            <div className="text-center">
              <p className="font-semibold text-[#1a658d]">{data.prescriptionFile.name}</p>
              <p className="text-xs text-slate-500 mt-1">Click to change file</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="mb-1 font-medium text-slate-900 dark:text-white">
                {t("dragDrop")}
              </p>
              <p className="text-sm text-slate-500">
                {t("orClick")}
              </p>
              <p className="mt-4 text-xs text-slate-400">
                {t("supports")}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className={clsx(
                "w-full rounded-xl border border-slate-200 bg-slate-50 py-3 text-slate-900 focus:border-[#1a658d] focus:outline-none focus:ring-4 focus:ring-[#1a658d]/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white",
                isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
              )}
            />
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
             <Filter className="h-5 w-5 flex-shrink-0 text-slate-400" />
             <div className={clsx('flex gap-2', isRTL && 'flex-row-reverse')}>
               {categories.map((category) => (
                 <button
                   key={category.id}
                   onClick={() => setSelectedCategory(category.id)}
                   className={clsx(
                     'flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-300',
                     selectedCategory === category.id
                       ? 'bg-[#1a658d] text-white shadow-md shadow-[#1a658d]/30'
                       : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                   )}
                 >
                   {isRTL ? category.nameAr : category.name}
                 </button>
               ))}
             </div>
          </div>

          <div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 max-h-[40vh] overflow-y-auto p-1 scrollbar-thin">
              {filteredTests.length > 0 ? (
                filteredTests.map((test) => {
                  // @ts-ignore
                  const tNameEn = test.name || test.test_name || '';
                  // @ts-ignore
                  const tNameAr = test.nameAr || test.name_ar || test.test_name_ar || '';
                  const testName = isRTL ? tNameAr : tNameEn;
                  // @ts-ignore
                  const tCode = test.code || test.test_code || test.item_code || '';
                  
                  return (
                    <button
                      key={test.id}
                      onClick={() => toggleTest(testName)}
                      className={clsx(
                        "relative flex flex-col items-start justify-center text-start rounded-xl border p-4 transition-all hover:shadow-md",
                        data.selectedTests.includes(testName)
                          ? "border-[#1a658d] bg-[#1a658d]/5 text-[#1a658d]"
                          : "border-slate-200 bg-white text-slate-600 hover:border-[#1a658d]/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      )}
                    >
                      <span className="font-semibold text-sm line-clamp-2">{testName}</span>
                      <span className="mt-1 text-xs opacity-70 block">{tCode}</span>
                      {data.selectedTests.includes(testName) && (
                        <div className="absolute right-2 top-2 rounded-full bg-[#1a658d] p-0.5 shadow-sm">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="col-span-full py-6 text-center text-sm text-slate-500">
                  {isRTL ? "لا توجد فحوصات مطابقة" : "No matching tests found"}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Step 3: Schedule ---
export function StepSchedule({ 
  data, 
  updateData 
}: { 
  data: BookingData; 
  updateData: (fields: Partial<BookingData>) => void; 
}) {
  const t = useTranslations("booking.schedule");
  const locale = useLocale();
  
  // Dynamically generate dates (Today + Next 3 days)
  const dates = useMemo(() => {
    const arr = [];
    const now = new Date();
    
    for (let i = 0; i < 4; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      
      let label = "";
      if (i === 0) label = t("today");
      else if (i === 1) label = t("tomorrow");
      else {
        // Weekday short representation depending on locale ('ar' or 'en')
        label = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(d);
      }
      
      // ISO-like format string YYYY-MM-DD
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const dayNum = String(d.getDate()).padStart(2, '0');
      
      arr.push({ label, date: dateStr, dayNum });
    }
    return arr;
  }, [t, locale]);

  // Dynamically generate time slots from 8 AM to 12 AM (Midnight)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let h = 8; h <= 24; h++) {
      const isMidnight = h === 24;
      const hour = isMidnight ? 0 : h;
      const period = (h < 12 || isMidnight) ? 'AM' : 'PM';
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      const value = `${displayHour.toString().padStart(2, '0')}:00 ${period}`;
      
      // Generate localized time string (e.g., 08:00 ص)
      const localized = new Intl.DateTimeFormat(locale, {
         hour: 'numeric',
         minute: '2-digit',
         hour12: true
      }).format(new Date(2000, 1, 1, hour, 0, 0));
      
      slots.push({ value, label: localized });
    }
    return slots;
  }, [locale]);

  return (
    <div className="space-y-8">
      <div>
        <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
          <Calendar className="h-4 w-4 text-[#1a658d]" />
          Select Date
        </h4>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {dates.map((item) => (
            <button
              key={item.date}
              onClick={() => updateData({ date: item.date })}
              className={clsx(
                "flex min-w-[80px] flex-col items-center justify-center rounded-xl border p-3 transition-all",
                data.date === item.date
                  ? "border-[#1a658d] bg-[#1a658d] text-white shadow-lg shadow-[#1a658d]/20"
                  : "border-slate-200 bg-white text-slate-600 hover:border-[#1a658d]/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              )}
            >
              <span className="text-sm font-medium">{item.label}</span>
              <span className="text-xs opacity-70 mt-1">{item.dayNum}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
          <Clock className="h-4 w-4 text-[#1a658d]" />
          Select Time
        </h4>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 max-h-[300px] overflow-y-auto p-1 scrollbar-thin">
          {timeSlots.map((slot) => (
            <button
              key={slot.value}
              onClick={() => updateData({ timeSlot: slot.value })}
              className={clsx(
                "rounded-lg border px-2 py-3 text-sm font-medium transition-all text-center flex items-center justify-center",
                data.timeSlot === slot.value
                  ? "border-[#1a658d] bg-[#1a658d] text-white shadow-md shadow-[#1a658d]/20"
                  : "border-slate-200 bg-white text-slate-600 hover:border-[#1a658d] hover:text-[#1a658d] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              )}
            >
              <span dir={locale === 'ar' ? 'rtl' : 'ltr'}>{slot.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Step 4: Confirm ---
export function StepConfirm({ data }: { data: BookingData }) {
  const t = useTranslations("booking.confirmation");
  
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="border-b border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white">{t("title")}</h3>
          <p className="text-sm text-slate-500">{t("subtitle")}</p>
        </div>
        
        <div className="space-y-4 p-6">
          <div className="flex justify-between">
            <span className="text-sm text-slate-500">{t("patient")}</span>
            <span className="font-medium text-slate-900 dark:text-white">{data.name}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-slate-500">{t("address")}</span>
            <div className="text-right">
              <span className="block font-medium text-slate-900 dark:text-white">
                {data.locationType === "home" ? "🏠 Home" : "🏢 Office"}
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400">{data.address}</span>
            </div>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-slate-500">{t("time")}</span>
            <div className="text-right">
              <span className="block font-medium text-slate-900 dark:text-white">{data.date}</span>
              <span className="text-sm text-slate-600 dark:text-slate-400">{data.timeSlot}</span>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
            <span className="mb-2 block text-sm text-slate-500">{t("tests")}</span>
            {data.prescriptionFile ? (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                <FileText className="h-5 w-5" />
                <span className="font-medium">{t("prescriptionUploaded")}</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {data.selectedTests.map(test => (
                  <span key={test} className="rounded-full bg-[#1a658d]/10 px-3 py-1 text-xs font-semibold text-[#1a658d] dark:bg-[#1a658d]/30 dark:text-white">
                    {test}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
