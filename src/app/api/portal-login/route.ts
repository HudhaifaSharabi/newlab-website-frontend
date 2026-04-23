import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone_number") ?? "";
  const password = searchParams.get("password") ?? "";

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/method/newlab_site.api.portal_login?password=${encodeURIComponent(password)}&phone_number=${encodeURIComponent(phone)}`;

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
    const response = NextResponse.json(data, { status: backendRes.status });

    // ─── Forward Frappe cookies but strip Domain= so browser accepts them ───
    // Frappe sets cookies with Domain=newlabadmin.simsaarsoft.com which the
    // browser rejects when they arrive from localhost. We strip the Domain
    // attribute so the browser stores them under localhost instead.
    const rawCookies: string[] = [];
    try {
      const got = (backendRes.headers as any).getSetCookie?.();
      if (Array.isArray(got) && got.length > 0) {
        rawCookies.push(...got);
      }
    } catch {}

    if (rawCookies.length === 0) {
      const single = backendRes.headers.get("set-cookie");
      if (single) rawCookies.push(single);
    }

    rawCookies.forEach((cookieStr) => {
      // Remove: Domain=..., SameSite=None, Secure (so it works over http localhost)
      const cleaned = cookieStr
        .replace(/;\s*domain=[^;]*/gi, "")
        .replace(/;\s*samesite=none/gi, "; SameSite=Lax")
        .replace(/;\s*secure(?=;|$)/gi, "");
      response.headers.append("Set-Cookie", cleaned);
    });

    return response;
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
