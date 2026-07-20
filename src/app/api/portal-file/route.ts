import { NextRequest, NextResponse } from "next/server";

function getSafeContentDisposition(filename: string, isDownload: boolean): string {
  const type = isDownload ? "attachment" : "inline";
  const encoded = encodeURIComponent(filename || "document.pdf");
  // RFC 5987 / RFC 6266 compliance: safe ASCII fallback + UTF-8 filename for browsers
  return `${type}; filename="${encoded}"; filename*=UTF-8''${encoded}`;
}

/**
 * Proxy for single lab result PDF from Frappe -> Cloudflare R2.
 * Step 1: Get Pre-signed URL from Frappe.
 * Step 2: Fetch PDF from R2 and stream to client.
 */
export async function GET(request: NextRequest) {
  const urlParam = request.nextUrl.searchParams.get("url") || "";
  const resultName = request.nextUrl.searchParams.get("result_name") || urlParam;
  const isDownload = request.nextUrl.searchParams.get("download") === "1";
  const customFilename = request.nextUrl.searchParams.get("filename") || "";

  if (!resultName && !urlParam) {
    return NextResponse.json({ status: "error", message: "result_name or url is required" }, { status: 400 });
  }

  // Helper: retry fetch on transient TCP connect timeouts (UND_ERR_CONNECT_TIMEOUT / fetch failed)
  async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3): Promise<Response> {
    for (let i = 0; i <= retries; i++) {
      try {
        return await fetch(url, options);
      } catch (err: any) {
        const isTimeoutOrConnectError = err?.name === "TimeoutError" || 
                                        err?.code === "UND_ERR_CONNECT_TIMEOUT" || 
                                        err?.message === "fetch failed" ||
                                        err?.cause?.code === "UND_ERR_CONNECT_TIMEOUT";
        if (i === retries || !isTimeoutOrConnectError) {
          throw err;
        }
        await new Promise(r => setTimeout(r, 1200 * (i + 1)));
      }
    }
    throw new Error("fetch failed");
  }

  // جميع التقارير والملفات (سواء VIS- أو LRI- أو أي مرفق من الدردشة) يتم طلبها من دالة download_single_pdf في Frappe لجلب رابط سحابة R2 المؤقت
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/method/newlab_site.api.download_single_pdf?result_name=${encodeURIComponent(resultName)}&file_url=${encodeURIComponent(urlParam)}`;

  try {
    const backendRes = await fetchWithRetry(apiUrl, {
      method: "GET",
      headers: {
        "Cookie": request.headers.get("cookie") ?? "",
        "Connection": "keep-alive",
      },
      signal: AbortSignal.timeout(40000),
    });

    if (!backendRes.ok) {
      if (urlParam && urlParam !== resultName) {
        const frappeBase = process.env.NEXT_PUBLIC_API_URL || "https://admin.newlabspecialized.com";
        const fallbackUrl = urlParam.startsWith("http") ? urlParam : `${frappeBase}${urlParam.startsWith('/') ? '' : '/'}${urlParam}`;
        const isFrappeServer = fallbackUrl.includes(frappeBase) && !fallbackUrl.includes("r2.cloudflarestorage.com") && !fallbackUrl.includes("amazonaws.com");
        const fetchHeaders: Record<string, string> = {};
        if (isFrappeServer) {
          fetchHeaders["Cookie"] = request.headers.get("cookie") ?? "";
        }
        try {
          const fallbackRes = await fetch(fallbackUrl, { method: "GET", headers: fetchHeaders, signal: AbortSignal.timeout(30000) });
          if (fallbackRes.ok) {
            const filename = customFilename || urlParam.split("/").pop() || "attachment";
            return new NextResponse(fallbackRes.body, {
              status: 200,
              headers: {
                "Content-Type": fallbackRes.headers.get("Content-Type") || "application/octet-stream",
                "Content-Disposition": getSafeContentDisposition(filename, isDownload),
                "Cache-Control": "private, max-age=300",
              },
            });
          }
        } catch {}
      }
      const errText = await backendRes.text();
      return NextResponse.json(
        { status: "error", message: "فشل جلب بيانات التقرير من الخادم.", frappe_status: backendRes.status, frappe_body: errText, attempted_api_url: apiUrl },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    const presignedUrl = data.message?.download_url || data.message?.file_url || data.message?.url;

    if (!presignedUrl) {
      return NextResponse.json(
        { status: "error", message: data.message?.message || "الرابط غير صالح أو الملف غير موجود.", raw_data: data },
        { status: 404 }
      );
    }

    // 🚀 التحسين المعماري الأول (تخفيف الحمل 100% عند معاينة الملفات في المتصفح وإلغاء عنق الزجاجة):
    // إذا كان الطلب للمعاينة داخل المتصفح (!isDownload)، نقوم بإعادة توجيه المتصفح مباشرة للرابط المؤقت (307 Redirect)
    // ليقوم المتصفح بتحميله من شبكة Cloudflare العالمية (CDN) مباشرة دون الضغط على سيرفر Next.js أو استهلاك الذاكرة!
    if (!isDownload) {
      return NextResponse.redirect(presignedUrl, 307);
    }

    const r2Res = await fetchWithRetry(presignedUrl, {
      method: "GET",
      headers: {
        "Connection": "keep-alive",
      },
      signal: AbortSignal.timeout(50000),
    });

    if (!r2Res.ok) {
      const r2ErrorText = await r2Res.text();
      return NextResponse.json(
        { 
          status: "error", 
          message: "تعذر قراءة الملف من الخادم السحابي.",
          debug_info: {
            r2_status_code: r2Res.status,
            r2_error_message: r2ErrorText,
            attempted_url: presignedUrl
          }
        },
        { status: 502 }
      );
    }

    const filename = customFilename || `NewLab_${resultName}.pdf`;

    return new NextResponse(r2Res.body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": getSafeContentDisposition(filename, isDownload),
        "Cache-Control": "private, max-age=300",
        "Content-Length": r2Res.headers.get("Content-Length") ?? "",
      },
    });

  } catch (err: any) {
    console.error("PDF Proxy Error:", err);
    if (err?.name === "TimeoutError") {
      return NextResponse.json({ status: "error", message: "انتهت مهلة تحميل التقرير.", error_details: err.message }, { status: 504 });
    }
    return NextResponse.json({ status: "error", message: err?.message || "تعذر الاتصال بالخادم.", error_name: err?.name, stack: err?.stack }, { status: 502 });
  }
}