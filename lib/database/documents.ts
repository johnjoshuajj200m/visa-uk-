import { createClient } from '@/lib/supabase/server'

export type DocumentRecord = {
    id: string
    visa_profile_id: string
    document_type: string
    file_path: string
    uploaded_at: string
}

/**
 * Get all documents for a visa profile
 */
export async function getDocuments(profileId: string): Promise<DocumentRecord[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('visa_profile_id', profileId)
        .order('uploaded_at', { ascending: false })

    if (error) {
        console.error('Error fetching documents:', error)
        throw new Error('Failed to fetch documents')
    }

    return data as DocumentRecord[]
}

/**
 * Get a document by type for a visa profile
 */
export async function getDocumentByType(
    profileId: string,
    documentType: string
): Promise<DocumentRecord | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('visa_profile_id', profileId)
        .eq('document_type', documentType)
        .single()

    if (error) {
        // No document found is not an error
        if (error.code === 'PGRST116') {
            return null
        }
        console.error('Error fetching document:', error)
        throw new Error('Failed to fetch document')
    }

    return data as DocumentRecord
}

/**
 * Create a document record
 */
export async function createDocumentRecord(
    profileId: string,
    documentType: string,
    filePath: string
): Promise<DocumentRecord> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('documents')
        .insert({
            visa_profile_id: profileId,
            document_type: documentType,
            file_path: filePath,
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating document record:', error)
        throw new Error('Failed to create document record')
    }

    return data as DocumentRecord
}

/**
 * Update a document record's file path
 */
export async function updateDocumentRecord(
    documentId: string,
    filePath: string
): Promise<DocumentRecord> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('documents')
        .update({ file_path: filePath })
        .eq('id', documentId)
        .select()
        .single()

    if (error) {
        console.error('Error updating document record:', error)
        throw new Error('Failed to update document record')
    }

    return data as DocumentRecord
}

/**
 * Delete a document record
 */
export async function deleteDocumentRecord(documentId: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)

    if (error) {
        console.error('Error deleting document record:', error)
        throw new Error('Failed to delete document record')
    }
}
