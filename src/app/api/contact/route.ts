import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ;

    const res = await fetch(`${apiUrl}/api/method/newlab_site.api.submit_contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    
    // Return whatever the API returns, preserving the status code
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { message: { status: "error", message: "Server error occurred", messageAr: "حدث خطأ في الخادم" } },
      { status: 500 }
    );
  }
}
