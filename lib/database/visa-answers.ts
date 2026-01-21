import { createClient } from '@/lib/supabase/server'

export type VisaAnswer = {
    id: string
    visa_profile_id: string
    question_key: string
    answer_value: string | null
    created_at: string
}

/**
 * Get all answers for a visa profile
 */
export async function getVisaAnswers(profileId: string): Promise<VisaAnswer[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('visa_answers')
        .select('*')
        .eq('visa_profile_id', profileId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching visa answers:', error)
        throw new Error('Failed to fetch visa answers')
    }

    return data as VisaAnswer[]
}

/**
 * Get a single answer by question key
 */
export async function getVisaAnswer(
    profileId: string,
    questionKey: string
): Promise<VisaAnswer | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('visa_answers')
        .select('*')
        .eq('visa_profile_id', profileId)
        .eq('question_key', questionKey)
        .single()

    if (error) {
        // No answer found is not an error
        if (error.code === 'PGRST116') {
            return null
        }
        console.error('Error fetching visa answer:', error)
        throw new Error('Failed to fetch visa answer')
    }

    return data as VisaAnswer
}

/**
 * Save or update an answer
 */
export async function saveVisaAnswer(
    profileId: string,
    questionKey: string,
    answerValue: string
): Promise<VisaAnswer> {
    const supabase = await createClient()

    // Check if answer already exists
    const existing = await getVisaAnswer(profileId, questionKey)

    if (existing) {
        // Update existing answer
        const { data, error } = await supabase
            .from('visa_answers')
            .update({ answer_value: answerValue })
            .eq('id', existing.id)
            .select()
            .single()

        if (error) {
            console.error('Error updating visa answer:', error)
            throw new Error('Failed to update visa answer')
        }

        return data as VisaAnswer
    } else {
        // Insert new answer
        const { data, error } = await supabase
            .from('visa_answers')
            .insert({
                visa_profile_id: profileId,
                question_key: questionKey,
                answer_value: answerValue,
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating visa answer:', error)
            throw new Error('Failed to create visa answer')
        }

        return data as VisaAnswer
    }
}
