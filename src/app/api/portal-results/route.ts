import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy route for fetching lab results from Frappe backend.
 * Forwards cookies (sid) so Frappe can authenticate the user.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Build upstream query params from what the frontend sends
  const params = new URLSearchParams();
  if (searchParams.get("search_term"))     params.set("search_term", searchParams.get("search_term")!);
  if (searchParams.get("from_date"))       params.set("from_date", searchParams.get("from_date")!);
  if (searchParams.get("to_date"))         params.set("to_date", searchParams.get("to_date")!);
  if (searchParams.get("branch"))          params.set("branch", searchParams.get("branch")!);
  if (searchParams.get("limit_start"))     params.set("limit_start", searchParams.get("limit_start")!);
  if (searchParams.get("limit_page_length")) params.set("limit_page_length", searchParams.get("limit_page_length")!);

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/method/newlab_site.api.get_results?${params.toString()}`;

  try {
    const backendRes = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        // Forward the browser's session cookie (sid) to authenticate with Frappe
        "Cookie": request.headers.get("cookie") ?? "",
      },
      signal: AbortSignal.timeout(12000),
    });

    const data = await backendRes.json();

    // Forward any Set-Cookie headers (e.g. session refresh)
    const response = NextResponse.json(data, { status: backendRes.status });
    const setCookie = backendRes.headers.get("set-cookie");
    if (setCookie) response.headers.set("set-cookie", setCookie);

    return response;

  } catch (err: any) {
    if (err?.name === "TimeoutError") {
      return NextResponse.json(
        { status: "error", message: "انتهت مهلة الاتصال بالخادم." },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { status: "error", message: "تعذر الوصول إلى الخادم." },
      { status: 502 }
    );
  }
}
