import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // Allow function to run longer for large payload uploads

export async function POST(request: NextRequest) {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/method/newlab_site.api.send_chat_message`;

  try {
    const body = await request.json();
    console.log("📥 Next.js received payload. Has file_base64?", !!body.file_base64);

    const backendRes = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Cookie": request.headers.get("cookie") ?? "",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60000), // Increased from 10s to 60s for large files
    });

    if (!backendRes.ok) {
      const errText = await backendRes.text();
      console.error("🚨 Frappe Rejected Request:", backendRes.status, errText);
      return new Response(errText, { status: backendRes.status });
    }

    const data = await backendRes.json();
    const response = NextResponse.json(data, { status: backendRes.status });

    const setCookie = backendRes.headers.get("set-cookie");
    if (setCookie) response.headers.set("set-cookie", setCookie);

    return response;
  } catch (err: any) {
    console.error("🚨 Next.js Proxy Exception:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
