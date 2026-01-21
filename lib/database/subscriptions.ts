import { createClient } from '@/lib/supabase/server'

export type UserSubscription = {
    id: string
    user_id: string
    stripe_customer_id: string | null
    stripe_subscription_id: string | null
    subscription_status: string
    current_period_end: string | null
    created_at: string
    updated_at: string
}

/**
 * Get user's subscription
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (error) {
        if (error.code === 'PGRST116') {
            return null // No subscription found
        }
        console.error('Error fetching subscription:', error)
        throw new Error('Failed to fetch subscription')
    }

    return data as UserSubscription
}

/**
 * Check if user has active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
    const subscription = await getUserSubscription(userId)
    return subscription?.subscription_status === 'active'
}

/**
 * Create or update user subscription (use service role)
 */
export async function upsertUserSubscription(
    userId: string,
    data: {
        stripe_customer_id?: string
        stripe_subscription_id?: string
        subscription_status?: string
        current_period_end?: string
    }
): Promise<UserSubscription> {
    const supabase = await createClient()

    const { data: result, error } = await supabase
        .from('user_subscriptions')
        .upsert({
            user_id: userId,
            ...data,
        })
        .select()
        .single()

    if (error) {
        console.error('Error upserting subscription:', error)
        throw new Error('Failed to update subscription')
    }

    return result as UserSubscription
}
