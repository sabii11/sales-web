// middleware.ts  (PROJECT ROOT)
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes: login and assets/APIs needed pre-auth
  const PUBLIC = [
    '/',                 // login
    '/api/session',      // cookie set/clear
  ];
  const isPublic =
    PUBLIC.includes(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/logo') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/public') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.webp') ||
    pathname.endsWith('.svg');

  if (isPublic) return NextResponse.next();

  // Auth check: our app cookie OR a Supabase auth cookie
  const hasAppCookie = req.cookies.get('logged_in')?.value === '1';
  const hasSupabaseCookie = req.cookies.getAll().some(c =>
    c.name.startsWith('sb-') || c.name.endsWith('-auth-token')
  );
  const authed = hasAppCookie || hasSupabaseCookie;

  if (!authed) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Match everything except static assets we listed above
export const config = {
  matcher: [
    // run on all paths
    '/:path*',
  ],
};
