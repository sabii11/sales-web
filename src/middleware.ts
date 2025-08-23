// src/middleware.ts
import { NextResponse, NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes (login + assets)
  const isPublic =
    pathname === '/' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/logo');

  if (isPublic) return NextResponse.next();

  // Consider user authenticated if any Supabase auth cookie exists
  const hasAuthCookie = req.cookies.getAll().some(c => {
    const n = c.name;
    return (
      n === 'sb-access-token' ||
      n === 'sb-refresh-token' ||
      n.includes('-auth-token') // covers sb-<project>-auth-token
    );
  });

  if (!hasAuthCookie) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Protect every route except the public ones above
export const config = {
  matcher: ['/((?!_next|api|favicon.ico|logo\\.png).*)'],
};
