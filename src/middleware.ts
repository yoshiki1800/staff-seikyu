import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    try {
      await decrypt(session);
    } catch (err) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Redirect to dashboard if already logged in and visiting login page
  if (request.nextUrl.pathname === '/' && session) {
    try {
      await decrypt(session);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (err) {
      // session invalid, continue to login
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/'],
};
