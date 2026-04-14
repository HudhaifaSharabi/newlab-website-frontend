import { NextRequest, NextResponse } from "next/server";

/**
 * Proxies the change password request to the Frappe backend.
 * Expects old_password and new_password as query parameters.
 * Forwards the session cookie (sid) for authentication.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const oldPassword = searchParams.get("old_password") ?? "";
  const newPassword = searchParams.get("new_password") ?? "";

  const apiUrl = `https://newlabadmin.simsaarsoft.com/api/method/newlab_site.api.change_user_password?old_password=${encodeURIComponent(oldPassword)}&new_password=${encodeURIComponent(newPassword)}`;

  try {
    const backendRes = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Cookie": request.headers.get("cookie") ?? "",
      },
      signal: AbortSignal.timeout(10000),
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });

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
