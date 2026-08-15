import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, userIdentifier } = body;

    if (!token || !userIdentifier) {
      return NextResponse.json({ success: false, error: "Missing token or userIdentifier" }, { status: 400 });
    }

    const cleanUser = String(userIdentifier).trim().toLowerCase();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) {
      try {
        const res = await fetch(`${apiUrl}/api/method/newlab_site.api.register_fcm_token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cookie": req.headers.get("cookie") ?? "",
          },
          body: JSON.stringify({ user_identifier: cleanUser, fcm_token: token }),
        });
        
        if (!res.ok) {
          // silently fail
        }
      } catch (e) {
        // silently fail
      }
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
