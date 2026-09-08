import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = await auth();
  const pathname = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/events') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/categories');

  // If no session and trying to access protected route
  if (!session && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If session and trying to access auth pages
  if (session && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Role-based access control
  if (session) {
    const userRole = session.user.role;

    // Admin-only routes
    if (
      pathname.startsWith('/users') ||
      pathname.startsWith('/organizers') ||
      pathname.startsWith('/all-events') ||
      pathname.startsWith('/categories') ||
      pathname.startsWith('/audit-logs') ||
      pathname.startsWith('/settings')
    ) {
      if (userRole !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Organizer routes
    if (pathname.startsWith('/manage-events') || pathname.startsWith('/reports')) {
      if (userRole === 'PARTICIPANT') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
