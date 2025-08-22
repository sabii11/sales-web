import { supabase } from '@/app/lib/supabase';

export async function signIn(email: string, password: string){
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error; return data.user;
}
export async function signOut(){ await supabase.auth.signOut(); }
export async function currentUser(){ const { data } = await supabase.auth.getUser(); return data.user; }
