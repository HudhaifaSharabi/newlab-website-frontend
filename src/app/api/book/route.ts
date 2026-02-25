import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    // Forward the exact JSON payload to ERPNext
    const res = await fetch(`${apiUrl}/api/method/newlab_site.api.submit_home_visit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Booking API Route Error:", error);
    return NextResponse.json(
      { message: { status: "error", message: "Server error occurred", messageAr: "حدث خطأ في الخادم" } },
      { status: 500 }
    );
  }
}
