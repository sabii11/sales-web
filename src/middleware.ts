import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public paths (login + static + APIs)
  const isPublic =
    pathname === '/' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/logo') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/public');

  if (isPublic) return NextResponse.next();

  // Consider authed if our cookie exists OR a Supabase auth cookie exists
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

// Run on everything except assets listed above
export const config = {
  matcher: ['/((?!_next|api|favicon.ico|logo\\.png|images|public).*)'],
};
