import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const fileUrl = request.nextUrl.searchParams.get("url");

  if (!fileUrl) {
    return NextResponse.json({ status: "error", message: "url is required" }, { status: 400 });
  }

  // If it's already an absolute URL (e.g. Cloudflare R2), use it directly.
  // Otherwise, prepend the Frappe API URL.
  const absoluteUrl = fileUrl.startsWith("http") 
    ? fileUrl 
    : `${process.env.NEXT_PUBLIC_API_URL}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;

  // Only forward session cookies if fetching directly from our Frappe API server.
  // Do NOT send cookies to Cloudflare R2, S3, or pre-signed URLs, as cloud storage rejects extra auth cookies with 400 Bad Request.
  const frappeBase = process.env.NEXT_PUBLIC_API_URL || "newlabspecialized.com";
  const isFrappeServer = absoluteUrl.includes(frappeBase) && !absoluteUrl.includes("r2.cloudflarestorage.com") && !absoluteUrl.includes("amazonaws.com");

  const fetchHeaders: Record<string, string> = {};
  if (isFrappeServer) {
    fetchHeaders["Cookie"] = request.headers.get("cookie") ?? "";
  }

  try {
    const backendRes = await fetch(absoluteUrl, {
      method: "GET",
      headers: fetchHeaders,
      signal: AbortSignal.timeout(30000), // 30s timeout for downloading files
    });

    if (!backendRes.ok) {
      const errText = await backendRes.text();
      return NextResponse.json(
        { status: "error", message: "فشل تحميل الملف من الخادم.", details: errText },
        { status: backendRes.status }
      );
    }

    // Pass the file stream directly to the client with the same Content-Type
    return new NextResponse(backendRes.body, {
      status: 200,
      headers: {
        "Content-Type": backendRes.headers.get("Content-Type") || "application/octet-stream",
        "Content-Disposition": `attachment`,
        "Cache-Control": "private, max-age=300",
      },
    });

  } catch (err: any) {
    console.error("File Proxy Error:", err);
    if (err?.name === "TimeoutError") {
      return NextResponse.json({ status: "error", message: "انتهت مهلة تحميل الملف." }, { status: 504 });
    }
    return NextResponse.json({ status: "error", message: "تعذر الاتصال بالخادم." }, { status: 502 });
  }
}
