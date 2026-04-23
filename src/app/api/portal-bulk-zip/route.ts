import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy for bulk ZIP download from Frappe.
 * Backend requires POST with result_names in the request body (not query params).
 * Response is a binary ZIP blob.
 */
export async function POST(request: NextRequest) {
  let resultNames: string[] = [];

  try {
    const body = await request.json();
    resultNames = body?.result_names ?? [];
  } catch {
    return NextResponse.json({ status: "error", message: "Invalid request body" }, { status: 400 });
  }

  if (!resultNames || resultNames.length === 0) {
    return NextResponse.json(
      { status: "error", message: "الرجاء تحديد نتيجة واحدة على الأقل." },
      { status: 400 }
    );
  }

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/method/newlab_site.api.download_bulk_zip`;

  try {
    const backendRes = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Accept": "application/zip, application/octet-stream, */*",
        "Content-Type": "application/json",
        "Cookie": request.headers.get("cookie") ?? "",
      },
      body: JSON.stringify({ result_names: resultNames }),
      signal: AbortSignal.timeout(120000), // 2 min for large ZIPs
    });

    if (!backendRes.ok) {
      const errText = await backendRes.text().catch(() => "Unknown error");
      return NextResponse.json(
        { status: "error", message: `فشل إنشاء الملف المضغوط: ${errText}` },
        { status: backendRes.status }
      );
    }

    // Read binary response (responseType: 'blob' equivalent)
    const buffer = await backendRes.arrayBuffer();

    const disposition = backendRes.headers.get("content-disposition") ?? "";
    const filenameMatch = disposition.match(/filename="?([^";\n]+)"?/i);
    const filename = filenameMatch?.[1] ?? `NewLab_Results_${Date.now()}.zip`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(buffer.byteLength),
        "Cache-Control": "no-store",
      },
    });

  } catch (err: any) {
    if (err?.name === "TimeoutError") {
      return NextResponse.json(
        { status: "error", message: "انتهت مهلة التحميل. يرجى تقليل عدد التقارير المحددة." },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { status: "error", message: "تعذر تحميل الملف المضغوط." },
      { status: 502 }
    );
  }
}
