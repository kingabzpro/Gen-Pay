import { createClient } from './server';
import type { User } from '@supabase/supabase-js';

export async function getCurrentUser(request?: Request): Promise<User | null> {
  const supabase = createClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getSession(request?: Request) {
  const supabase = createClient(request);
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function signOut(request?: Request) {
  const supabase = createClient(request);
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
