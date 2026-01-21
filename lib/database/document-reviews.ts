import { createClient } from '@/lib/supabase/server'
import type { DocumentReview } from '@/lib/ai/document-reviewer'

export type DocumentReviewRecord = {
    id: string
    document_id: string
    review_json: DocumentReview
    created_at: string
}

/**
 * Get the most recent review for a document
 */
export async function getLatestDocumentReview(
    documentId: string
): Promise<DocumentReviewRecord | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('document_reviews')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    if (error) {
        if (error.code === 'PGRST116') {
            return null // No review found
        }
        console.error('Error fetching document review:', error)
        throw new Error('Failed to fetch document review')
    }

    return data as DocumentReviewRecord
}

/**
 * Create a new document review
 */
export async function createDocumentReview(
    documentId: string,
    reviewJson: DocumentReview
): Promise<DocumentReviewRecord> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('document_reviews')
        .insert({
            document_id: documentId,
            review_json: reviewJson,
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating document review:', error)
        throw new Error('Failed to create document review')
    }

    return data as DocumentReviewRecord
}
