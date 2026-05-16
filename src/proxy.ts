import { NextResponse, NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('access_token');
  const { pathname } = request.nextUrl;

  // If trying to access dashboard without token, redirect to sign-in
  if (pathname.startsWith('/dashboard')) {
    if (!token || !token.value) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }

  // If trying to access sign-in, sign-up or root with token, redirect to dashboard
  if (pathname === '/' || pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
    if (token && token.value) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/sign-in', '/sign-up'],
};
