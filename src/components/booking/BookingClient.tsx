"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import clsx from "clsx";
import AlternativeNavbar from "@/components/nav/AlternativeNavbar";
import { NewLabFooter } from "@/components/footer/NewLabFooter";
import { 
  StepLocation, 
  StepTests, 
  StepSchedule, 
  StepConfirm, 
  type BookingData 
} from "@/components/booking/BookingSteps";
import { BookingSummary } from "@/components/booking/BookingSummary";
import type { TestCategoryData, TestItemData } from '@/types/api';

const compressImage = async (file: File, maxSizeMB: number = 2): Promise<string> => {
  return new Promise((resolve, reject) => {
    // If not an image (e.g., PDF), just convert directly but enforce size limit
    if (!file.type.startsWith('image/')) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        reject(new Error(`File size exceeds ${maxSizeMB}MB limit`));
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      return;
    }

    // For images, compress them using Canvas API
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Max dimensions
        const MAX_WIDTH = 1600;
        const MAX_HEIGHT = 1600;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Output as JPEG with 0.6 quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        
        // Check size of base64 (roughly 4/3 of byte size overhead)
        const sizeInBytes = Math.round((dataUrl.length * 3) / 4);
        if (sizeInBytes > maxSizeMB * 1024 * 1024) {
             // Fallback to harsher compression
             resolve(canvas.toDataURL('image/jpeg', 0.3));
        } else {
             resolve(dataUrl);
        }
      };
      img.onerror = () => reject(new Error("Failed to load image for compression"));
    };
    reader.onerror = error => reject(error);
  });
};

