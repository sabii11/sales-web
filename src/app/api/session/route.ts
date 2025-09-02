import { NextResponse } from 'next/server';

const isProd = process.env.NODE_ENV === 'production';

// Set a simple cookie after successful login
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: 'logged_in',
    value: '1',
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,   // HTTPS in production
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}

// Clear cookie on logout
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('logged_in', '', { path: '/', maxAge: 0 });
  return res;
}
