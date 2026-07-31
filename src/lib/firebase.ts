import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported, Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase Client App (Singleton)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let messagingInstance: Messaging | null = null;

// Initialize Messaging safely for browser environment
export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (typeof window === "undefined") return null;
  
  if (!messagingInstance) {
    const supported = await isSupported().catch(() => false);
    if (supported) {
      messagingInstance = getMessaging(app);
    }
  }
  return messagingInstance;
}

// Request Notification Permission and register FCM Token for specific user
export async function requestNotificationPermission(userIdentifier?: string): Promise<string | null> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.warn("Notifications not supported in this browser environment.");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied by user.");
      return null;
    }

    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      console.warn("Firebase Messaging not supported on this browser.");
      return null;
    }

    // Register Service Worker for FCM Web Push
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js").catch(() => null);

    // Get FCM Registration Token
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    const token = await getToken(messaging, {
      vapidKey: vapidKey || undefined,
      serviceWorkerRegistration: registration || undefined,
    });

    if (token) {
      console.log("=== [FCM] FCM Token generated successfully ===", token);
      
      // Store token locally
      try {
        localStorage.setItem("newlab_fcm_token", token);
      } catch {}

      // Register Token to backend for specific user targeting
      if (userIdentifier) {
        await fetch("/api/notifications/register-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, userIdentifier }),
        })
        .then(r => r.json())
        .then(resData => console.log(`=== [FCM Register Token Response for ${userIdentifier}] ===`, resData))
        .catch((e) => console.error("Failed to register FCM token with server:", e));
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

    // Force native OS notification popup on screen even in foreground
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
