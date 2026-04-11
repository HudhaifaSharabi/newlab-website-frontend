import { NextRequest, NextResponse } from "next/server";

/**
 * Logout route:
 * 1. Calls Frappe portal_logout to invalidate the session server-side.
 * 2. Clears ALL browser cookies by reading what's there and expiring each one.
 */
export async function GET(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie") ?? "";

  // ─── 1. Tell Frappe to invalidate the session ───────────────────────────
  try {
    await fetch(
      "https://newlabadmin.simsaarsoft.com/api/method/newlab_site.api.portal_logout",
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Cookie": cookieHeader,
        },
        signal: AbortSignal.timeout(6000),
      }
    );
  } catch {
    // Ignore — we still clear local cookies regardless
  }

  // ─── 2. Clear ALL cookies from the browser ──────────────────────────────
  const response = NextResponse.json({ success: true });

  // Parse every cookie name from the request and set each to expired
  const cookieNames = cookieHeader
    .split(";")
    .map((c) => c.trim().split("=")[0])
    .filter(Boolean);

  // Always include known Frappe session cookies even if not sent
  const knownFrappeCookies = [
    "sid", "user_id", "full_name", "system_user",
    "user_image", "io.connect.sid",
  ];

  const allToDelete = Array.from(new Set([...cookieNames, ...knownFrappeCookies]));

  allToDelete.forEach((name) => {
    // Expire the cookie on the current domain (localhost or production)
    response.headers.append(
      "Set-Cookie",
      `${name}=; Max-Age=0; Path=/; SameSite=Lax`
    );
  });

  return response;
}
