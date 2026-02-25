"use client";

import { useTranslations } from "next-intl";
import { Check, Clock, Home, FileText, User } from "lucide-react";

type BookingData = {
  name: string;
  phone: string;
  locationType: "home" | "office";
  address: string;
  selectedTests: string[];
  prescriptionFile: File | null;
  date: string;
  timeSlot: string;
};

export function BookingSummary({ 
  data, 
  currentStep 
}: { 
  data: BookingData; 
  currentStep: number; 
}) {
  const t = useTranslations("booking.confirmation");

  return (
    <div className="sticky top-24 rounded-2xl bg-[#1a658d] p-6 text-white shadow-xl">
      <h3 className="mb-6 text-xl font-bold">Booking Summary</h3>
      
      <div className="space-y-6">
        {/* Step 1: Location */}
        <div className={`transition-opacity duration-300 ${currentStep >= 1 ? "opacity-100" : "opacity-50"}`}>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-200">
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-blue-300 text-xs">1</span>
            {t("patient")} & {t("address")}
          </div>
          {data.name && (
            <div className="ml-7 space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-3 w-3" />
                <span>{data.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Home className="h-3 w-3" />
                <span>{data.locationType === "home" ? "Home" : "Office"}</span>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Tests */}
        <div className={`transition-opacity duration-300 ${currentStep >= 2 ? "opacity-100" : "opacity-50"}`}>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-200">
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-blue-300 text-xs">2</span>
            {t("tests")}
          </div>
          {(data.selectedTests.length > 0 || data.prescriptionFile) && (
            <div className="ml-7 text-sm">
              {data.prescriptionFile ? (
                <div className="flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  <span>Prescription Uploaded</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {data.selectedTests.map(test => (
                    <span key={test} className="rounded bg-blue-800/50 px-1.5 py-0.5 text-xs">
                      {test}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 3: Schedule */}
        <div className={`transition-opacity duration-300 ${currentStep >= 3 ? "opacity-100" : "opacity-50"}`}>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-200">
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-blue-300 text-xs">3</span>
            {t("time")}
          </div>
          {data.date && data.timeSlot && (
            <div className="ml-7 flex items-center gap-2 text-sm">
              <Clock className="h-3 w-3" />
              <span>{data.date} at {data.timeSlot}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -top-12 -left-12 h-48 w-48 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
    </div>
  );
}
