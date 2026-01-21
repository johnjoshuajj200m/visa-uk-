import { createClient } from '@/lib/supabase/server'

// TypeScript types for database tables
export type VisaProfile = {
    id: string
    user_id: string
    visa_type: string
    status: 'draft' | 'submitted' | 'decided'
    created_at: string
    updated_at: string
}

export type VisaAnswer = {
    id: string
    visa_profile_id: string
    question_key: string
    answer_value: string | null
    created_at: string
}

export type Document = {
    id: string
    visa_profile_id: string
    document_type: string
    file_path: string
    uploaded_at: string
}

/**
 * Fetch all visa profiles for the current user
 */
export async function getVisaProfiles(): Promise<VisaProfile[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('visa_profiles')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching visa profiles:', error)
        throw new Error('Failed to fetch visa profiles')
    }

    return data as VisaProfile[]
}

/**
 * Get a single visa profile by ID
 */
export async function getVisaProfile(profileId: string): Promise<VisaProfile | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('visa_profiles')
        .select('*')
        .eq('id', profileId)
        .single()

    if (error) {
        console.error('Error fetching visa profile:', error)
        return null
    }

    return data as VisaProfile
}

/**
 * Create a new visa profile for the current user
 */
export async function createVisaProfile(
    userId: string,
    visaType: string
): Promise<VisaProfile> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('visa_profiles')
        .insert({
            user_id: userId,
            visa_type: visaType,
            status: 'draft',
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating visa profile:', error)
        throw new Error('Failed to create visa profile')
    }

    return data as VisaProfile
}

/**
 * Update a visa profile
 */
export async function updateVisaProfile(
    profileId: string,
    updates: Partial<Pick<VisaProfile, 'visa_type' | 'status'>>
): Promise<VisaProfile> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('visa_profiles')
        .update(updates)
        .eq('id', profileId)
        .select()
        .single()

    if (error) {
        console.error('Error updating visa profile:', error)
        throw new Error('Failed to update visa profile')
    }

    return data as VisaProfile
}

/**
 * Delete a visa profile
 */
export async function deleteVisaProfile(profileId: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('visa_profiles')
        .delete()
        .eq('id', profileId)

    if (error) {
        console.error('Error deleting visa profile:', error)
        throw new Error('Failed to delete visa profile')
    }
}
