import { type NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/lib/env';

// Keep authentication requests on this origin while the API URL stays server-side.
async function handler(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname;
  const apiUrl = `${ENV.API_BASE_URL}${path}${url.search}`;

  try {
    const response = await fetch(apiUrl, {
      method: request.method,
      headers: {
        'Content-Type': request.headers.get('Content-Type') || 'application/json',
        Cookie: request.headers.get('Cookie') || '',
      },
      body: request.method === 'GET' ? undefined : await request.text(),
      ...(request.method !== 'GET' && ({ duplex: 'auto' } as RequestInit)),
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('Content-Encoding');

    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 });
  }
}

export const runtime = 'edge';

export const GET = handler;
export const POST = handler;
