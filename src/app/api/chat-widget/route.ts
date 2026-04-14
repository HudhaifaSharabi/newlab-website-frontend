import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://newlabadmin.simsaarsoft.com";
    const res = await fetch(`${baseUrl}/api/method/newlab_site.api.get_chat_widget`, {
      headers: {
        'Accept': 'application/json'
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch from API: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Chat Widget Proxy Error:", error);
    return NextResponse.json({ error: 'Failed to fetch widget data' }, { status: 500 });
  }
}
