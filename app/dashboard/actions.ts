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

    if (!user) {
        return { error: 'Not authenticated' }
    }

    try {
        const profile = await createVisaProfile(supabase, user.id, 'UK_STUDENT')

        // Revalidate the dashboard to show the new profile
        revalidatePath('/dashboard')

        return { success: true, profile }
    } catch (error) {
        console.error('Error creating visa profile:', error)
        return { error: 'Failed to create visa profile' }
    }
}
