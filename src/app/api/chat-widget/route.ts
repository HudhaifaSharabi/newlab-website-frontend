import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const res = await (async () => {
      for (let i = 0; i <= 3; i++) {
        try {
          return await fetch(`${baseUrl}/api/method/newlab_site.api.get_chat_widget`, {
            headers: {
              'Accept': 'application/json',
              'Connection': 'keep-alive'
            },
            next: { revalidate: 3600 },
            signal: AbortSignal.timeout(20000),
          });
        } catch (err: any) {
          const isTimeoutOrConnectError = err?.name === "TimeoutError" || 
                                          err?.code === "UND_ERR_CONNECT_TIMEOUT" || 
                                          err?.message === "fetch failed" ||
                                          err?.cause?.code === "UND_ERR_CONNECT_TIMEOUT";
          if (i === 3 || !isTimeoutOrConnectError) throw err;
          await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        }
      }
      throw new Error("fetch failed");
    })();
    
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
