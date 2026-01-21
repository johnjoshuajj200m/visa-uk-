'use client'

import { useState } from 'react'
import { createUKStudentVisa } from './actions'

export default function CreateVisaButton() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleCreate = async () => {
        setLoading(true)
        setError(null)

        const result = await createUKStudentVisa()

        if (result.error) {
            setError(result.error)
        }

        setLoading(false)
    }

    return (
        <div>
            <button
                onClick={handleCreate}
                disabled={loading}
                className="rounded-md bg-foreground px-6 py-3 text-background font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Creating...' : '+ Create UK Student Visa'}
            </button>
            {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
        </div>
    )
}
