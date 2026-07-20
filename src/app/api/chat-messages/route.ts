import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const contactId = searchParams.get("contact_id") || "";
  const afterId = searchParams.get("after_id") || "";

  if (!contactId) {
    return NextResponse.json({ status: "success", data: [] });
  }

  let apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/method/newlab_site.api.get_chat_messages?contact_id=${encodeURIComponent(contactId)}`;
  if (afterId) {
    apiUrl += `&after_id=${encodeURIComponent(afterId)}`;
  }

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
            signal: AbortSignal.timeout(40000),
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

    if (!backendRes.ok) {
      const errText = await backendRes.text();
      console.error("🚨 Frappe GET Messages Error:", backendRes.status, errText);
      return NextResponse.json({ status: "error", message: "فشل جلب الرسائل", frappe_status: backendRes.status, frappe_body: errText }, { status: backendRes.status });
    }

    const data = await backendRes.json();
    const response = NextResponse.json(data, { status: backendRes.status });
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");

    const setCookie = backendRes.headers.get("set-cookie");
    if (setCookie) response.headers.set("set-cookie", setCookie);

    return response;
  } catch (err: any) {
    console.error("🚨 Next.js Proxy Exception (chat-messages):", err);
    return NextResponse.json({ status: "error", message: err?.message || "server_error", error_code: err?.code }, { status: 502 });
  }
}
