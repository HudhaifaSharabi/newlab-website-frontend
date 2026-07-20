import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/method/newlab_site.api.mark_chat_read`;

  try {
    const body = await request.json();
    const backendRes = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Cookie": request.headers.get("cookie") ?? "",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });

    if (!backendRes.ok) {
      const errText = await backendRes.text();
      return NextResponse.json({ status: "error", message: "Frappe error", frappe_status: backendRes.status, frappe_body: errText }, { status: backendRes.status });
    }

    const data = await backendRes.json();
    const response = NextResponse.json(data, { status: backendRes.status });

    const setCookie = backendRes.headers.get("set-cookie");
    if (setCookie) response.headers.set("set-cookie", setCookie);

    return response;
  } catch (err: any) {
    return NextResponse.json({ status: "error", message: err?.message || "server_error" }, { status: 502 });
  }
}
