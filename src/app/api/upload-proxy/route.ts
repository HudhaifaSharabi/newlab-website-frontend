import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // Allow 60 seconds for large uploads

export async function POST(request: NextRequest) {
  // Use the environment variable or fallback to the known base URL
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://admin.newlabspecialized.com";
  const apiUrl = `${baseUrl}/api/method/upload_file`;

  try {
    // 1. Read FormData from the frontend request
    const formData = await request.formData();
    
    // 2. Forward the FormData directly to Frappe.
    // Standard fetch automatically sets the correct Content-Type with multipart boundaries.
    const backendRes = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Cookie": request.headers.get("cookie") ?? "",
        "X-Frappe-CSRF-Token": request.headers.get("X-Frappe-CSRF-Token") ?? ""
      },
      body: formData,
      signal: AbortSignal.timeout(60000),
    });

    if (!backendRes.ok) {
      const errText = await backendRes.text();
      console.error("🚨 Frappe Upload Rejected:", backendRes.status, errText);
      return new Response(errText, { status: backendRes.status });
    }

    const data = await backendRes.json();
    const response = NextResponse.json(data, { status: backendRes.status });

    const setCookie = backendRes.headers.get("set-cookie");
    if (setCookie) response.headers.set("set-cookie", setCookie);

    return response;
  } catch (err: any) {
    console.error("🚨 Next.js Upload Proxy Exception:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
