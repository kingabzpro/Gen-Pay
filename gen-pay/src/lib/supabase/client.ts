'use client'

import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// Mock client for demo mode without environment variables
const mockSupabase = {
  auth: {
    signUp: async () => ({ data: { user: null }, error: new Error('Demo mode: Supabase not configured') }),
    signInWithPassword: async () => ({ error: new Error('Demo mode: Supabase not configured') }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
  },
  from: () => ({
    insert: async () => ({ error: new Error('Demo mode: Supabase not configured') }),
    select: async () => ({ data: [], error: null }),
    update: async () => ({ error: new Error('Demo mode: Supabase not configured') }),
    delete: async () => ({ error: new Error('Demo mode: Supabase not configured') }),
  }),
}

// Use real client if environment variables are available and valid, otherwise use mock
const isValidSupabaseUrl = (url: string) => {
  try {
    new URL(url)
    return url.startsWith('http://') || url.startsWith('https://')
  } catch {
    return false
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey &&
  supabaseUrl !== 'your_supabase_project_url' &&
  supabaseAnonKey !== 'your_supabase_anon_key' &&
  isValidSupabaseUrl(supabaseUrl)
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : mockSupabase as any
