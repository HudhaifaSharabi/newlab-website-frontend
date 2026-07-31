import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetUser, title, message, url, token, type } = body;

    if (!title || !message) {
      return NextResponse.json({ success: false, error: "Title and message are required" }, { status: 400 });
    }

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

    console.log(`[FCM Send] Target User: [${targetUser}], Notification: "${title}" - "${message}"`);

    // Broadcast or specific FCM send helper
    // If specific token passed:
    if (token) {
      // Send to specific device token
      console.log(`[FCM Send] Directing push to device token: ${token}`);
    }

    return NextResponse.json({
      success: true,
      message: `Notification queued for ${targetUser || "user"}`,
      payload,
    });
  } catch (error: any) {
    console.error("[FCM Send Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
