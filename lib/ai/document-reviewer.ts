import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export type DocumentReview = {
    summary: string
    issues_found: string[]
    missing_information: string[]
    consistency_warnings: string[]
    risk_level: 'low' | 'medium' | 'high'
    confidence_notes: string
}

/**
 * Create a structured prompt for UK Student Visa document review
 */
function createReviewPrompt(
    documentType: string,
    documentText: string,
    visaAnswers: Record<string, string>
): string {
    return `You are a UK visa document review assistant. Analyze the following document for a UK Student Visa application.

**Document Type:** ${documentType}
**Applicant Information:**
- Nationality: ${visaAnswers.nationality || 'Unknown'}
- Study Level: ${visaAnswers.study_level || 'Unknown'}
- Funding Type: ${visaAnswers.funding_type || 'Unknown'}
- Has Sponsor (CAS): ${visaAnswers.has_sponsor || 'Unknown'}
- Previous UK Refusal: ${visaAnswers.previous_uk_refusal || 'Unknown'}

**Document Text:**
${documentText.substring(0, 10000)} ${documentText.length > 10000 ? '... (truncated)' : ''}

**Task:**
Review this document for common UKVI (UK Visas and Immigration) issues. Check for:
1. Missing required information
2. Inconsistencies with applicant's stated situation
3. Formatting or validity concerns
4. Common mistakes that lead to visa refusals

Provide a structured review in JSON format with the following fields:
- summary: Brief overview of the document (2-3 sentences)
- issues_found: Array of specific problems identified (be specific, cite what you see)
- missing_information: Array of information that should be present but isn't
- consistency_warnings: Array of things that don't match the applicant's profile
- risk_level: "low" | "medium" | "high" (overall risk of rejection based on this document)
- confidence_notes: Brief explanation of your confidence level and limitations

**IMPORTANT:**
- Do NOT promise visa approval
- Do NOT provide legal advice
- Focus on factual observations
- Be helpful but cautious
- If you cannot extract meaningful text, state that clearly

Return ONLY valid JSON, no additional text.`
}

/**
 * Review a document using OpenAI
 */
export async function reviewDocumentWithAI(
    documentType: string,
    documentText: string,
    visaAnswers: Record<string, string>
): Promise<DocumentReview> {
    try {
        const prompt = createReviewPrompt(documentType, documentText, visaAnswers)

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content:
                        'You are a helpful UK visa document reviewer. Provide structured, factual feedback. Never promise approval or give legal advice. Return only valid JSON.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.3, // Lower temperature for more consistent results
            response_format: { type: 'json_object' },
        })

        const content = response.choices[0]?.message?.content

        if (!content) {
            throw new Error('No response from OpenAI')
        }

        const review = JSON.parse(content) as DocumentReview

        // Validate required fields
        if (
            !review.summary ||
            !Array.isArray(review.issues_found) ||
            !Array.isArray(review.missing_information) ||
            !Array.isArray(review.consistency_warnings) ||
            !review.risk_level ||
            !review.confidence_notes
        ) {
            throw new Error('Invalid review JSON structure')
        }

        return review
    } catch (error) {
        console.error('AI review error:', error)

        // Return a safe fallback response
        return {
            summary: 'Unable to complete AI review due to technical error.',
            issues_found: [],
            missing_information: [],
            consistency_warnings: [],
            risk_level: 'medium',
            confidence_notes:
                'Review failed. Please manually verify this document or try again later.',
        }
    }
}
