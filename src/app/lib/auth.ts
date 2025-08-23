import { supabase } from './supabase';

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  // Set our server cookie so middleware can recognize the session
  try { await fetch('/api/session', { method: 'POST' }); } catch {}

  return data.user;
}
