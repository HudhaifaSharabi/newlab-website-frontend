// Firebase Cloud Messaging (FCM) Web Push Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Initialize Firebase App inside Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyDH5tD6xfs7VUaKaH1IIl-hAmWPF50bFm8",
  authDomain: "new-lab-71268.firebaseapp.com",
  projectId: "new-lab-71268",
  storageBucket: "new-lab-71268.firebasestorage.app",
  messagingSenderId: "333545583954",
  appId: "1:333545583954:web:0fa508d28672585645f68b"
});

const messaging = firebase.messaging();

// Handle Background Notification payloads cleanly for Mobile & Desktop
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  // 🚀 منع التكرار: Firebase SDK يعرض الإشعار تلقائياً إذا كان يحتوي على كائن notification.
  // إذا قمنا باستدعاء showNotification هنا يدوياً، سيظهر الإشعار مرتين!
  if (payload.notification) {
    console.log('[firebase-messaging-sw.js] Notification already handled automatically by Firebase SDK.');
    return;
  }

  const notificationTitle = payload.data?.title || 'مختبرات نيولاب التخصصية';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'لديك إشعار جديد من مختبرات نيولاب',
    icon: '/logo192.jpeg',
    badge: '/logo192.jpeg',
    tag: payload.data?.tag || 'newlab-mobile-push',
    data: {
      url: payload.data?.url || '/ar/chat',
      targetUser: payload.data?.targetUser || ''
    },
    vibrate: [200, 100, 200],
    renotify: true,
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click event -> opens target page (Results or Chat)
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received:', event.notification);
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/ar/chat';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
