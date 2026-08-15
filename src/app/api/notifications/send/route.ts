import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Helper to generate Google OAuth2 Access Token using Service Account credentials
async function getGoogleAccessToken(clientEmail: string, privateKey: string): Promise<string | null> {
  try {
    const cleanKey = privateKey.replace(/\\n/g, "\n");
    const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
    const now = Math.floor(Date.now() / 1000);
    const claimSet = Buffer.from(JSON.stringify({
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    })).toString("base64url");

    const signatureInput = `${header}.${claimSet}`;
    const signer = crypto.createSign("RSA-SHA256");
    signer.update(signatureInput);
    const signature = signer.sign(cleanKey, "base64url");
    const jwt = `${signatureInput}.${signature}`;

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });

    const data = await res.json();
    return data.access_token || null;
  } catch (e: any) {
    console.error("[Google OAuth Token Error]:", e);
    return null;
  }
}

async function getFrappeTokens(userIdentifier: string, cookie: string): Promise<string[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl || !userIdentifier) return [];
  try {
    const res = await fetch(`${apiUrl}/api/method/newlab_site.api.get_fcm_tokens?user_identifier=${encodeURIComponent(userIdentifier)}`, {
      method: "GET",
      headers: { "Cookie": cookie },
    });
    
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    return Array.isArray(data.message) ? data.message : [];
  } catch (e) {
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetUser, targetName, targetPhone, title, message, url, token, type, senderToken } = body;

    if (!title || !message) {
      return NextResponse.json({ success: false, error: "Title and message are required" }, { status: 400 });
    }

    const cookie = req.headers.get("cookie") ?? "";

    // 1. Resolve Target Device Tokens (Collect all active tokens to guarantee delivery to Mobile Phones & Laptops)
    const tokensSet = new Set<string>();

    if (token) {
      tokensSet.add(token);
    } else {
      if (targetUser) {
        (await getFrappeTokens(targetUser, cookie)).forEach(t => tokensSet.add(t));
      }
      // Removed broad fallback searches (targetName/targetPhone) to prevent Frappe from returning ALL client tokens by mistake
    }

    // Only filter out the specific sender device token if explicitly provided
    if (senderToken && tokensSet.has(senderToken)) {
      tokensSet.delete(senderToken);
    }

    let targetTokens = Array.from(tokensSet);

    const notificationTitle = title;
    const notificationBody = message;
    const notificationUrl = url || "/ar/chat";

    let fcmResults: any[] = [];
    let methodUsed = "none";

    // 2A. Send via FCM HTTP v1 API with High Priority for Mobile Phones & Desktop
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "new-lab-71268";

    if (clientEmail && privateKey && targetTokens.length > 0) {
      const accessToken = await getGoogleAccessToken(clientEmail, privateKey);
      if (accessToken) {
        methodUsed = "fcm_v1_service_account";
        for (const fcmToken of targetTokens) {
          try {
            const fcmRes = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                message: {
                  token: fcmToken,
                  notification: {
                    title: notificationTitle,
                    body: notificationBody,
                  },
                  data: {
                    title: notificationTitle,
                    body: notificationBody,
                    url: notificationUrl,
                    type: type || "chat",
                  },
                  android: {
                    priority: "HIGH",
                    notification: {
                      title: notificationTitle,
                      body: notificationBody,
                      icon: "/logo192.jpeg",
                      color: "#0891b2",
                      sound: "default",
                      default_sound: true,
                      notification_priority: "PRIORITY_MAX",
                      visibility: "PUBLIC",
                    },
                  },
                  webpush: {
                    headers: {
                      Urgency: "high",
                    },
                    notification: {
                      title: notificationTitle,
                      body: notificationBody,
                      icon: "/logo192.jpeg",
                      badge: "/notification-badge.png",
                      vibrate: [200, 100, 200],
                      requireInteraction: true,
                    },
                    fcm_options: {
                      link: notificationUrl,
                    },
                  },
                  apns: {
                    headers: {
                      "apns-priority": "10",
                    },
                    payload: {
                      aps: {
                        alert: {
                          title: notificationTitle,
                          body: notificationBody,
                        },
                        sound: "default",
                        badge: 1,
                      },
                    },
                  },
                },
              }),
            });
            const fcmJson = await fcmRes.json();
            fcmResults.push({ token: fcmToken, response: fcmJson });
          } catch (e: any) {
            fcmResults.push({ token: fcmToken, error: e.message });
          }
        }
      }
    }

    // 2B. Fallback to Legacy HTTP API if Service Account wasn't used
    if (fcmResults.length === 0 && targetTokens.length > 0) {
      const serverKey =
        process.env.FIREBASE_SERVER_KEY ||
        process.env.NEXT_PUBLIC_FIREBASE_SERVER_KEY ||
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

      if (serverKey) {
        methodUsed = "fcm_legacy_key";
        for (const fcmToken of targetTokens) {
          try {
            const fcmRes = await fetch("https://fcm.googleapis.com/fcm/send", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `key=${serverKey}`,
              },
              body: JSON.stringify({
                to: fcmToken,
                notification: { title: notificationTitle, body: notificationBody, icon: "/logo192.jpeg", sound: "default" },
                data: { url: notificationUrl, type: type || "chat" },
                priority: "high",
              }),
            });
            const fcmJson = await fcmRes.json();
            fcmResults.push({ token: fcmToken, response: fcmJson });
          } catch (e: any) {
            fcmResults.push({ token: fcmToken, error: e.message });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      serverKeyConfigured: Boolean(clientEmail || process.env.FIREBASE_SERVER_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
      methodUsed,
      message: `Notification dispatched to ${targetTokens.length} devices via ${methodUsed}`,
      targetTokensCount: targetTokens.length,
      fcmResults,
    });
  } catch (error: any) {
    console.error("[FCM Send Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
