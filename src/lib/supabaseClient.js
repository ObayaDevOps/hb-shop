import { createClient } from '@supabase/supabase-js';

// Public client factory (avoid constructing at import time to keep tests happy)
let supabasePublicClient = null
export const getPublicSupabaseClient = () => {
    if (!supabasePublicClient) {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            throw new Error('Supabase URL or Anon Key missing in environment variables.');
        }
        supabasePublicClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
    }
    return supabasePublicClient
}

// Server client (uses service role - NEVER expose in browser)
// Use this ONLY in API routes or getServerSideProps/Server Actions
let supabaseServerClient = null;
export const getServerSupabaseClient = () => {
    if (!supabaseServerClient) {
         if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Supabase URL or Service Role Key missing in environment variables.');
         }
         supabaseServerClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            { auth: { persistSession: false } } // No need to persist session for service role
        );
    }
    return supabaseServerClient;
};