export default function BookingClient({
  initialCategories,
  initialTests,
  initialTestId
}: {
  initialCategories: TestCategoryData[];
  initialTests: TestItemData[];
  initialTestId?: string;
}) {
  const t = useTranslations("booking");
  const locale = useLocale();
  const isRTL = locale === "ar";
  
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Form State
  const [formData, setFormData] = useState<BookingData>(() => {
     let defaultSelectedTests: string[] = [];
     
     if (initialTestId && initialTests) {
        // Find if initialTestId matches any valid test id or code
        const match = initialTests.find(t => t.id === initialTestId || t.code === initialTestId);
        if (match) {
           // @ts-ignore
           const tNameEn = match.name || match.test_name || '';
           // @ts-ignore
           const tNameAr = match.nameAr || match.name_ar || match.test_name_ar || '';
           const testName = isRTL ? tNameAr : tNameEn;
           defaultSelectedTests = [testName];
        }
     }

     return {
        name: "",
        phone: "",
        locationType: "home",
        address: "",
        selectedTests: defaultSelectedTests,
        prescriptionFile: null,
        date: "",
        timeSlot: "",
     };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (fields: Partial<BookingData>) => {
    setFormData(prev => ({ ...prev, ...fields }));
    // Clear errors when user types
    const newErrors = { ...errors };
    Object.keys(fields).forEach(key => delete newErrors[key]);
    setErrors(newErrors);
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = t("validation.required");
      if (!formData.phone.trim()) newErrors.phone = t("validation.required");
      else if (!formData.phone.startsWith("7")) newErrors.phone = t("validation.invalidPhone");
      if (!formData.address.trim()) newErrors.address = t("validation.required");
    }

    if (step === 2) {
      if (formData.selectedTests.length === 0 && !formData.prescriptionFile) {
        isValid = false; // No visual error, just disable button logic if needed, but here we might want to alert
      }
    }

    if (step === 3) {
      if (!formData.date || !formData.timeSlot) isValid = false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setDirection(1);
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      let fileBase64 = null;
      let fileName = null;

      if (formData.prescriptionFile) {
        fileName = formData.prescriptionFile.name;
        // Compress and Convert file to base64
        fileBase64 = await compressImage(formData.prescriptionFile as File, 2);
      }

      const payload = {
        name: formData.name,
        phone: formData.phone,
        locationType: formData.locationType,
        address: formData.address,
        date: formData.date,
        timeSlot: formData.timeSlot,
        selectedTests: formData.selectedTests,
        prescriptionFile: fileBase64,
        prescriptionFileName: fileName
      };

      const res = await fetch("/api/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.message?.status === "success" || data.message?.message === "success") {
        setIsSuccess(true);
      } else {
        setSubmitError(isRTL ? data.message?.messageAr || "حدث خطأ أثناء الإرسال" : data.message?.message || "An error occurred during submission");
      }
    } catch (error) {
      console.error("Booking Error:", error);
      setSubmitError(isRTL ? "حدث خطأ في الاتصال بالخادم" : "A network error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, label: t("steps.location") },
    { id: 2, label: t("steps.tests") },
    { id: 3, label: t("steps.schedule") },
    { id: 4, label: t("steps.confirm") },
  ];

  // Animation variants
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -50 : 50,
      opacity: 0,
    }),
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#1a658d] ">
        <AlternativeNavbar />
        <main className="flex min-h-[calc(100vh-80px)] items-center justify-center p-6 ">
          <div className="w-full max-w-md text-center ">
            <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <Check className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">
              {t("success.title")}
            </h1>
            <p className="mb-8 text-slate-600 dark:text-slate-300">
              {t("success.message")}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full rounded-xl bg-[#1a658d] py-3 font-semibold text-white shadow-lg transition-all hover:bg-[#145a7a]"
            >
              Back to Home
            </button>
          </div>
        </main>
        <NewLabFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#1a658d]">
      <AlternativeNavbar />
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 mt-24">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: Wizard */}
          <div className="lg:col-span-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="relative flex justify-between">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 -z-10 h-0.5 w-full -translate-y-1/2 bg-slate-200 dark:bg-slate-700" />
                <div 
                  className={clsx(
                    "absolute top-1/2 left-0 -z-10 h-0.5 -translate-y-1/2 bg-[#1a658d] transition-all duration-500",
                    isRTL ? "right-0" : "left-0"
                  )}
                  style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                />

                {steps.map((step) => (
                  <div key={step.id} className="relative flex flex-col items-center bg-slate-50 px-2 dark:bg-[#1a658d]">
                    <div 
                      className={clsx(
                        "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300",
                        step.id < currentStep 
                          ? "border-[#1a658d] bg-[#1a658d] text-white"
                          : step.id === currentStep 
                          ? "border-[#1a658d] bg-white text-[#1a658d] shadow-[0_0_0_4px_rgba(26,101,141,0.2)] dark:bg-slate-800"
                          : "border-slate-300 bg-white text-slate-400 dark:border-slate-600 dark:bg-slate-800"
                      )}
                    >
                      {step.id < currentStep ? <Check className="h-4 w-4" /> : step.id}
                    </div>
                    <span className={clsx(
                      "mt-2 text-xs font-semibold transition-colors",
                      step.id <= currentStep ? "text-[#1a658d]" : "text-slate-400"
                    )}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Wizard Content */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {t(`${Object.keys(t.raw('steps'))[currentStep - 1]}.title`) || t("title")}
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                  {t(`${Object.keys(t.raw('steps'))[currentStep - 1]}.subtitle`) || t("subtitle")}
                </p>
              </div>

              <div className="min-h-[400px]">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentStep}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    {currentStep === 1 && (
                      <StepLocation 
                        data={formData} 
                        updateData={updateFormData} 
                        errors={errors} 
                      />
                    )}
                    {currentStep === 2 && (
                      <StepTests 
                        data={formData} 
                        updateData={updateFormData}
                        categories={initialCategories}
                        tests={initialTests}
                      />
                    )}
                    {currentStep === 3 && (
                      <StepSchedule 
                        data={formData} 
                        updateData={updateFormData} 
                      />
                    )}
                    {currentStep === 4 && (
                      <StepConfirm data={formData} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation Buttons */}
              {submitError && (
                <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  {submitError}
                </div>
              )}
              <div className="mt-8 flex justify-between border-t border-slate-100 pt-6 dark:border-slate-700">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className={clsx(
                    "flex items-center gap-2 rounded-lg px-6 py-2.5 font-medium transition-all",
                    currentStep === 1
                      ? "cursor-not-allowed text-slate-300 dark:text-slate-600"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                  )}
                >
                  <ChevronLeft className={clsx("h-4 w-4", isRTL && "rotate-180")} />
                  {t("actions.back")}
                </button>

                {currentStep === 4 ? (
                  <button
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 rounded-xl bg-[#1a658d] px-8 py-3 font-semibold text-white shadow-lg transition-all hover:bg-[#145a7a] hover:shadow-xl disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        {t("confirmation.processing")}
                      </>
                    ) : (
                      t("confirmation.confirmButton")
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 rounded-xl bg-[#1a658d] px-8 py-3 font-semibold text-white shadow-lg transition-all hover:bg-[#145a7a] hover:shadow-xl"
                  >
                    {t("actions.next")}
                    <ChevronRight className={clsx("h-4 w-4", isRTL && "rotate-180")} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Summary */}
          <div className="hidden lg:col-span-4 lg:block">
            <BookingSummary data={formData} currentStep={currentStep} />
          </div>
        </div>
      </main>
      
      <NewLabFooter />
    </div>
  );
}
