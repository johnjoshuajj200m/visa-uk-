'use client'

import { useState } from 'react'
import { uploadDocumentAction, deleteDocumentAction } from './actions'

type DocumentUploadProps = {
    profileId: string
    documentType: string
    documentTitle: string
    isUploaded: boolean
}

export default function DocumentUpload({
    profileId,
    documentType,
    documentTitle,
    isUploaded,
}: DocumentUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        setError(null)
        setSuccess(null)

        const formData = new FormData()
        formData.append('file', file)

        const result = await uploadDocumentAction(profileId, documentType, formData)

        setUploading(false)

        if (result.success) {
            setSuccess('Document uploaded successfully!')
            setTimeout(() => setSuccess(null), 3000)
        } else {
            setError(result.error)
        }

        // Reset input
        e.target.value = ''
    }

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete this document?`)) {
            return
        }

        setDeleting(true)
        setError(null)
        setSuccess(null)

        const result = await deleteDocumentAction(profileId, documentType)

        setDeleting(false)

        if (result.success) {
            setSuccess('Document deleted successfully!')
            setTimeout(() => setSuccess(null), 3000)
        } else {
            setError(result.error)
        }
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-3">
                {!isUploaded ? (
                    <label className="cursor-pointer">
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            disabled={uploading}
                            className="hidden"
                        />
                        <span
                            className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${uploading
                                    ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                                }`}
                        >
                            {uploading ? 'Uploading...' : '📎 Upload Document'}
                        </span>
                    </label>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200">
                            ✓ Uploaded
                        </span>
                        <label className="cursor-pointer">
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                disabled={uploading}
                                className="hidden"
                            />
                            <span
                                className={`text-sm text-blue-600 dark:text-blue-400 hover:underline ${uploading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {uploading ? 'Replacing...' : 'Replace'}
                            </span>
                        </label>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className={`text-sm text-red-600 dark:text-red-400 hover:underline ${deleting ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {deleting ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3">
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
            )}

            {success && (
                <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3">
                    <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
                </div>
            )}

            <p className="text-xs text-zinc-500 dark:text-zinc-500">
                Accepted: PDF, JPG, PNG • Max size: 10MB
            </p>
        </div>
    )
}
