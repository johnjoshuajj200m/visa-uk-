import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    // apiVersion: '2024-12-18.acacia',
    typescript: true,
})

// Product configuration
export const PREMIUM_PRICE_ID = process.env.STRIPE_PREMIUM_PRICE_ID || ''
export const PREMIUM_PRODUCT_NAME = 'UK Visa Assistant – Premium'
export const PREMIUM_PRICE_AMOUNT = 2900 // $29.00 in cents
