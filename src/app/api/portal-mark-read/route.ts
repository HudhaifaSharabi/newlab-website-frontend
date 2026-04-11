import { NextRequest, NextResponse } from "next/server";

/**
 * Marks a lab result as read by calling the Frappe mark_as_read endpoint.
 * Forwards the session cookie (sid) for authentication.
 */
export async function GET(request: NextRequest) {
  const resultName = request.nextUrl.searchParams.get("result_name");

  if (!resultName) {
    return NextResponse.json({ status: "error", message: "result_name is required" }, { status: 400 });
  }

  const apiUrl = `https://newlabadmin.simsaarsoft.com/api/method/newlab_site.api.mark_as_read?result_name=${encodeURIComponent(resultName)}`;

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
    return NextResponse.json(data, { status: backendRes.status });

  } catch (err: any) {
    if (err?.name === "TimeoutError") {
      return NextResponse.json({ status: "error", message: "timeout" }, { status: 504 });
    }
    return NextResponse.json({ status: "error", message: "server_error" }, { status: 502 });
  }
}
