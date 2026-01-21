'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UK_STUDENT_QUESTIONS, type Question } from '@/lib/questions/uk-student'
import { saveAnswer, completeOnboarding } from './actions'

type OnboardingFormProps = {
    profileId: string
    existingAnswers: Record<string, string>
}

export default function OnboardingForm({ profileId, existingAnswers }: OnboardingFormProps) {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>(existingAnswers)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const currentQuestion = UK_STUDENT_QUESTIONS[currentStep]
    const isLastQuestion = currentStep === UK_STUDENT_QUESTIONS.length - 1
    const isFirstQuestion = currentStep === 0

    const handleAnswer = (value: string) => {
        setAnswers((prev) => ({ ...prev, [currentQuestion.key]: value }))
        setError(null)
    }

    const handleNext = async () => {
        const currentAnswer = answers[currentQuestion.key]

        if (!currentAnswer) {
            setError('Please select an answer')
            return
        }

        setLoading(true)
        setError(null)

        // Save answer to database
        const result = await saveAnswer(profileId, currentQuestion.key, currentAnswer)

        if (result.error) {
            setError(result.error)
            setLoading(false)
            return
        }

        setLoading(false)

        if (isLastQuestion) {
            // Complete onboarding
            await completeOnboarding(profileId)
        } else {
            // Move to next question
            setCurrentStep((prev) => prev + 1)
        }
    }

    const handleBack = () => {
        setCurrentStep((prev) => prev - 1)
        setError(null)
    }

    const renderQuestionInput = (question: Question) => {
        const currentValue = answers[question.key] || ''

        if (question.type === 'select') {
            return (
                <select
                    value={currentValue}
                    onChange={(e) => handleAnswer(e.target.value)}
                    className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-foreground focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                >
                    <option value="">Select an option...</option>
                    {question.options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            )
        }

        if (question.type === 'radio') {
            return (
                <div className="space-y-3">
                    {question.options.map((option) => (
                        <label
                            key={option.value}
                            className="flex items-start gap-3 p-4 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                        >
                            <input
                                type="radio"
                                name={question.key}
                                value={option.value}
                                checked={currentValue === option.value}
                                onChange={(e) => handleAnswer(e.target.value)}
                                className="mt-1"
                            />
                            <span className="flex-1 text-sm">{option.label}</span>
                        </label>
                    ))}
                </div>
            )
        }

        return null
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Progress bar */}
            <div className="mb-8">
                <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                    <span>Question {currentStep + 1} of {UK_STUDENT_QUESTIONS.length}</span>
                    <span>{Math.round(((currentStep + 1) / UK_STUDENT_QUESTIONS.length) * 100)}%</span>
                </div>
                <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-foreground transition-all duration-300"
                        style={{ width: `${((currentStep + 1) / UK_STUDENT_QUESTIONS.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Question */}
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold mb-2">{currentQuestion.label}</h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        This helps us provide relevant guidance for your application.
                    </p>
                </div>

                {renderQuestionInput(currentQuestion)}

                {error && (
                    <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                        <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-6">
                    <button
                        onClick={handleBack}
                        disabled={isFirstQuestion || loading}
                        className="px-6 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Back
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={loading}
                        className="px-6 py-2 rounded-md bg-foreground text-background hover:bg-zinc-700 dark:hover:bg-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Saving...' : isLastQuestion ? 'Complete' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    )
}
