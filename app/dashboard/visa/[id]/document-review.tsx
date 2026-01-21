'use client'

import { useState } from 'react'
import { reviewDocumentAction } from './review-actions'
import type { DocumentReview } from '@/lib/ai/document-reviewer'

type DocumentReviewProps = {
    profileId: string
    documentType: string
    existingReview: DocumentReview | null
}

export default function DocumentReviewComponent({
    profileId,
    documentType,
    existingReview,
}: DocumentReviewProps) {
    const [reviewing, setReviewing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [review, setReview] = useState<DocumentReview | null>(existingReview)

    const handleReview = async () => {
        setReviewing(true)
        setError(null)

        const result = await reviewDocumentAction(profileId, documentType)

        setReviewing(false)

        if (result.success) {
            // Page will revalidate and show updated review
            window.location.reload()
        } else {
            setError(result.error)
        }
    }

    const getRiskLevelColor = (level: string) => {
        switch (level) {
            case 'low':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
            case 'high':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
            default:
                return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200'
        }
    }

    return (
        <div className="space-y-4">
            {!review ? (
                <div>
                    <button
                        onClick={handleReview}
                        disabled={reviewing}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${reviewing
                                ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 cursor-not-allowed'
                                : 'bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600'
                            }`}
                    >
                        {reviewing ? '🔍 Reviewing...' : '🔍 AI Review Document'}
                    </button>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
                        Get AI-powered feedback on this document
                    </p>
                </div>
            ) : (
                <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-semibold">AI Review Results</h4>
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(
                                review.risk_level
                            )}`}
                        >
                            Risk: {review.risk_level.toUpperCase()}
                        </span>
                    </div>

                    <div>
                        <h5 className="text-sm font-medium mb-1">Summary</h5>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{review.summary}</p>
                    </div>

                    {review.issues_found.length > 0 && (
                        <div>
                            <h5 className="text-sm font-medium mb-2">Issues Found</h5>
                            <ul className="space-y-1">
                                {review.issues_found.map((issue, index) => (
                                    <li key={index} className="text-sm text-red-600 dark:text-red-400">
                                        • {issue}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {review.missing_information.length > 0 && (
                        <div>
                            <h5 className="text-sm font-medium mb-2">Missing Information</h5>
                            <ul className="space-y-1">
                                {review.missing_information.map((info, index) => (
                                    <li key={index} className="text-sm text-yellow-600 dark:text-yellow-400">
                                        • {info}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {review.consistency_warnings.length > 0 && (
                        <div>
                            <h5 className="text-sm font-medium mb-2">Consistency Warnings</h5>
                            <ul className="space-y-1">
                                {review.consistency_warnings.map((warning, index) => (
                                    <li key={index} className="text-sm text-orange-600 dark:text-orange-400">
                                        • {warning}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                        <p className="text-xs text-zinc-500 dark:text-zinc-500">
                            <strong>Note:</strong> {review.confidence_notes}
                        </p>
                    </div>

                    <button
                        onClick={handleReview}
                        disabled={reviewing}
                        className="text-sm text-purple-600 dark:text-purple-400 hover:underline disabled:opacity-50"
                    >
                        {reviewing ? 'Reviewing...' : 'Re-review Document'}
                    </button>
                </div>
            )}

            {error && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3">
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
            )}
        </div>
    )
}
