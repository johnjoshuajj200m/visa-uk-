'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { stripe, PREMIUM_PRICE_ID } from '@/lib/stripe/config'
import { getUserSubscription, upsertUserSubscription } from '@/lib/database/subscriptions'

/**
 * Create a Stripe Checkout session for Premium subscription
 */
export async function createCheckoutSession() {
    const supabase = await createClient()

    // Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    try {
        // Get or create Stripe customer
        let customerId: string

        const existingSub = await getUserSubscription(user.id)

        if (existingSub?.stripe_customer_id) {
            customerId = existingSub.stripe_customer_id
        } else {
            // Create new Stripe customer
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: {
                    supabase_user_id: user.id,
                },
            })
            customerId = customer.id

            // Save customer ID
            await upsertUserSubscription(user.id, {
                stripe_customer_id: customerId,
            })
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price: PREMIUM_PRICE_ID,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
            metadata: {
                supabase_user_id: user.id,
            },
        })

        return { url: session.url }
    } catch (error) {
        console.error('Error creating checkout session:', error)
        return { error: 'Failed to create checkout session' }
    }
}

/**
 * Create a Stripe Customer Portal session
 */
export async function createPortalSession() {
    const supabase = await createClient()

    // Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    try {
        const subscription = await getUserSubscription(user.id)

        if (!subscription?.stripe_customer_id) {
            return { error: 'No subscription found' }
        }

        // Create portal session
        const session = await stripe.billingPortal.sessions.create({
            customer: subscription.stripe_customer_id,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
        })

        return { url: session.url }
    } catch (error) {
        console.error('Error creating portal session:', error)
        return { error: 'Failed to create portal session' }
    }
}
