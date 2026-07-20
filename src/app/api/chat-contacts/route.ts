import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy route for fetching chat centers/contacts from Frappe.
 * Includes server-side HTTP cache control headers to improve website speed.
 */
export async function GET(request: NextRequest) {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/method/newlab_site.api.get_chat_contacts`;

  try {
    const backendRes = await (async () => {
      for (let i = 0; i <= 3; i++) {
        try {
          return await fetch(apiUrl, {
            method: "GET",
            headers: {
              "Accept": "application/json",
              "Cookie": request.headers.get("cookie") ?? "",
              "Connection": "keep-alive",
            },
            signal: AbortSignal.timeout(25000),
          });
        } catch (err: any) {
          const isTimeoutOrConnectError = err?.name === "TimeoutError" || 
                                          err?.code === "UND_ERR_CONNECT_TIMEOUT" || 
                                          err?.message === "fetch failed" ||
                                          err?.cause?.code === "UND_ERR_CONNECT_TIMEOUT";
          if (i === 3 || !isTimeoutOrConnectError) throw err;
          await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        }
      }
      throw new Error("fetch failed");
    })();

    const data = await backendRes.json();

    const response = NextResponse.json(data, { status: backendRes.status });

    // Disable caching so online status and unread count update instantly
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");

    const setCookie = backendRes.headers.get("set-cookie");
    if (setCookie) response.headers.set("set-cookie", setCookie);

    return response;
  } catch (err: any) {
    if (err?.name === "TimeoutError" || err?.code === "UND_ERR_CONNECT_TIMEOUT") {
      return NextResponse.json({ status: "error", message: "timeout" }, { status: 504 });
    }
    return NextResponse.json({ status: "error", message: "server_error" }, { status: 502 });
  }
}
