'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { saveVisaAnswer } from '@/lib/database/visa-answers'
import { updateVisaProfile, getVisaProfile } from '@/lib/database/visa-profiles'
import { createClient } from '@/lib/supabase/server'

export async function saveAnswer(
    profileId: string,
    questionKey: string,
    answerValue: string
) {
    const supabase = await createClient()

    // Verify user has access to this profile
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    // Verify profile belongs to user
    const profile = await getVisaProfile(profileId)
    if (!profile || profile.user_id !== user.id) {
        return { error: 'Unauthorized' }
    }

    try {
        await saveVisaAnswer(profileId, questionKey, answerValue)
        revalidatePath(`/dashboard/visa/${profileId}/onboarding`)
        return { success: true }
    } catch (error) {
        console.error('Error saving answer:', error)
        return { error: 'Failed to save answer' }
    }
}

export async function completeOnboarding(profileId: string) {
    const supabase = await createClient()

    // Verify user has access to this profile
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    // Verify profile belongs to user
    const profile = await getVisaProfile(profileId)
    if (!profile || profile.user_id !== user.id) {
        return { error: 'Unauthorized' }
    }

    try {
        // Update status to "ready" (we'll change the status enum)
        await updateVisaProfile(profileId, { status: 'submitted' })
        revalidatePath('/dashboard')
        redirect('/dashboard')
    } catch (error) {
        console.error('Error completing onboarding:', error)
        return { error: 'Failed to complete onboarding' }
    }
}
