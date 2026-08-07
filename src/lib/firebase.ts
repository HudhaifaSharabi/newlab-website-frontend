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

// Safely disabled - returns null without prompting user or throwing errors
export async function requestNotificationPermission(_userIdentifier?: string) {
  return null;
}

// Safely disabled - no-op listener
export async function listenForegroundNotifications(
  _onNotificationReceived: (payload: any) => void
) {
  return () => {};
}
