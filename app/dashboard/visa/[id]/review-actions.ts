'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getVisaProfile } from '@/lib/database/visa-profiles'
import { getDocumentByType } from '@/lib/database/documents'
import { getVisaAnswers } from '@/lib/database/visa-answers'
import { createDocumentReview } from '@/lib/database/document-reviews'
import { extractDocumentText } from '@/lib/ai/text-extraction'
import { reviewDocumentWithAI } from '@/lib/ai/document-reviewer'
import { hasActiveSubscription } from '@/lib/database/subscriptions'

/**
 * Review a document using AI
 * Returns success/error status
 */
export async function reviewDocumentAction(
    profileId: string,
    documentType: string
) {
    try {
        const supabase = await createClient()

        // Get current user
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return { success: false, error: 'Not authenticated' }
        }

        // Verify user owns the profile
        const profile = await getVisaProfile(profileId)
        if (!profile || profile.user_id !== user.id) {
            return { success: false, error: 'Unauthorized' }
        }

        // Get the document
        const document = await getDocumentByType(profileId, documentType)
        if (!document) {
            return { success: false, error: 'Document not found' }
        }

        // Download file from storage
        const { data: fileData, error: downloadError } = await supabase.storage
            .from('visa-documents')
            .download(document.file_path)

        if (downloadError || !fileData) {
            return { success: false, error: 'Failed to download document' }
        }

        // Convert to buffer
        const arrayBuffer = await fileData.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Determine MIME type from file extension
        const extension = document.file_path.split('.').pop()?.toLowerCase()
        let mimeType = 'application/pdf'
        if (extension === 'jpg' || extension === 'jpeg') {
            mimeType = 'image/jpeg'
        } else if (extension === 'png') {
            mimeType = 'image/png'
        }

        // Extract text
        const documentText = await extractDocumentText(buffer, mimeType)

        if (!documentText || documentText.length < 10) {
            return {
                success: false,
                error: 'Could not extract meaningful text from document',
            }
        }

        // Get visa answers for context
        const answers = await getVisaAnswers(profileId)
        const answersMap = answers.reduce((acc, answer) => {
            acc[answer.question_key] = answer.answer_value || ''
            return acc
        }, {} as Record<string, string>)

        // Get AI review
        const review = await reviewDocumentWithAI(documentType, documentText, answersMap)

        // Save review to database
        await createDocumentReview(document.id, review)

        // Revalidate page
        revalidatePath(`/dashboard/visa/${profileId}`)

        return { success: true }
    } catch (error) {
        console.error('Error reviewing document:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Review failed',
        }
    }
}
