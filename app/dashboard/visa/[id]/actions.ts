'use server'

import { revalidatePath } from 'next/cache'
import { completeDocumentUpload, completeDocumentDelete } from '@/lib/storage/documents'

export async function uploadDocumentAction(
    profileId: string,
    documentType: string,
    formData: FormData
) {
    const file = formData.get('file') as File

    if (!file) {
        return { success: false, error: 'No file provided' }
    }

    const result = await completeDocumentUpload(profileId, documentType, file)

    if (result.success) {
        revalidatePath(`/dashboard/visa/${profileId}`)
    }

    return result
}

export async function deleteDocumentAction(profileId: string, documentType: string) {
    const result = await completeDocumentDelete(profileId, documentType)

    if (result.success) {
        revalidatePath(`/dashboard/visa/${profileId}`)
    }

    return result
}
