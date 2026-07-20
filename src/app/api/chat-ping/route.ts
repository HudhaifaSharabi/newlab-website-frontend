import { NextRequest, NextResponse } from "next/server";

/**
 * Lightweight ping route that sends a heartbeat to Frappe to update the user's presence/last_seen.
 * Called automatically by the chat views every 60 seconds when active.
 */
export async function POST(request: NextRequest) {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/method/newlab_site.api.update_user_presence`;

  try {
    const backendRes = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Cookie": request.headers.get("cookie") ?? "",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!backendRes.ok) {
      return NextResponse.json({ status: "ok", offline_fallback: true });
    }

    const data = await backendRes.json().catch(() => ({ status: "ok" }));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ status: "ok", offline_fallback: true });
  }
}
