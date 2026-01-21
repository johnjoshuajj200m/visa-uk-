import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getVisaProfile } from '@/lib/database/visa-profiles'
import { getDocumentChecklistForProfile } from '@/lib/documents'
import { getDocuments } from '@/lib/database/documents'
import { getLatestDocumentReview } from '@/lib/database/document-reviews'
import DocumentUpload from './document-upload'
import DocumentReviewComponent from './document-review'

type PageProps = {
    params: Promise<{ id: string }>
}

export default async function VisaChecklistPage({ params }: PageProps) {
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

    // Generate document checklist
    const checklist = await getDocumentChecklistForProfile(id)

    // Get uploaded documents
    const uploadedDocuments = await getDocuments(id)
    const uploadedTypes = new Set(uploadedDocuments.map((d) => d.document_type))

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <nav className="border-b border-zinc-200 dark:border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <a href="/dashboard" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-foreground">
                                ← Back to Dashboard
                            </a>
                            <h1 className="text-xl font-bold">Document Checklist & Upload</h1>
                        </div>
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                            {profile.visa_type.replace('_', ' ')}
                        </span>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="space-y-8">
                    {/* Important Notes */}
                    {checklist.notes.length > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
                            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-3">
                                📋 Important Notes
                            </h2>
                            <ul className="space-y-2">
                                {checklist.notes.map((note, index) => (
                                    <li key={index} className="text-sm text-blue-800 dark:text-blue-300">
                                        • {note}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Required Documents */}
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Required Documents</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                            You must provide all of these documents for your UK Student Visa application.
                        </p>
                        <div className="space-y-4">
                            {checklist.required_documents.map((doc) => (
                                <div
                                    key={doc.key}
                                    className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                                            <span className="text-red-600 dark:text-red-400 text-sm">✓</span>
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <h3 className="font-semibold text-lg mb-1">{doc.title}</h3>
                                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                    {doc.description}
                                                </p>
                                            </div>

                                            {doc.note && (
                                                <div className="bg-zinc-50 dark:bg-zinc-800 rounded p-3">
                                                    <p className="text-sm font-medium text-foreground">
                                                        💡 {doc.note}
                                                    </p>
                                                </div>
                                            )}

                                            <details className="text-sm">
                                                <summary className="cursor-pointer text-zinc-600 dark:text-zinc-400 hover:text-foreground">
                                                    Common mistakes to avoid
                                                </summary>
                                                <ul className="mt-2 space-y-1 ml-4">
                                                    {doc.common_mistakes.map((mistake, index) => (
                                                        <li key={index} className="text-zinc-500 dark:text-zinc-500">
                                                            • {mistake}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </details>

                                            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                                                <DocumentUpload
                                                    profileId={id}
                                                    documentType={doc.key}
                                                    documentTitle={doc.title}
                                                    isUploaded={uploadedTypes.has(doc.key)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Optional Documents */}
                    {checklist.optional_documents.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Optional Documents</h2>
                            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                                These documents may not apply to your situation based on your answers.
                            </p>
                            <div className="space-y-4">
                                {checklist.optional_documents.map((doc) => (
                                    <div
                                        key={doc.key}
                                        className="bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 opacity-75"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                                                <span className="text-zinc-500 dark:text-zinc-400 text-sm">○</span>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg mb-1">{doc.title}</h3>
                                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                    {doc.description}
                                                </p>
                                                {doc.note && (
                                                    <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-2">
                                                        {doc.note}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
