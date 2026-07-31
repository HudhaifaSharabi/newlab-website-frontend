"use client";

import React, { useState, useEffect } from "react";
import { Bell, Send, CheckCircle, Smartphone, AlertCircle, Copy } from "lucide-react";
import { requestNotificationPermission } from "@/lib/firebase";

export default function TestNotificationsPage() {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string>("default");
  const [testStatus, setTestStatus] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermissionStatus(Notification.permission);
      const savedToken = localStorage.getItem("newlab_fcm_token");
      if (savedToken) setFcmToken(savedToken);
    }
  }, []);

  const handleEnableNotifications = async () => {
    setTestStatus("جاري طلب الإذن واستخراج المفتاح...");
    const token = await requestNotificationPermission("test-user-001");
    if (token) {
      setFcmToken(token);
      setPermissionStatus(Notification.permission);
      setTestStatus("✅ تم تفعيل الإشعارات بنجاح وحفظ الـ Token!");
    } else {
      setTestStatus("⚠️ تعذر تفعيل الإشعارات. تأكد من السماح بها في إعدادات المتصفح.");
    }
  };

  const sendTestNotification = async (type: "chat" | "result" | "background") => {
    setTestStatus("جاري إرسال الإشعار التجريبي...");

    const payload = {
      targetUser: "test-user-001",
      token: fcmToken,
      title:
        type === "chat"
          ? "💬 رسالة جديدة من المختبر الرئيسي"
          : type === "result"
          ? "🧪 تم إصدار نتيجة فحص جديدة!"
          : "🔔 إشعار تجريبي في الخلفية",
      message:
        type === "chat"
          ? "مرحباً بك! تم الرد على استفسارك في الشات."
          : type === "result"
          ? "تم رفع نتيجة فحص الدم الشامل في حسابك بنجاح."
          : "هذا إشعار مباشر تجريبي من مختبرات نيولاب التخصصية.",
      url: type === "chat" ? "/ar/chat" : "/ar/results",
      type,
    };

    try {
      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setTestStatus(`✅ تم إرسال الإشعار بنجاح! (${type})`);
        
        // Also trigger browser Notification if supported
        if (Notification.permission === "granted") {
          new Notification(payload.title, {
            body: payload.message,
            icon: "/logo192.jpeg",
          });
        }
      } else {
        setTestStatus(`❌ فشل الإرسال: ${data.error}`);
      }
    } catch (e: any) {
      setTestStatus(`❌ خطأ في الاتصال: ${e.message}`);
    }
  };

  const copyToken = () => {
    if (fcmToken) {
      navigator.clipboard.writeText(fcmToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6" dir="rtl">
      <div className="max-w-xl w-full bg-slate-800/90 border border-slate-700/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-700 pb-5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Bell className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">مركز اختبار الإشعارات المباشرة</h1>
            <p className="text-xs text-slate-400">اختبار إشعارات النتائج والمحادثات لـ Firebase FCM</p>
          </div>
        </div>

        {/* Permission Status */}
        <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-700/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-300">حالة إذن الإشعارات:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                permissionStatus === "granted"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              }`}
            >
              {permissionStatus === "granted" ? "مسموح (Granted)" : "غير مسموح (Denied/Default)"}
            </span>
          </div>

          {permissionStatus !== "granted" && (
            <button
              onClick={handleEnableNotifications}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Bell className="w-4 h-4" />
              <span>تفعيل وإعطاء إذن الإشعارات الآن</span>
            </button>
          )}

          {fcmToken && (
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>رمز الجهاز (FCM Token):</span>
                <button onClick={copyToken} className="text-cyan-400 hover:underline flex items-center gap-1">
                  {copied ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? "تم النسخ!" : "نسخ الـ Token"}</span>
                </button>
              </div>
              <p className="text-[11px] font-mono bg-slate-950 p-2 rounded text-slate-400 break-all max-h-20 overflow-y-auto">
                {fcmToken}
              </p>
            </div>
          )}
        </div>

        {/* Test Buttons */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-200">اختر إشعاراً لتجربته فوراً:</h2>

          <button
            onClick={() => sendTestNotification("chat")}
            className="w-full py-3.5 px-4 bg-slate-700/80 hover:bg-slate-700 border border-slate-600 rounded-xl text-sm font-semibold flex items-center justify-between transition-all hover:scale-[1.01]"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">💬</span>
              <span>تجربة إشعار محادثة جديدة</span>
            </div>
            <Send className="w-4 h-4 text-cyan-400" />
          </button>

          <button
            onClick={() => sendTestNotification("result")}
            className="w-full py-3.5 px-4 bg-slate-700/80 hover:bg-slate-700 border border-slate-600 rounded-xl text-sm font-semibold flex items-center justify-between transition-all hover:scale-[1.01]"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">🧪</span>
              <span>تجربة إشعار صدور نتيجة جديدة</span>
            </div>
            <Send className="w-4 h-4 text-emerald-400" />
          </button>

          <button
            onClick={() => sendTestNotification("background")}
            className="w-full py-3.5 px-4 bg-slate-700/80 hover:bg-slate-700 border border-slate-600 rounded-xl text-sm font-semibold flex items-center justify-between transition-all hover:scale-[1.01]"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">📱</span>
              <span>تجربة إشعار خلفية (صغّر المتصفح واضغط هنا)</span>
            </div>
            <Smartphone className="w-4 h-4 text-amber-400" />
          </button>
        </div>

        {/* Test Status Output */}
        {testStatus && (
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-center font-medium text-slate-300">
            {testStatus}
          </div>
        )}
      </div>
    </main>
  );
}
