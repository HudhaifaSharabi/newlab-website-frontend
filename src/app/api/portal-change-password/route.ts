import { NextRequest, NextResponse } from "next/server";

/**
 * Proxies the change password request to the Frappe backend.
 * Expects old_password and new_password in the JSON body via a POST request.
 * Forwards the session cookie (sid) for authentication.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. استلام البيانات من جسم الطلب وليس من الرابط
    const body = await request.json();
    const { old_password, new_password } = body;

    if (!old_password || !new_password) {
      return NextResponse.json(
        { message: "يجب إدخال كلمة المرور الحالية والجديدة." },
        { status: 400 }
      );
    }

    const apiUrl = `https://newlabadmin.simsaarsoft.com/api/method/newlab_site.api.change_user_password`;

    // 2. إرسال الطلب إلى فرايبي كـ POST مع إرفاق البيانات في الـ Body
    const backendRes = await fetch(apiUrl, {
      method: "POST", // 👈 تم التغيير إلى POST
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Cookie": request.headers.get("cookie") ?? "",
      },
      body: JSON.stringify({ 
        old_password: old_password, 
        new_password: new_password 
      }),
      signal: AbortSignal.timeout(10000),
    });

    const data = await backendRes.json();

    // التقاط رسائل الخطأ القادمة من فرايبي (إذا كانت كلمة المرور خاطئة فعلاً)
    if (!backendRes.ok || data.exc) {
        return NextResponse.json(
            { message: data.message || "كلمة المرور الحالية غير صحيحة أو حدث خطأ." },
            { status: 400 }
        );
    }

    return NextResponse.json(data, { status: 200 });

  } catch (err: any) {
    if (err?.name === "TimeoutError") {
      return NextResponse.json(
        { message: "انتهت مهلة الاتصال بالخادم. يرجى المحاولة لاحقاً." },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { message: "تعذر الوصول إلى الخادم. تحقق من اتصالك بالإنترنت." },
      { status: 502 }
    );
  }
}