import { NextRequest, NextResponse } from "next/server";
import { getUserFcmTokens, getAllFcmTokens } from "@/lib/fcmStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetUser, targetName, targetPhone, title, message, url, token, type, senderUser } = body;

    if (!title || !message) {
      return NextResponse.json({ success: false, error: "Title and message are required" }, { status: 400 });
    }

    // 1. Resolve Target Tokens with multi-identifier matching
    let targetTokens: string[] = [];

    if (token) {
      targetTokens = [token];
    } else {
      // Search by targetUser ID
      if (targetUser) {
        targetTokens = getUserFcmTokens(targetUser);
      }
      // Search by targetName
      if (targetTokens.length === 0 && targetName) {
        targetTokens = getUserFcmTokens(targetName);
      }
      // Search by targetPhone
      if (targetTokens.length === 0 && targetPhone) {
        targetTokens = getUserFcmTokens(targetPhone);
      }
      // Fallback: If exact user ID match didn't find tokens, send to all active tokens
      if (targetTokens.length === 0) {
        targetTokens = getAllFcmTokens();
      }
    }

    // Filter out sender's own token if sender token is specified
    const cleanSender = senderUser ? String(senderUser).trim().toLowerCase() : null;
    const senderTokens = cleanSender ? getUserFcmTokens(cleanSender) : [];
    if (senderTokens.length > 0 && targetTokens.length > 1) {
      targetTokens = targetTokens.filter((t) => !senderTokens.includes(t));
    }

    console.log(`[FCM Send] Target User: [${targetUser}], Sender: [${senderUser}], Resolved Tokens Count: ${targetTokens.length}`);

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

    // 2. Obtain FCM Server Key
    const serverKey = process.env.FIREBASE_SERVER_KEY;
    
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
