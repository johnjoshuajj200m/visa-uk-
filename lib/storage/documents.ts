import { createClient } from '@/lib/supabase/server'
import { getVisaProfile } from '@/lib/database/visa-profiles'
import {
    getDocumentByType,
    createDocumentRecord,
    deleteDocumentRecord,
} from '@/lib/database/documents'

const BUCKET_NAME = 'visa-documents'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

/**
 * Generate storage path for a document
 * Format: user_id/visa_profile_id/document_type/filename
 */
function getStoragePath(
    userId: string,
    profileId: string,
    documentType: string,
    filename: string
): string {
    // Sanitize filename
    const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
    return `${userId}/${profileId}/${documentType}/${sanitized}`
}

/**
 * Upload a document to Supabase Storage
 * Returns the storage path
 */
export async function uploadDocument(
    profileId: string,
    documentType: string,
    file: File
): Promise<string> {
    const supabase = await createClient()

    // Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    // Verify user owns the profile
    const profile = await getVisaProfile(profileId)
    if (!profile || profile.user_id !== user.id) {
        throw new Error('Unauthorized')
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error('Invalid file type. Only PDF, JPG, and PNG are allowed.')
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
        throw new Error('File too large. Maximum size is 10MB.')
    }

    // Generate storage path
    const storagePath = getStoragePath(user.id, profileId, documentType, file.name)

    // Check if document already exists in storage
    const existingDoc = await getDocumentByType(profileId, documentType)
    if (existingDoc) {
        // Delete old file from storage
        await supabase.storage.from(BUCKET_NAME).remove([existingDoc.file_path])
    }

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: true,
        })

    if (error) {
        console.error('Storage upload error:', error)
        throw new Error('Failed to upload file to storage')
    }

    return data.path
}

/**
 * Delete a document from Supabase Storage
 */
export async function deleteDocumentFromStorage(filePath: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath])

    if (error) {
        console.error('Storage delete error:', error)
        throw new Error('Failed to delete file from storage')
    }
}

/**
 * Get a signed URL for viewing a document
 * Valid for 1 hour
 */
export async function getDocumentUrl(filePath: string): Promise<string> {
    const supabase = await createClient()

    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(filePath, 3600) // 1 hour

    if (error) {
        console.error('Error getting signed URL:', error)
        throw new Error('Failed to get document URL')
    }

    return data.signedUrl
}

/**
 * Complete upload flow: upload file and save metadata
 */
export async function completeDocumentUpload(
    profileId: string,
    documentType: string,
    file: File
): Promise<{ success: true; documentId: string } | { success: false; error: string }> {
    try {
        // Upload to storage
        const filePath = await uploadDocument(profileId, documentType, file)

        // Check if record exists
        const existing = await getDocumentByType(profileId, documentType)

        if (existing) {
            // Delete old record (new one will be created)
            await deleteDocumentRecord(existing.id)
        }

        // Create new record
        const record = await createDocumentRecord(profileId, documentType, filePath)

        return { success: true, documentId: record.id }
    } catch (error) {
        console.error('Upload error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Upload failed',
        }
    }
}

/**
 * Complete delete flow: delete file from storage and remove metadata
 */
export async function completeDocumentDelete(
    profileId: string,
    documentType: string
): Promise<{ success: true } | { success: false; error: string }> {
    try {
        const supabase = await createClient()

        // Get current user
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            throw new Error('Not authenticated')
        }

        // Verify user owns the profile
        const profile = await getVisaProfile(profileId)
        if (!profile || profile.user_id !== user.id) {
            throw new Error('Unauthorized')
        }

        // Get document record
        const doc = await getDocumentByType(profileId, documentType)
        if (!doc) {
            throw new Error('Document not found')
        }

        // Delete from storage
        await deleteDocumentFromStorage(doc.file_path)

        // Delete record
        await deleteDocumentRecord(doc.id)

        return { success: true }
    } catch (error) {
        console.error('Delete error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Delete failed',
        }
    }
}
