'use client'

import { useState } from 'react'
import { createCheckoutSession, createPortalSession } from './stripe-actions'

type SubscriptionButtonProps = {
    hasSubscription: boolean
}

export default function SubscriptionButton({ hasSubscription }: SubscriptionButtonProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleUpgrade = async () => {
        setLoading(true)
        setError(null)

        const result = await createCheckoutSession()

        setLoading(false)

        if (result.error) {
            setError(result.error)
        } else if (result.url) {
            window.location.href = result.url
        }
    }

    const handleManage = async () => {
        setLoading(true)
        setError(null)

        const result = await createPortalSession()

        setLoading(false)

        if (result.error) {
            setError(result.error)
        } else if (result.url) {
            window.location.href = result.url
        }
    }

    if (hasSubscription) {
        return (
            <div className="space-y-2">
                <button
                    onClick={handleManage}
                    disabled={loading}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-zinc-200 dark:bg-zinc-700 text-foreground hover:bg-zinc-300 dark:hover:bg-zinc-600 disabled:opacity-50 transition-colors"
                >
                    {loading ? 'Loading...' : 'Manage Subscription'}
                </button>
                {error && (
                    <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-2">
            <button
                onClick={handleUpgrade}
                disabled={loading}
                className="px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-colors"
            >
                {loading ? 'Loading...' : '✨ Upgrade to Premium'}
            </button>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
                $29/month • AI document review + priority support
            </p>
            {error && (
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            )}
        </div>
    )
}
