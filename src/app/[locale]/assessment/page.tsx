"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { 
  Activity, 
  ArrowLeft, 
  ArrowRight, 
  BatteryWarning, 
  ChevronRight, 
  HeartPulse, 
  RotateCcw, 
  Sparkles, 
  Stethoscope, 
  ThermometerSnowflake 
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import AlternativeNavbar from "@/components/nav/AlternativeNavbar";
import { NewLabFooter } from "@/components/footer/NewLabFooter";

/* =========================================
   TYPES & DATA
   ========================================= */

type Option = {
  label: { en: string; ar: string };
  value: string;
  points?: number;
};

type Question = {
  id: number;
  text: { en: string; ar: string };
  options: Option[];
};

type Recommendation = {
  title: { en: string; ar: string };
  description: { en: string; ar: string };
  price: string;
  testId: string; // for booking link
  test_id?: string; // snake_case fallback from API
};

type Quiz = {
  id: string;
  icon: any;
  title: { en: string; ar: string };
  description: { en: string; ar: string };
  questions: Question[];
  recommendation: Recommendation;
  threshold?: number;
};

// The hardcoded generic quiz structure will be used as a fallback if fetching fails.
const FALLBACK_QUIZZES: Quiz[] = [
  {
    id: "fatigue",
    icon: BatteryWarning,
    title: { en: "Constant Fatigue", ar: "الخمول والتعب المستمر" },
    description: { 
      en: "Feeling tired even after a good night's sleep? Let's check your energy markers.", 
      ar: "تشعر بالتعب حتى بعد نوم جيد؟ دعنا نفحص مؤشرات الطاقة لديك." 
    },
    threshold: 3,
    questions: [
      {
        id: 1,
        text: { en: "Do you feel tired even after sleeping?", ar: "هل تشعر بالتعب حتى بعد النوم الجيد؟" },
        options: [
          { label: { en: "Yes, always", ar: "نعم، دائماً" }, value: "yes", points: 2 },
          { label: { en: "Sometimes", ar: "أحياناً" }, value: "sometimes", points: 1 },
          { label: { en: "No, rarely", ar: "لا، نادراً" }, value: "no", points: 0 },
        ]
      },
      {
        id: 2,
        text: { en: "Do you experience dizziness when standing up?", ar: "هل تشعر بالدوخة عند الوقوف؟" },
        options: [
          { label: { en: "Yes", ar: "نعم" }, value: "yes", points: 2 },
          { label: { en: "No", ar: "لا" }, value: "no", points: 0 },
        ]
      },
       {
        id: 3,
        text: { en: "How is your mood generally?", ar: "كيف هو مزاجك بشكل عام؟" },
        options: [
          { label: { en: "Stable", ar: "مستقر" }, value: "stable", points: 0 },
          { label: { en: "Anxious / Low", ar: "قلق / منخفض" }, value: "low", points: 2 },
        ]
      },
      {
        id: 4,
        text: { en: "Do you have pale skin or cold hands?", ar: "هل تعاني من شحوب البشرة أو برودة اليدين؟" },
        options: [
          { label: { en: "Yes", ar: "نعم" }, value: "yes", points: 2 },
          { label: { en: "No", ar: "لا" }, value: "no", points: 0 },
        ]
      }
    ],
    recommendation: {
      title: { en: "Comprehensive Energy Panel", ar: "باقة الطاقة والنشاط الشاملة" },
      description: { 
        en: "Your symptoms suggest potential deficiencies in Iron, Vitamin D, or B12, which are common causes of fatigue.", 
        ar: "تشير أعراضك إلى نقص محتمل في الحديد، فيتامين د، أو ب12، وهي مسببات شائعة للخمول." 
      },
      price: "25,000 YER",
      testId: "energy_panel"
    }
  },
  {
    id: "hair_loss",
    icon: Sparkles, // Metaphor for beauty/hair
    title: { en: "Hair Loss & Skin", ar: "تساقط الشعر والبشرة" },
    description: { 
      en: "Noticing more hair fall than usual? It might be internal.", 
      ar: "تلاحظ تساقط شعر أكثر من المعتاد؟ قد يكون السبب داخلياً." 
    },
    threshold: 3,
    questions: [
      {
        id: 1,
        text: { en: "Is the hair loss sudden or gradual?", ar: "هل تساقط الشعر مفاجئ أم تدريجي؟" },
        options: [
          { label: { en: "Sudden", ar: "مفاجئ" }, value: "sudden", points: 2 },
          { label: { en: "Gradual", ar: "تدريجي" }, value: "gradual", points: 1 },
        ]
      },
      {
        id: 2,
        text: { en: "Do you have brittle nails?", ar: "هل تعاني من تكسر الأظافر؟" },
        options: [
          { label: { en: "Yes", ar: "نعم" }, value: "yes", points: 2 },
          { label: { en: "No", ar: "لا" }, value: "no", points: 0 },
        ]
      },
      {
        id: 3,
        text: { en: "Any sudden weight changes?", ar: "هل هناك تغيرات مفاجئة في الوزن؟" },
        options: [
          { label: { en: "Weight Gain", ar: "زيادة وزن" }, value: "gain", points: 2 },
          { label: { en: "Weight Loss", ar: "نقصان وزن" }, value: "loss", points: 2 },
          { label: { en: "No change", ar: "لا تغيير" }, value: "none", points: 0 },
        ]
      }
    ],
    recommendation: {
      title: { en: "Beauty & Vitality Package", ar: "باقة الجمال والحيوية" },
      description: { 
        en: "We recommend checking your Thyroid (TSH), Iron stores (Ferritin), and Zinc levels to identify the root cause.", 
        ar: "ننصح بفحص الغدة الدرقية (TSH)، مخزون الحديد (Ferritin)، ومستويات الزنك لمعرفة السبب الجذري." 
      },
      price: "18,000 YER",
      testId: "beauty_package"
    }
  },
  {
    id: "general_checkup",
    icon: Activity,
    title: { en: "General Health Check", ar: "الفحص الدوري العام" },
    description: { 
      en: "Just want to ensure everything is on track? Start here.", 
      ar: "تريد فقط التأكد من أن كل شيء على ما يرام؟ ابدأ من هنا." 
    },
    threshold: 3,
    questions: [
      {
        id: 1,
        text: { en: "When was your last blood test?", ar: "متى كان آخر فحص دم أجريته؟" },
        options: [
          { label: { en: "Less than 6 months", ar: "أقل من 6 أشهر" }, value: "recent", points: 0 },
          { label: { en: "Over a year ago", ar: "منذ أكثر من سنة" }, value: "old", points: 2 },
          { label: { en: "Never", ar: "أبداً" }, value: "never", points: 3 },
        ]
      },
      {
        id: 2,
        text: { en: "Do you have a family history of diabetes?", ar: "هل لديك تاريخ عائلي مع السكري؟" },
        options: [
          { label: { en: "Yes", ar: "نعم" }, value: "yes", points: 2 },
          { label: { en: "No", ar: "لا" }, value: "no", points: 0 },
        ]
      },
       {
        id: 3,
        text: { en: "How active is your lifestyle?", ar: "ما مدى نشاط نمط حياتك؟" },
        options: [
          { label: { en: "Active", ar: "نشيط" }, value: "active", points: 0 },
          { label: { en: "Sedentary", ar: "خامل" }, value: "sedentary", points: 2 },
        ]
      }
    ],
    recommendation: {
      title: { en: "Executive Health Profile", ar: "الفحص التنفيذي الشامل" },
      description: { 
        en: "A complete overview including CBC, Lipid Profile, Liver & Kidney function to give you peace of mind.", 
        ar: "نظرة شاملة تتضمن صورة الدم، الدهون، ووظائف الكبد والكلى لمنحك راحة البال." 
      },
      price: "35,000 YER",
      testId: "executive_profile"
    }
  }
];

