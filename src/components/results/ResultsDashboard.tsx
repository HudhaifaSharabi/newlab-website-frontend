"use client";

import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Download, CheckCircle, AlertTriangle, XCircle, User, Calendar, Shield } from "lucide-react";
import gsap from "gsap";
import clsx from "clsx";

interface TestResult {
  id: string;
  testKey: string;
  value: number;
  min: number;
  max: number;
  optimalMin: number;
  optimalMax: number;
}

interface PatientData {
  name: string;
  age: number;
  gender: "male" | "female";
  sampleDate: string;
  reportDate: string;
  verifiedBy: string;
  tests: TestResult[];
}

interface ResultsDashboardProps {
  sampleId: string;
  phone: string;
}

export function ResultsDashboard({ sampleId, phone }: ResultsDashboardProps) {
  const t = useTranslations("results.dashboard");
  const tTests = useTranslations("results.tests");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const markersRef = useRef<(HTMLDivElement | null)[]>([]);

  // Mock patient data
  const patientData: PatientData = {
    name: isRTL ? "أحمد محمد" : "Ahmed Mohammed",
    age: 35,
    gender: "male",
    sampleDate: "2026-02-10",
    reportDate: "2026-02-12",
    verifiedBy: isRTL ? "د. سارة أحمد" : "Dr. Sarah Ahmed",
    tests: [
      {
        id: "1",
        testKey: "vitaminD",
        value: 28,
        min: 0,
        max: 100,
        optimalMin: 30,
        optimalMax: 50,
      },
      {
        id: "2",
        testKey: "hemoglobin",
        value: 14.5,
        min: 0,
        max: 20,
        optimalMin: 13.5,
        optimalMax: 17.5,
      },
      {
        id: "3",
        testKey: "wbc",
        value: 7.2,
        min: 0,
        max: 15,
        optimalMin: 4.5,
        optimalMax: 11,
      },
      {
        id: "4",
        testKey: "platelets",
        value: 250,
        min: 0,
        max: 500,
        optimalMin: 150,
        optimalMax: 400,
      },
      {
        id: "5",
        testKey: "glucose",
        value: 95,
        min: 0,
        max: 200,
        optimalMin: 70,
        optimalMax: 100,
      },
      {
        id: "6",
        testKey: "cholesterol",
        value: 185,
        min: 0,
        max: 300,
        optimalMin: 125,
        optimalMax: 200,
      },
    ],
  };

  const getStatus = (test: TestResult) => {
    if (test.value < test.optimalMin) return "low";
    if (test.value > test.optimalMax) return "high";
    return "normal";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "low":
        return "text-orange-600 dark:text-orange-400";
      case "high":
        return "text-red-600 dark:text-red-400";
      case "normal":
        return "text-green-600 dark:text-green-400";
      default:
        return "text-slate-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "low":
        return <AlertTriangle className="h-5 w-5" />;
      case "high":
        return <XCircle className="h-5 w-5" />;
      case "normal":
        return <CheckCircle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getMarkerPosition = (test: TestResult) => {
    return ((test.value - test.min) / (test.max - test.min)) * 100;
  };

  // GSAP Animation for markers
  useEffect(() => {
    const markers = markersRef.current.filter(Boolean);
    if (markers.length === 0) return;

    gsap.fromTo(
      markers,
      {
        [isRTL ? "right" : "left"]: "0%",
        opacity: 0,
      },
      {
        [isRTL ? "right" : "left"]: (i: number) => {
          const test = patientData.tests[i];
          return `${getMarkerPosition(test)}%`;
        },
        opacity: 1,
        duration: 1.2,
        ease: "power2.out",
        stagger: 0.1,
      }
    );
  }, [isRTL]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white py-12 dark:from-slate-900 dark:to-slate-800">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">
              {t("title")}
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              {t("sampleDate")}: {patientData.sampleDate}
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1a658d] to-[#145a7a] px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
            <Download className="h-5 w-5" />
            {t("downloadPdf")}
          </button>
        </div>

        {/* Patient Info Card */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
            {t("patientInfo")}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#1a658d]/10 p-2">
                <User className="h-5 w-5 text-[#1a658d]" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("name")}</p>
                <p className="font-semibold text-slate-900 dark:text-white">{patientData.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#1a658d]/10 p-2">
                <Calendar className="h-5 w-5 text-[#1a658d]" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("age")} / {t("gender")}</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {patientData.age} {t("years")} / {t(patientData.gender)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500/10 p-2">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("verifiedBy")}</p>
                <p className="font-semibold text-slate-900 dark:text-white">{patientData.verifiedBy}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div>
          <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
            {t("testResults")}
          </h2>
          <div className="space-y-6">
            {patientData.tests.map((test, index) => {
              const status = getStatus(test);
              const position = getMarkerPosition(test);

              return (
                <div
                  key={test.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
                >
                  {/* Test Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {tTests(`${test.testKey}.name`)}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t("referenceRange")}: {test.optimalMin} - {test.optimalMax} {tTests(`${test.testKey}.unit`)}
                      </p>
                    </div>
                    <div className={clsx("flex items-center gap-2 font-semibold", getStatusColor(status))}>
                      {getStatusIcon(status)}
                      {t(status)}
                    </div>
                  </div>

                  {/* Smart Reference Bar */}
                  <div className="relative">
                    {/* Background Bar with Gradient */}
                    <div className="relative h-12 overflow-hidden rounded-full">
                      {/* Gradient Bar */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(to ${isRTL ? "left" : "right"}, 
                            #ef4444 0%, 
                            #f59e0b ${(test.optimalMin / test.max) * 100}%, 
                            #10b981 ${(test.optimalMin / test.max) * 100}%, 
                            #10b981 ${(test.optimalMax / test.max) * 100}%, 
                            #f59e0b ${(test.optimalMax / test.max) * 100}%, 
                            #ef4444 100%)`,
                          opacity: 0.2,
                        }}
                      />
                      {/* Border */}
                      <div className="absolute inset-0 rounded-full border-2 border-slate-200 dark:border-slate-700" />

                      {/* Value Marker */}
                      <div
                        ref={(el) => {
                          markersRef.current[index] = el;
                        }}
                        className="absolute top-1/2 -translate-y-1/2"
                        style={{
                          [isRTL ? "right" : "left"]: `${position}%`,
                          transform: `translate(${isRTL ? "50%" : "-50%"}, -50%)`,
                        }}
                      >
                        {/* Marker Dot */}
                        <div
                          className={clsx(
                            "h-8 w-8 rounded-full border-4 border-white shadow-lg dark:border-slate-800",
                            status === "normal"
                              ? "bg-green-500"
                              : status === "low"
                              ? "bg-orange-500"
                              : "bg-red-500"
                          )}
                        />
                        {/* Value Label */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#1a658d]px-3 py-1 text-sm font-bold text-white shadow-lg dark:bg-white dark:text-slate-900">
                          {test.value} {tTests(`${test.testKey}.unit`)}
                        </div>
                      </div>
                    </div>

                    {/* Range Labels */}
                    <div className="mt-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{test.min}</span>
                      <span>{test.max}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            <Shield className="mr-2 inline h-4 w-4" />
            {isRTL
              ? "هذه النتائج تم التحقق منها من قبل متخصصين طبيين. يرجى استشارة طبيبك لمناقشة النتائج."
              : "These results have been verified by medical professionals. Please consult your doctor to discuss the results."}
          </p>
        </div>
      </div>
    </div>
  );
}
