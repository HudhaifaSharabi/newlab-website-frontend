import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy route for fetching active branches from Frappe.
 * Forwards the session cookie (sid) for authentication.
 */
export async function GET(request: NextRequest) {
  const apiUrl = "https://newlabadmin.simsaarsoft.com/api/method/newlab_site.api.get_active_branches";

  try {
    const backendRes = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Cookie": request.headers.get("cookie") ?? "",
      },
      signal: AbortSignal.timeout(8000),
    });

    const data = await backendRes.json();

    const response = NextResponse.json(data, { status: backendRes.status });
    const setCookie = backendRes.headers.get("set-cookie");
    if (setCookie) response.headers.set("set-cookie", setCookie);

    return response;

  } catch (err: any) {
    if (err?.name === "TimeoutError") {
      return NextResponse.json({ status: "error", message: "timeout" }, { status: 504 });
    }
    return NextResponse.json({ status: "error", message: "server_error" }, { status: 502 });
  }
}
