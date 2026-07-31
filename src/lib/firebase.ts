import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { registerUserFcmToken } from "./fcmStore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDH5tD6xfs7VUaKaH1IIl-hAmWPF50bFm8",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "new-lab-71268.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "new-lab-71268",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "new-lab-71268.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "333545583954",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:333545583954:web:0fa508d28672585645f68b",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-XS55CQPBZZ"
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Helper to safely get Firebase Messaging instance on client side
export async function getFirebaseMessaging() {
  if (typeof window === "undefined") return null;
  const supported = await isSupported().catch(() => false);
  if (!supported) return null;
  return getMessaging(app);
}

// Request Notification Permission and register device FCM Token
export async function requestNotificationPermission(userIdentifier?: string) {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const messaging = await getFirebaseMessaging();
      if (!messaging) return null;

      // Register Firebase Service Worker first if not registered
      let swRegistration: ServiceWorkerRegistration | undefined = undefined;
      if ("serviceWorker" in navigator) {
        try {
          swRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        } catch (swErr) {
          console.warn("[FCM SW Registration Warning]:", swErr);
        }
      }

      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || undefined;

      const token = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: swRegistration,
      });

      console.log("=== [FCM] FCM Token generated successfully ===", token);

      if (token && userIdentifier) {
        fetch("/api/notifications/register-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, userIdentifier }),
        })
        .then(res => res.json())
        .then(data => console.log(`=== [FCM Register Token Response for ${userIdentifier}] ===`, data))
        .catch(err => console.error("=== [FCM Register Token Error] ===", err));
      }

      if (typeof window !== "undefined" && token) {
        try {
          localStorage.setItem("newlab_fcm_token", token);
        } catch {}
      }

      return token;
    }
  } catch (err) {
    console.error("Error obtaining FCM Notification token:", err);
  }

  return null;
}

// Listen for Foreground (In-App) Notifications when user is actively using the app
export async function listenForegroundNotifications(
  onNotificationReceived: (payload: any) => void
) {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    console.log("=== [FCM] Foreground Notification Received ===", payload);
    
    // Play subtle audio alert if available
    try {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch {}

    // Force native OS notification popup on screen
    try {
      const title = payload.notification?.title || payload.data?.title || "نيولاب - إشعار جديد";
      const body = payload.notification?.body || payload.data?.body || "";
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification(title, {
          body,
          icon: payload.notification?.icon || payload.data?.icon || "/logo192.jpeg",
          tag: "newlab-foreground-alert",
        });
      }
    } catch {}

    onNotificationReceived(payload);
  });
}
