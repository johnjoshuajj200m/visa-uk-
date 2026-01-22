import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
    }

    console.log('[SUPABASE CLIENT] URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
}
