import { supabase } from './supabase';

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  // mark browser as logged-in so middleware can allow inner pages
  try { await fetch('/api/session', { method: 'POST' }); } catch {}

  return data.user;
}
