import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy for fetching animated ticker messages from Frappe.
 * These are public-facing messages for the dashboard announcement bar.
 */
export async function GET(request: NextRequest) {
  const apiUrl = "https://newlabadmin.simsaarsoft.com/api/method/newlab_site.api.get_ticker_messages";

  try {
    const backendRes = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
      // Short timeout for ticker
      signal: AbortSignal.timeout(5000),
    });

    if (!backendRes.ok) {
      return NextResponse.json(
        { status: "error", message: "Failed to fetch ticker messages" },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data);

  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: "Ticker service unavailable" },
      { status: 502 }
    );
  }
}
