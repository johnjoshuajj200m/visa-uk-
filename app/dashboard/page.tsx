import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getVisaProfiles, type VisaProfile } from '@/lib/database/visa-profiles'
import { getUserSubscription } from '@/lib/database/subscriptions'
import LogoutButton from './logout-button'
import CreateVisaButton from './create-visa-button'
import SubscriptionButton from './subscription-button'

export default async function DashboardPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    // Fetch user's visa profiles
    let visaProfiles: VisaProfile[] = []
    try {
        visaProfiles = await getVisaProfiles()
    } catch (error) {
        console.error('Error loading visa profiles:', error)
    }

    return (
        <div className="min-h-screen bg-background">
            <nav className="border-b border-zinc-200 dark:border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-xl font-bold">UK Visa Assistant</h1>
                        <LogoutButton />
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="space-y-8">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-bold">My Visa Applications</h2>
                            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                                Manage your UK visa applications
                            </p>
                        </div>
                        <CreateVisaButton />
                    </div>

                    {/* Account Info */}
                    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
                        <h3 className="text-lg font-semibold mb-2">Account Information</h3>
                        <div className="space-y-2">
                            <p className="text-sm">
                                <span className="font-medium">Email:</span>{' '}
                                <span className="text-zinc-600 dark:text-zinc-400">{user.email}</span>
                            </p>
                        </div>
                    </div>

                    {/* Visa Profiles List */}
                    {visaProfiles.length === 0 ? (
                        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center">
                            <div className="max-w-md mx-auto">
                                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                                    No visa applications yet
                                </h3>
                                <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                                    Get started by creating your first UK Student visa application.
                                </p>
                                <CreateVisaButton />
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {visaProfiles.map((profile) => (
                                <div
                                    key={profile.id}
                                    className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                                >
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-lg font-semibold">
                                                {profile.visa_type.replace('_', ' ')}
                                            </h3>
                                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                Created {new Date(profile.created_at).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${profile.status === 'draft'
                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
                                                    : profile.status === 'submitted'
                                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
                                                        : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                                                    }`}
                                            >
                                                {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
                                            </span>
                                        </div>

                                        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                                            <a
                                                href={`/dashboard/visa/${profile.id}/onboarding`}
                                                className="block text-sm font-medium text-foreground hover:underline"
                                            >
                                                {profile.status === 'draft' ? 'Start Application →' : 'Edit Answers →'}
                                            </a>
                                            {profile.status !== 'draft' && (
                                                <a
                                                    href={`/dashboard/visa/${profile.id}`}
                                                    className="block text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                                >
                                                    📋 View Document Checklist →
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
