import pdf from 'pdf-parse/lib/pdf-parse'

/**
 * Extract text from a PDF buffer
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
    try {
        const data = await pdf(buffer)
        return data.text
    } catch (error) {
        console.error('PDF extraction error:', error)
        throw new Error('Failed to extract text from PDF')
    }
}

/**
 * Normalize extracted text
 * - Remove excessive whitespace
 * - Normalize line breaks
 * - Trim
 */
export function normalizeText(text: string): Promise<string> {
    return text
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n\s*\n/g, '\n\n') // Normalize double line breaks
        .trim()
}

/**
 * Extract text from document based on MIME type
 * Currently supports PDF only
 * Images (JPG/PNG) would require OCR service (not implemented)
 */
export async function extractDocumentText(
    buffer: Buffer,
    mimeType: string
): Promise<string> {
    if (mimeType === 'application/pdf') {
        const text = await extractTextFromPDF(buffer)
        return normalizeText(text)
    }

    if (mimeType === 'image/jpeg' || mimeType === 'image/png') {
        // OCR not implemented - return placeholder
        return '[Image document - text extraction not yet supported. Manual review required.]'
    }

    throw new Error(`Unsupported document type: ${mimeType}`)
}
