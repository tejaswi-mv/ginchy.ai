import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function middleware(request: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // Define protected routes
  const protectedRoutes = ['/dashboard', '/generate', '/my-creations'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // If trying to access a protected route without a session, redirect to sign-in
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/sign-in', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is logged in and tries to access sign-in/sign-up, redirect to generate page
  if (session && (pathname === '/sign-in' || pathname === '/sign-up')) {
    return NextResponse.redirect(new URL('/generate', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|auth/).*)',
  ],
};
