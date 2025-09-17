import { type NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/lib/env';

// This route acts as a proxy to the authentication service.
// This is used by the client-side `better-auth/react` library to fetch session data
// without exposing the external auth service URL to the browser.
async function handler(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/auth', '');
  const apiUrl = `${ENV.API_BASE_URL}/api/auth${path}${url.search}`;

  try {
    const response = await fetch(apiUrl, {
      method: request.method,
      headers: {
        'Content-Type': request.headers.get('Content-Type') || 'application/json',
        Cookie: request.headers.get('Cookie') || '',
      },
      body: request.method !== 'GET' ? await request.text() : undefined,
      ...(request.method !== 'GET' && ({ duplex: 'auto' } as any)),
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('Content-Encoding');

    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (_error) {
    return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 });
  }
}

export const GET = handler;
export const POST = handler;
