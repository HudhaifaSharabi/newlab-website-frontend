import { NextRequest, NextResponse } from "next/server";
import { registerUserFcmToken } from "@/lib/fcmStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, userIdentifier } = body;

    if (!token || !userIdentifier) {
      return NextResponse.json({ success: false, error: "Missing token or userIdentifier" }, { status: 400 });
    }

    const cleanUser = String(userIdentifier).trim().toLowerCase();
    registerUserFcmToken(cleanUser, token);

    // Sync token with backend API if configured
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) {
      fetch(`${apiUrl}/api/method/newlab_site.api.register_fcm_token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: cleanUser, fcm_token: token }),
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: `Token registered successfully for ${cleanUser}`,
    });
  } catch (error: any) {
    console.error("[FCM Register Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
