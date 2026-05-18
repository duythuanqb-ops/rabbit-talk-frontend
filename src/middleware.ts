import { NextResponse, NextRequest } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('access_token');
  const refreshToken = request.cookies.get('refresh_token');
  const { pathname } = request.nextUrl;

  const isDashboard = pathname.startsWith('/dashboard');
  const isAuthPage =
    pathname === '/' ||
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/sign-up');

  if (isDashboard) {
    if (accessToken?.value) {
      return NextResponse.next();
    }
    if (refreshToken?.value) {
      try {
        const refreshRes = await fetch(`${BACKEND_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            Cookie: `refresh_token=${refreshToken.value}`,
            'Content-Type': 'application/json',
          },
        });

        if (refreshRes.ok) {
          const response = NextResponse.next();
          const setCookieHeader = refreshRes.headers.get('set-cookie');

          if (setCookieHeader) {
            const tokenMatch = setCookieHeader.match(/access_token=([^;]+)/);
            if (tokenMatch) {
              response.cookies.set('access_token', tokenMatch[1], {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 15 * 60, // 15 mins in seconds
                path: '/',
              });
            }
          }
          return response;
        }
      } catch {
        // Network error talking to backend — fall through to redirect
      }
    }

    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (isAuthPage) {
    if (accessToken?.value) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/sign-in', '/sign-up'],
};
