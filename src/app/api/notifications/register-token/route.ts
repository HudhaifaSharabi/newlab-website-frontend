import { NextRequest, NextResponse } from "next/server";

// In-Memory / Global Cache for user FCM tokens (User -> Tokens Array)
// In production, this can also sync with backend API or DB table
const tokenStore = new Map<string, Set<string>>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, userIdentifier } = body;

    if (!token || !userIdentifier) {
      return NextResponse.json({ success: false, error: "Missing token or userIdentifier" }, { status: 400 });
    }

    const cleanUser = String(userIdentifier).trim().toLowerCase();
    
    if (!tokenStore.has(cleanUser)) {
      tokenStore.set(cleanUser, new Set());
    }

    tokenStore.get(cleanUser)?.add(token);

    console.log(`[FCM Store] Registered FCM Token for user [${cleanUser}]:`, token);

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

function getUserTokens(userIdentifier: string): string[] {
  const cleanUser = String(userIdentifier).trim().toLowerCase();
  const tokensSet = tokenStore.get(cleanUser);
  return tokensSet ? Array.from(tokensSet) : [];
}
