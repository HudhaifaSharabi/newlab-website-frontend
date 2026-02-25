export interface Equipment {
  id: string;
  category: "immunology" | "hematology" | "chemistry" | "molecular";
  image: string;
  status: "online" | "maintenance" | "offline";
  accuracy: number;
  content: {
    en: {
      name: string;
      manufacturer: string;
      speed: string;
      description: string;
      features: string[];
      relatedTests: string[];
    };
    ar: {
      name: string;
      manufacturer: string;
      speed: string;
      description: string;
      features: string[];
      relatedTests: string[];
    };
  };
}

export const equipmentData: Equipment[] = [
  {
    id: "cobas-6000",
    category: "chemistry",
    image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=1000",
    accuracy: 99.9,
    status: "online",
    content: {
      en: {
        name: "Cobas 6000",
        manufacturer: "Roche Diagnostics",
        speed: "1000 tests/hr",
        description: "A fully automated analyzer system for clinical chemistry and immunoassay testing. Designed for high workloads, it ensures rapid turnaround times with uncompromised precision.",
        features: [
          "Clot detection",
          "Liquid level detection",
          "Automated rerun",
          "Contact-free ultrasonic mixing"
        ],
        relatedTests: ["Lipid Profile", "Liver Functions", "Kidney Functions", "Hormones"]
      },
      ar: {
        name: "كوباس 6000",
        manufacturer: "روش للتشخيص",
        speed: "1000 فحص/ساعة",
        description: "نظام تحليل آلي بالكامل للكيمياء السريرية والمقايسة المناعية. مصمم لأحمال العمل العالية، ويضمن أوقات استجابة سريعة مع دقة لا تضاهى.",
        features: [
          "كشف التجلط",
          "كشف مستوى السائل",
          "إعادة التشغيل الآلي",
          "خلط بالموجات فوق الصوتية بدون تلامس"
        ],
        relatedTests: ["دهون الدم", "وظائف الكبد", "وظائف الكلى", "الهرمونات"]
      }
    }
  },
  {
    id: "sysmex-xn-1000",
    category: "hematology",
    image: "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=1000",
    accuracy: 99.8,
    status: "online",
    content: {
      en: {
        name: "Sysmex XN-1000",
        manufacturer: "Sysmex",
        speed: "100 samples/hr",
        description: "Flagship hematology analyzer utilizing fluorescent flow cytometry. It provides deeper insights into hematological disorders with advanced parameters for platelets and reticulocytes.",
        features: [
          "Fluorescent Flow Cytometry",
          "Low aspiration volume",
          "Body fluid mode",
          "PLT-F channel for low platelet counts"
        ],
        relatedTests: ["CBC", "Malaria Screening", "Reticulocytes", "Body Fluids"]
      },
      ar: {
        name: "سيسمكس XN-1000",
        manufacturer: "سيسمكس",
        speed: "100 عينة/ساعة",
        description: "محلل أمراض الدم الرائد الذي يستخدم قياس التدفق الخلوي الفلوري. يوفر رؤى أعمق حول اضطرابات الدم مع معلمات متقدمة للصفائح الدموية والخلايا الشبكية.",
        features: [
          "قياس التدفق الخلوي الفلوري",
          "حجم شفط منخفض",
          "وضع سوائل الجسم",
          "قناة PLT-F لتعداد الصفائح المنخفض"
        ],
        relatedTests: ["صورة الدم الكاملة", "فحص الملاريا", "الخلايا الشبكية", "سوائل الجسم"]
      }
    }
  },
  {
    id: "mindray-cl-900i",
    category: "immunology",
    image: "https://images.unsplash.com/photo-1628595351029-c2bf17b96a1b?auto=format&fit=crop&q=80&w=1000",
    accuracy: 99.5,
    status: "online",
    content: {
      en: {
        name: "Mindray CL-900i",
        manufacturer: "Mindray",
        speed: "180 tests/hr",
        description: "One of the world's smallest fully automated chemiluminescence immunoassay analyzers. It offers high throughput in a compact footprint and reliable performance for infectious diseases.",
        features: [
          "Enzymatic chemiluminescence",
          "Non-stop reagent loading",
          "Real-time status monitoring",
          "Intelligent consumable management"
        ],
        relatedTests: ["Thyroid Function", "Fertility Markers", "Infectious Diseases", "Tumor Markers"]
      },
      ar: {
        name: "مايندراي CL-900i",
        manufacturer: "مايندراي",
        speed: "180 فحص/ساعة",
        description: "أحد أصغر أجهزة التحليل المناعي الكيميائي الآلي بالكامل في العالم. يوفر إنتاجية عالية في مساحة صغيرة وأداء موثوق للأمراض المعدية.",
        features: [
          "التلألؤ الكيميائي الإنزيمي",
          "تحميل الكواشف بدون توقف",
          "مراقبة الحالة في الوقت الفعلي",
          "إدارة ذكية للمواد الاستهلاكية"
        ],
        relatedTests: ["وظائف الغدة الدرقية", "علامات الخصوبة", "الأمراض المعدية", "دلالات الأورام"]
      }
    }
  }
];
