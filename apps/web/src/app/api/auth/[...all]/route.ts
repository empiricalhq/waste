import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.BETTER_AUTH_URL || 'http://localhost:4000';

async function handler(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/auth', '');
  const apiUrl = `${API_BASE_URL}/api/auth${path}${url.search}`;

  try {
    const response = await fetch(apiUrl, {
      method: request.method,
      headers: {
        'Content-Type': request.headers.get('Content-Type') || 'application/json',
        'Cookie': request.headers.get('Cookie') || '',
      },
      body: request.method !== 'GET' ? await request.text() : undefined,
    });

    const data = await response.text();
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Set-Cookie': response.headers.get('Set-Cookie') || '',
      },
    });
  } catch (error) {
    console.error('Auth proxy error:', error);
    return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 });
  }
}

export const GET = handler;
export const POST = handler;
