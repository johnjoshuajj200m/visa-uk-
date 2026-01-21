'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createVisaProfile } from '@/lib/database/visa-profiles'

export async function createUKStudentVisa() {
    const supabase = await createClient()

    // Get the current user
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // TEMPORARY: Log auth context for debugging
    console.log('[CREATE_VISA] Auth check:', {
        hasUser: !!user,
        userId: user?.id,
        email: user?.email,
    })

    if (!user) {
        console.error('[CREATE_VISA] No authenticated user found')
        return { error: 'Not authenticated' }
    }

    try {
        console.log('[CREATE_VISA] Attempting to create profile for user:', user.id)
        const profile = await createVisaProfile(supabase, user.id, 'UK_STUDENT')

        console.log('[CREATE_VISA] Profile created successfully:', profile.id)

        // Revalidate the dashboard to show the new profile
        revalidatePath('/dashboard')

        return { success: true, profile }
    } catch (error) {
        // TEMPORARY: Return actual error message for debugging
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error('[CREATE_VISA] Failed to create profile:', {
            error,
            message: errorMessage,
            userId: user.id,
        })
        return { error: `[DEBUG] ${errorMessage}` }
    }
}
