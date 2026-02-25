import Link from "next/link";
import { AlertCircle } from "lucide-react";
import AlternativeNavbar from "@/components/nav/AlternativeNavbar";
import { NewLabFooter } from "@/components/footer/NewLabFooter";

export default function NotFound() {
  return (
    <>
      <AlternativeNavbar />
      <div className="flex min-h-[80vh] w-full flex-col items-center justify-center bg-slate-50 px-6 py-24 text-center dark:bg-[#020617]">
        <div className="relative mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 shadow-inner">
          <AlertCircle className="h-16 w-16 text-red-600 dark:text-red-500" />
        </div>
        
        <h1 className="mb-4 text-7xl font-black text-slate-900 dark:text-white">
          404
        </h1>
        
        <h2 className="mb-6 text-2xl font-bold text-slate-800 md:text-3xl dark:text-slate-200">
          الصفحة غير موجودة | Page Not Found
        </h2>
        
        <p className="mx-auto mb-10 max-w-lg text-lg text-slate-600 dark:text-slate-400">
          عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها. قد يكون الرابط معطلاً أو تم نقل الصفحة.
          <br />
          <br />
          Sorry, we couldn&apos;t find the page you&apos;re looking for. The link might be broken or the page may have been moved.
        </p>

        <Link 
          href="/"
          className="rounded-full bg-[#1a658d] px-8 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          العودة للرئيسية | Return Home
        </Link>
      </div>
      <NewLabFooter />
    </>
  );
}
