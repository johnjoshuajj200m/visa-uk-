import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getVisaProfile } from '@/lib/database/visa-profiles'
import { getVisaAnswers } from '@/lib/database/visa-answers'
import OnboardingForm from './onboarding-form'

type PageProps = {
    params: Promise<{ id: string }>
}

export default async function OnboardingPage({ params }: PageProps) {
    const { id } = await params
    const supabase = await createClient()

    // Check authentication
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    // Get the visa profile
    const profile = await getVisaProfile(id)

    if (!profile) {
        redirect('/dashboard')
    }

    // Verify user owns this profile
    if (profile.user_id !== user.id) {
        redirect('/dashboard')
    }

    // Get existing answers
    const answers = await getVisaAnswers(id)

    // Convert to Record
    const existingAnswers = answers.reduce((acc, answer) => {
        acc[answer.question_key] = answer.answer_value || ''
        return acc
    }, {} as Record<string, string>)

    return (
        <div className="min-h-screen bg-background py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-3xl font-bold mb-2">UK Student Visa Application</h1>
                    <p className="text-zinc-600 dark:text-zinc-400">
                        Answer a few questions to help us guide your application process
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-8">
                    <OnboardingForm profileId={id} existingAnswers={existingAnswers} />
                </div>
            </div>
        </div>
    )
}
