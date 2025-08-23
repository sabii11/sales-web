import { NextResponse } from 'next/server';

const isProd = process.env.NODE_ENV === 'production';

export async function POST() {
  // Set a simple flag after successful login
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: 'logged_in',
    value: '1',
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,        // HTTPS only in production; works locally too
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}

export async function DELETE() {
  // Clear on logout
  const res = NextResponse.json({ ok: true });
  res.cookies.set('logged_in', '', { path: '/', maxAge: 0 });
  return res;
}
