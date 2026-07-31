import { NextRequest, NextResponse } from "next/server";
import { getUserFcmTokens, getAllFcmTokens } from "@/lib/fcmStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetUser, title, message, url, token, type } = body;

    if (!title || !message) {
      return NextResponse.json({ success: false, error: "Title and message are required" }, { status: 400 });
    }

    // 1. Resolve Target Tokens
    let targetTokens: string[] = [];
    if (token) {
      targetTokens = [token];
    } else if (targetUser) {
      targetTokens = getUserFcmTokens(targetUser);
      if (targetTokens.length === 0) {
        targetTokens = getAllFcmTokens();
      }
    }

    console.log(`[FCM Send] Target User: [${targetUser}], Target Tokens Count: ${targetTokens.length}`);

    const payload = {
      notification: {
        title,
        body: message,
        icon: "/logo192.jpeg",
      },
      data: {
        url: url || "/ar/results",
        type: type || "general",
        targetUser: targetUser || "",
        timestamp: new Date().toISOString(),
      },
    };

    // 2. Obtain FCM Server Key (Legacy Server Key or VAPID)
    const serverKey = process.env.FIREBASE_SERVER_KEY;
    if (!serverKey) {
      console.warn("[FCM Warning] FIREBASE_SERVER_KEY environment variable is not set on Vercel.");
    }
    
    let fcmResults = [];
    if (serverKey && targetTokens.length > 0) {
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
              notification: payload.notification,
              data: payload.data,
              priority: "high",
            }),
          });
          const fcmJson = await fcmRes.json();
          fcmResults.push({ token: fcmToken, result: fcmJson });
        } catch (e: any) {
          console.error(`[FCM Send Error] Token ${fcmToken}:`, e);
          fcmResults.push({ token: fcmToken, error: e.message });
        }
      }
    }

    return NextResponse.json({
      success: true,
      serverKeyConfigured: Boolean(serverKey),
      message: serverKey
        ? `Notification dispatched to ${targetTokens.length} devices`
        : "FIREBASE_SERVER_KEY missing in Vercel. Please add FIREBASE_SERVER_KEY to Vercel Environment Variables.",
      targetTokensCount: targetTokens.length,
      payload,
      fcmResults,
    });
  } catch (error: any) {
    console.error("[FCM Send Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
