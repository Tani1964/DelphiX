import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow access to public routes
  const publicRoutes = ['/auth/signin', '/auth/signup', '/api/auth'];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check for session cookie (NextAuth v5 uses authjs.session-token, v4 used next-auth.session-token)
  // Also check for all possible cookie name variations
  const allCookies = request.cookies.getAll();
  const hasSessionCookie = allCookies.some(cookie => 
    cookie.name.includes('session-token') || 
    cookie.name.includes('authjs') ||
    cookie.name.includes('next-auth')
  );

  // If no session cookie and not a public route, redirect to sign in
  if (!hasSessionCookie && !isPublicRoute) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Check admin routes
  const isAdminRoute = pathname.startsWith('/admin');
  if (isAdminRoute && hasSessionCookie) {
    // For admin routes, we'll verify the role in the API route
    // The proxy just ensures they're authenticated
    // The actual role check happens in the admin API routes
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|sw.js|uploads).*)',
  ],
};

