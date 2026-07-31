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
      // Fallback: If no specific tokens registered for this exact user ID, broadcast to active tokens
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

    // 2. If Firebase Server Key is available in env, send to FCM Cloud API
    const serverKey = process.env.FIREBASE_SERVER_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    
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
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Notification dispatched to ${targetTokens.length} devices`,
      targetTokensCount: targetTokens.length,
      payload,
      fcmResults,
    });
  } catch (error: any) {
    console.error("[FCM Send Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
