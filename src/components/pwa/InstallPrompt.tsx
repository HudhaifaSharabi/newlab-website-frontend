'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Download, CheckCircle, Smartphone, Monitor, X, Share } from 'lucide-react';

export default function InstallPrompt({
  className = '',
  variant = 'menu',
  onCloseMenu,
}: {
  className?: string;
  variant?: 'menu' | 'button' | 'icon';
  onCloseMenu?: () => void;
}) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if app is running in standalone mode (already installed & opened as PWA)
    if (typeof window !== 'undefined') {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);

      // Detect iOS devices
      const userAgent = window.navigator.userAgent.toLowerCase();
      const iosDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(iosDevice);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      } catch (err) {
        setShowModal(true);
      }
      if (onCloseMenu) onCloseMenu();
    } else {
      setShowModal(true);
    }
  };

  if (isStandalone) {
    return (
      <div className={`flex items-center gap-2 text-xs text-emerald-400 font-medium px-3 py-2 ${className}`}>
        <CheckCircle className="w-4 h-4" />
        <span>التطبيق مثبت</span>
      </div>
    );
  }

  return (
    <>
      {variant === 'menu' && (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`w-full text-right px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors font-semibold ${className}`}
        >
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
            <Download className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-right">
            <span>تثبيت / تنزيل التطبيق</span>
          </div>
        </button>
      )}

      {variant === 'button' && (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] ${className}`}
        >
          <Download className="w-4 h-4" />
          <span>تنزيل التطبيق</span>
        </button>
      )}

      {variant === 'icon' && (
        <button
          type="button"
          onClick={handleInstallClick}
          title="تثبيت / تنزيل التطبيق"
          className={`p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-cyan-500 transition-colors ${className}`}
        >
          <Download className="w-5 h-5" />
        </button>
      )}

      {/* Manual Install Instructions Modal for iOS / Laptop / Unsupported browsers */}
      {showModal && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in" dir="rtl">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 flex flex-col space-y-5">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 left-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">تنزيل وتثبيت التطبيق</h3>
                <p className="text-xs text-slate-400">لأجهزة الجوال (أندرويد وآيفون) واللابتوب</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-slate-300">
              {isIOS ? (
                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 space-y-2">
                  <div className="font-semibold text-cyan-400 flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    <span>خطوات التثبيت على الآيفون (iOS):</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300">
                    <li>اضغط على زر المشاركة <Share className="w-3.5 h-3.5 inline mx-1 text-cyan-400" /> أسفل المتصفح.</li>
                    <li>اختر <strong>&quot;الإضافة إلى الشاشة الرئيسية&quot; (Add to Home Screen)</strong>.</li>
                    <li>اضغط <strong>&quot;إضافة&quot; (Add)</strong> في الأعلى.</li>
                  </ol>
                </div>
              ) : (
                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 space-y-2">
                  <div className="font-semibold text-cyan-400 flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    <span>خطوات التثبيت على الأندرويد واللابتوب:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300">
                    <li>افتح قائمة المتصفح <strong>(⋮ أو ⋯)</strong> في أعلى الزاوية.</li>
                    <li>اختر <strong>&quot;تثبيت التطبيق&quot; (Install app)</strong> أو <strong>&quot;إضافة إلى الشاشة الرئيسية&quot;</strong>.</li>
                    <li>موافقة على التثبيت وسينزل التطبيق مباشرة كأيقونة مستقلة.</li>
                  </ol>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-semibold transition-all text-sm shadow-md"
            >
              فهمت ذلك
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
