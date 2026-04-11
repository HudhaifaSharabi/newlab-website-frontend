import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy for single lab result PDF from Frappe -> Cloudflare R2.
 * Step 1: Get Pre-signed URL from Frappe.
 * Step 2: Fetch PDF from R2 and stream to client.
 */
export async function GET(request: NextRequest) {
  const resultName = request.nextUrl.searchParams.get("result_name");
  const isDownload = request.nextUrl.searchParams.get("download") === "1";

  if (!resultName) {
    return NextResponse.json({ status: "error", message: "result_name is required" }, { status: 400 });
  }

  // مسار API الخاص بـ Frappe
  const apiUrl = `https://newlabadmin.simsaarsoft.com/api/method/newlab_site.api.download_single_pdf?result_name=${encodeURIComponent(resultName)}`;

  try {
    // الخطوة الأولى: جلب الرابط المؤقت من Frappe
    const backendRes = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Cookie": request.headers.get("cookie") ?? "", // إرسال الجلسة للتحقق من الصلاحيات
      },
      signal: AbortSignal.timeout(10000), // مهلة قصيرة لأن الرد هنا نصي فقط
    });

    if (!backendRes.ok) {
      return NextResponse.json(
        { status: "error", message: "فشل جلب بيانات التقرير من الخادم." },
        { status: backendRes.status }
      );
    }

    // تحويل الرد إلى JSON لاستخراج الرابط
    const data = await backendRes.json();
    
    // Frappe يُغلف الرد داخل كائن "message"
    const presignedUrl = data.message?.download_url;

    if (!presignedUrl) {
      return NextResponse.json(
        { status: "error", message: data.message?.message || "الرابط غير صالح أو الملف غير موجود." },
        { status: 404 }
      );
    }

    // الخطوة الثانية: جلب الملف الفعلي من سحابة Cloudflare R2
    const r2Res = await fetch(presignedUrl, {
      method: "GET",
      signal: AbortSignal.timeout(30000), // مهلة أطول لتحميل الملف
    });

    if (!r2Res.ok) {
      const r2ErrorText = await r2Res.text();
      return NextResponse.json(
        { 
          status: "error", 
          message: "تعذر قراءة الملف من الخادم السحابي.",
          debug_info: {
            r2_status_code: r2Res.status,
            r2_error_message: r2ErrorText, // سيخبرنا هل الملف غير موجود أم الرابط مرفوض
            attempted_url: presignedUrl    // سنرى كيف شكل الرابط الذي تم توليده
          }
        },
        { status: 502 }
      );
    }

    // إعداد اسم الملف الذي سيظهر للمستخدم
    const filename = `NewLab_${resultName}.pdf`;

    // تمرير الملف (Streaming) مباشرة للمتصفح بالترويسات الصحيحة
    return new NextResponse(r2Res.body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${isDownload ? "attachment" : "inline"}; filename="${filename}"`,
        "Cache-Control": "private, max-age=300",
        "Content-Length": r2Res.headers.get("Content-Length") ?? "",
      },
    });

  } catch (err: any) {
    console.error("PDF Proxy Error:", err);
    if (err?.name === "TimeoutError") {
      return NextResponse.json({ status: "error", message: "انتهت مهلة تحميل التقرير." }, { status: 504 });
    }
    return NextResponse.json({ status: "error", message: "تعذر الاتصال بالخادم." }, { status: 502 });
  }
}