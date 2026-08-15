import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

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

export async function requestNotificationPermission(userIdentifier?: string) {
  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) return null;

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
      });
      if (token && userIdentifier) {
        await fetch('/api/notifications/register-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, userIdentifier }),
        });
        return token;
      }
    }
  } catch (error) {
    console.error('Notification permission error:', error);
  }
  return null;
}

export async function listenForegroundNotifications(
  onNotificationReceived: (payload: any) => void
) {
  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) return () => {};

    const unsubscribe = onMessage(messaging, (payload) => {
      onNotificationReceived(payload);
    });
    return unsubscribe;
  } catch (error) {
    console.error('Listen foreground notifications error:', error);
    return () => {};
  }
}