/* =========================================
   COMPONENT
   ========================================= */

export default function AssessmentPage() {
  // State
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"MENU" | "QUIZ" | "RESULT">("MENU");
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  
  // Hooks
  const locale = useLocale();
  const isRTL = locale === "ar";
  
  // Computed
  const activeQuiz = quizzes.find(q => q.id === activeQuizId);
  const currentQuestion = activeQuiz?.questions[currentQuestionIndex];
  const progress = activeQuiz ? ((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100 : 0;

  // Refs for GSAP
  const containerRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  const [needsTest, setNeedsTest] = useState(true);

  // Fetch API on mount
  useEffect(() => {
    const fetchAssessmentData = async () => {
      try {
        const res = await fetch("/api/method/newlab_site.api.get_quizzes");
        const json = await res.json();
        
        // Handle Frappe's stringified JSON or double-nested message
        let payload = json.message;
        if (typeof payload === 'string') {
          try { payload = JSON.parse(payload); } catch(e) {}
        }
        
        let fetchedQuizzes = null;
        if (payload?.message?.quizzes) {
          fetchedQuizzes = payload.message.quizzes;
        } else if (payload?.quizzes) {
          fetchedQuizzes = payload.quizzes;
        } else if (Array.isArray(payload)) {
          fetchedQuizzes = payload;
        }
        
        if (fetchedQuizzes && fetchedQuizzes.length > 0) {
           // Provide fallback icons if icons not defined in backend
           const icons = [BatteryWarning, Sparkles, Activity, ThermometerSnowflake, HeartPulse];
           const processed = fetchedQuizzes.map((q: any, i: number) => ({
              ...q,
              icon: icons[i % icons.length]
           }));
           setQuizzes(processed);
        } else {
           setQuizzes(FALLBACK_QUIZZES);
        }
      } catch (err) {
        console.error("Failed to fetch assessment data, using fallback", err);
        setQuizzes(FALLBACK_QUIZZES);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAssessmentData();
  }, []);

  // --- ACTIONS ---

  const handleStartQuiz = (id: string) => {
    setActiveQuizId(id);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setNeedsTest(true);
    setView("QUIZ");
  };

  const evaluateAnswers = (quiz: Quiz, finalAnswers: Record<number, string>) => {
    let totalScore = 0;
    
    // Sum points based on selected options
    quiz.questions.forEach((q, idx) => {
       const answeredValue = finalAnswers[idx];
       // Match strictly or loosely in case value is passed as number or string from Frappe
       const option = q.options.find(o => String(o.value) === String(answeredValue));
       if (option && option.points) {
           totalScore += Number(option.points);
       }
    });

    // Determine threshold. Default to 1 point = needs a test, if no threshold provided.
    const threshold = quiz.threshold ?? 1;
    
    if (totalScore >= threshold) {
      setNeedsTest(true);
    } else {
      setNeedsTest(false);
    }
  };

  const handleAnswer = (value: string) => {
    // Save answer
    const newAnswers = { ...answers, [currentQuestionIndex]: value };
    setAnswers(newAnswers);
    
    // Animate out
    if (questionRef.current && optionsRef.current) {
      gsap.to([questionRef.current, optionsRef.current], {
        opacity: 0,
        y: -10,
        duration: 0.3,
        onComplete: () => {
           // Advance Logic
           if (activeQuiz && currentQuestionIndex < activeQuiz.questions.length - 1) {
             setCurrentQuestionIndex(prev => prev + 1);
           } else {
             if (activeQuiz) evaluateAnswers(activeQuiz, newAnswers);
             setView("RESULT");
           }
        }
      });
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      setView("MENU");
    }
  };

  const handleRestart = () => {
    setView("MENU");
    setActiveQuizId(null);
    setCurrentQuestionIndex(0);
    setAnswers({});
  };

  // --- ANIMATIONS ---

  useGSAP(() => {
    if (view === "QUIZ" && questionRef.current && optionsRef.current) {
        // Reset state
        gsap.set([questionRef.current, optionsRef.current], { opacity: 0, y: 20 });
        
        // Animate In
        gsap.to([questionRef.current, optionsRef.current], {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "power2.out"
        });
    }
  }, [currentQuestionIndex, view]);

  useGSAP(() => {
    if (view === "RESULT") {
      gsap.from(".result-card", {
        scale: 0.9,
        opacity: 0,
        duration: 0.6,
        ease: "back.out(1.7)"
      });
    }
  }, [view]);

  // --- RENDER HELPERS ---

  const t = (obj: { en: string; ar: string }) => isRTL ? obj.ar : obj.en;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AlternativeNavbar />

      <main 
        ref={containerRef}
        className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 min-h-[80vh] flex flex-col items-center justify-center"
      >
        
        {/* ================= BACKGROUND DECOR ================= */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
             <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[100px]" />
             <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-teal-500/5 blur-[100px]" />
        </div>

        {/* ================= VIEW: MENU ================= */}
        {view === "MENU" && (
          <div className="relative z-10 w-full max-w-5xl">
            <div className="text-center mb-16">
               <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold tracking-widest uppercase mb-4 dark:bg-blue-900/30 dark:text-blue-300">
                  {isRTL ? "التقييم الصحي الذكي" : "Smart Health Assessment"}
               </span>
               <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
                  {isRTL ? "محتار أي فحص تحتاج؟" : "Not sure what to test?"}
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 mt-2">
                    {isRTL ? "دعنا نساعدك في دقيقة." : "Let us help you decide."}
                  </span>
               </h1>
               <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                  {isRTL 
                    ? "اختر العرض الذي تشعر به، وسيقوم نظامنا الذكي باقتراح الباقة الأنسب لصحتك."
                    : "Select the symptom you are experiencing, and our smart engine will recommend the most relevant lab package."}
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                // Skeletons
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-start p-8 rounded-3xl bg-white border border-slate-200 shadow-sm dark:bg-[#1a658d] dark:border-slate-800 animate-pulse">
                    <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-700 mb-6" />
                    <div className="h-6 w-3/4 rounded bg-slate-200 dark:bg-slate-700 mb-4" />
                    <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700 mb-2" />
                    <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-700 mb-8" />
                    <div className="h-5 w-1/3 rounded bg-slate-200 dark:bg-slate-700 mt-auto" />
                  </div>
                ))
              ) : (
                quizzes.map((quiz) => (
                  <button
                    key={quiz.id}
                    onClick={() => handleStartQuiz(quiz.id)}
                    className="group relative flex flex-col items-start p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-start dark:bg-[#1a658d] dark:border-slate-800"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 dark:bg-slate-800 dark:text-blue-400">
                      <quiz.icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      {/* @ts-ignore */}
                      {t((quiz.title_ar || quiz.title_en) ? { en: quiz.title_en, ar: quiz.title_ar } : quiz.title)}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      {/* @ts-ignore */}
                      {t((quiz.description_ar || quiz.description_en) ? { en: quiz.description_en, ar: quiz.description_ar } : quiz.description)}
                    </p>
                    
                    <div className="mt-8 flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all">
                      {isRTL ? "ابدأ التقييم" : "Start Assessment"}
                      {isRTL ? <ArrowLeft className="w-4 h-4 mr-2" /> : <ArrowRight className="w-4 h-4 ml-2" />}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= VIEW: QUIZ ================= */}
        {view === "QUIZ" && activeQuiz && currentQuestion && (
          <div className="relative z-10 w-full max-w-2xl">
            {/* Progress Bar */}
            <div className="mb-12">
               <div className="flex justify-between text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">
                  <span>{isRTL ? "التقدم" : "Progress"}</span>
                  <span>{Math.round(progress)}%</span>
               </div>
               <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden dark:bg-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-teal-500 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
               </div>
            </div>

            {/* Back Button */}
            <button 
              onClick={handleBack}
              className="mb-8 flex items-center text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors"
            >
               {isRTL ? <ArrowRight className="w-4 h-4 ml-1" /> : <ArrowLeft className="w-4 h-4 mr-1" />}
               {isRTL ? "السابق" : "Back"}
            </button>

            {/* Question Container */}
            <div className="min-h-[300px]">
                <div ref={questionRef} className="mb-10">
                   <h2 className="text-3xl font-bold text-slate-900 dark:text-white leading-snug">
                      {/* @ts-ignore */}
                      {t((currentQuestion.text_ar || currentQuestion.text_en) ? { en: currentQuestion.text_en, ar: currentQuestion.text_ar } : currentQuestion.text)}
                   </h2>
                </div>

                <div ref={optionsRef} className="flex flex-col gap-4">
                   {currentQuestion.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(option.value)}
                        className="group flex items-center justify-between w-full p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-200 text-start dark:bg-[#1a658d] dark:border-slate-800 dark:hover:border-blue-500/50 dark:hover:bg-blue-900/10"
                      >
                         <span className="text-lg font-medium text-slate-700 group-hover:text-blue-700 dark:text-slate-300 dark:group-hover:text-blue-300">
                            {/* @ts-ignore */}
                            {t((option.label_ar || option.label_en) ? { en: option.label_en, ar: option.label_ar } : option.label)}
                         </span>
                         <span className="w-6 h-6 rounded-full border-2 border-slate-300 group-hover:border-blue-500 group-hover:bg-blue-500 transition-all dark:border-slate-600" />
                      </button>
                   ))}
                </div>
            </div>
          </div>
        )}

        {/* ================= VIEW: RESULT ================= */}
        {view === "RESULT" && activeQuiz && (
           <div className="relative z-10 w-full max-w-3xl result-card">
              <div className="rounded-[40px] bg-white border border-slate-200 shadow-2xl overflow-hidden dark:bg-[#1a658d] dark:border-slate-800">
                 {/* Header Status */}
                 <div className={clsx(
                    "p-8 text-center text-white",
                    needsTest ? "bg-gradient-to-r from-teal-500 to-emerald-500" : "bg-gradient-to-r from-blue-500 to-indigo-500"
                 )}>
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                       {needsTest ? <Stethoscope className="w-8 h-8 text-white" /> : <HeartPulse className="w-8 h-8 text-white" />}
                    </div>
                    <h2 className="text-2xl font-bold mb-2">
                      {isRTL ? "اكتمل التقييم المبدئي" : "Assessment Complete"}
                    </h2>
                    <p className="opacity-90 text-sm">
                       {needsTest 
                          ? (isRTL ? "بناءً على إجاباتك، نوصي بالتالي:" : "Based on your answers, we recommend:") 
                          : (isRTL ? "تبدو بصحة جيدة! إليك نتيجتك:" : "You look healthy! Here is your result:")}
                    </p>
                 </div>

                 <div className="p-8 md:p-12">
                    <div className="flex flex-col md:flex-row gap-10 items-start">
                       {/* Recommendation Info */}
                       <div className="flex-1">
                          {needsTest ? (
                            <>
                              <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold tracking-wider mb-4 dark:bg-blue-900/30 dark:text-blue-300">
                                 {isRTL ? "الباقة المقترحة" : "RECOMMENDED PACKAGE"}
                              </div>
                              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
                                 {/* @ts-ignore */}
                                 {t((activeQuiz.recommendation.title_ar || activeQuiz.recommendation.title_en) ? { en: activeQuiz.recommendation.title_en, ar: activeQuiz.recommendation.title_ar } : activeQuiz.recommendation.title)}
                              </h3>
                              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
                                 {/* @ts-ignore */}
                                 {t((activeQuiz.recommendation.description_ar || activeQuiz.recommendation.description_en) ? { en: activeQuiz.recommendation.description_en, ar: activeQuiz.recommendation.description_ar } : activeQuiz.recommendation.description)}
                              </p>
                              
                              <div className="flex flex-wrap gap-2 mb-8">
                                 <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-sm font-medium dark:bg-slate-800 dark:text-slate-400">
                                    {isRTL ? "نتائج في نفس اليوم" : "Same Day Results"}
                                 </span>
                                 <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-sm font-medium dark:bg-slate-800 dark:text-slate-400">
                                    {isRTL ? "تفسير طبيب مجاني" : "Free Dr. Consultation"}
                                 </span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold tracking-wider mb-4 dark:bg-green-900/30 dark:text-green-300">
                                 {isRTL ? "صحة جيدة" : "GOOD HEALTH"}
                              </div>
                              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
                                 {isRTL ? "لا توجد مؤشرات مقلقة" : "No Concerning Indicators"}
                              </h3>
                              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
                                 {isRTL 
                                  ? "إجاباتك لا تشير إلى وجود أعراض مقلقة تتطلب فحوصات عاجلة. ومع ذلك، يُنصح دائماً بإجراء فحوصات دورية سنوية للاطمئنان على صحتك." 
                                  : "Your answers do not indicate any concerning symptoms requiring immediate tests. However, an annual routine checkup is always recommended for peace of mind."}
                              </p>
                            </>
                          )}
                       </div>
                       
                       {/* Action Card */}
                       <div className="w-full md:w-72 bg-slate-50 rounded-3xl p-6 border border-slate-200 text-center dark:bg-slate-800/50 dark:border-slate-700">
                          {/* @ts-ignore */}
                          {needsTest ? (
                            <Link 
                              href={`/${locale}/book?test=${activeQuiz.recommendation.testId || activeQuiz.recommendation.test_id || 'general_checkup'}`}
                              className="block w-full py-4 rounded-xl bg-[#1a658d] text-white font-bold shadow-lg shadow-[#1a658d]/20 hover:bg-[#124d6e] hover:-translate-y-0.5 transition-all mb-3"
                            >
                               {isRTL ? "حجز الفحص" : "Book Test"}
                            </Link>
                          ) : (
                             <Link 
                                href={`/${locale}/book?test=general_checkup`}
                                className="block w-full py-4 rounded-xl bg-slate-200 text-slate-700 font-bold hover:bg-slate-300 transition-all mb-3 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                             >
                                {isRTL ? "حجز فحص دوري" : "Book Routine Checkup"}
                             </Link>
                          )}
                          
                          <button 
                             onClick={handleRestart}
                             className="flex items-center justify-center w-full py-3 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors gap-2"
                          >
                             <RotateCcw className="w-4 h-4" />
                             {isRTL ? "إعادة التقييم" : "Restart Assessment"}
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        )}

      </main>
      
      <NewLabFooter />
    </div>
  );
}
