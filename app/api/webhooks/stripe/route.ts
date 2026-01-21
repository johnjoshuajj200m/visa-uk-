import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe/config'
import { createClient } from '@/lib/supabase/server'
import { upsertUserSubscription } from '@/lib/database/subscriptions'

export async function POST(req: NextRequest) {
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
        return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (err) {
        console.error('Webhook signature verification failed:', err)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session
                const userId = session.metadata?.supabase_user_id

                if (!userId) {
                    console.error('No user ID in session metadata')
                    break
                }

                // Get subscription from session
                const subscriptionData = await stripe.subscriptions.retrieve(
                    session.subscription as string
                )

                // Type assertion to access period_end property
                const sub = subscriptionData as unknown as { current_period_end?: number; id: string; status: string }

                await upsertUserSubscription(userId, {
                    stripe_customer_id: session.customer as string,
                    stripe_subscription_id: sub.id,
                    subscription_status: sub.status,
                    current_period_end: sub.current_period_end
                        ? new Date(sub.current_period_end * 1000).toISOString()
                        : undefined,
                })

                break
            }

            case 'customer.subscription.updated': {
                const subscriptionData = event.data.object as Stripe.Subscription

                // Type assertion to access period_end property
                const sub = subscriptionData as unknown as { current_period_end?: number; id: string; status: string; customer: string }
                const customerId = sub.customer

                // Find user by customer ID
                const supabase = await createClient()
                const { data: userSub } = await supabase
                    .from('user_subscriptions')
                    .select('user_id')
                    .eq('stripe_customer_id', customerId)
                    .single()

                if (!userSub) {
                    console.error('No user found for customer:', customerId)
                    break
                }

                // Safely access current_period_end
                const periodEnd = sub.current_period_end
                    ? new Date(sub.current_period_end * 1000).toISOString()
                    : undefined

                await upsertUserSubscription(userSub.user_id, {
                    stripe_subscription_id: sub.id,
                    subscription_status: sub.status,
                    current_period_end: periodEnd,
                })

                break
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription
                const customerId = subscription.customer as string

                // Find user by customer ID
                const supabase = await createClient()
                const { data: userSub } = await supabase
                    .from('user_subscriptions')
                    .select('user_id')
                    .eq('stripe_customer_id', customerId)
                    .single()

                if (!userSub) {
                    console.error('No user found for customer:', customerId)
                    break
                }

                await upsertUserSubscription(userSub.user_id, {
                    subscription_status: 'canceled',
                })

                break
            }

            default:
                console.log(`Unhandled event type: ${event.type}`)
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Error processing webhook:', error)
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        )
    }
}
