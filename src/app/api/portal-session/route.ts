import { NextRequest, NextResponse } from "next/server";

/**
 * Lightweight session validation route.
 * Only used as an OPTIONAL background check — the UI renders instantly from localStorage.
 * Calls a single Frappe endpoint to verify the sid cookie is still valid.
 */
export async function GET(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie") ?? "";

  try {
    const userRes = await fetch(
      "https://newlabadmin.simsaarsoft.com/api/method/frappe.auth.get_logged_user",
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Cookie": cookieHeader,
        },
        signal: AbortSignal.timeout(5000), // Short timeout — background check
      }
    );

    const userData = await userRes.json();
    const loggedUser: string = userData?.message ?? "Guest";
    const isAuthenticated = loggedUser !== "Guest" && Boolean(loggedUser);

    return NextResponse.json({ authenticated: isAuthenticated, user: loggedUser });

  } catch {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
