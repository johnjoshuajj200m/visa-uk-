import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url) {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined')
    }
    if (!key) {
        throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined')
    }

    // Log at runtime so we can verify correct URL in browser console
    console.log('[SUPABASE CLIENT RUNTIME]', url)

    return createBrowserClient(url, key)
}
