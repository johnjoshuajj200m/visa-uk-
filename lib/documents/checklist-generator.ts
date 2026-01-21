import { UK_STUDENT_DOCUMENTS, type Document } from './uk-student-documents'

export type DocumentRequirement = Document & {
    note?: string // Contextual note based on user's answers
    priority: 'required' | 'optional' | 'conditional'
}

export type ChecklistResult = {
    required_documents: DocumentRequirement[]
    optional_documents: DocumentRequirement[]
    notes: string[]
}

/**
 * Rule engine to determine document requirements based on visa answers
 */
export function generateDocumentChecklist(
    answers: Record<string, string>
): ChecklistResult {
    const required: DocumentRequirement[] = []
    const optional: DocumentRequirement[] = []
    const notes: string[] = []

    // Always required documents
    const passport = UK_STUDENT_DOCUMENTS.find((d) => d.key === 'passport')!
    const cas = UK_STUDENT_DOCUMENTS.find((d) => d.key === 'CAS_letter')!
    const bankStatement = UK_STUDENT_DOCUMENTS.find((d) => d.key === 'bank_statement')!

    required.push({ ...passport, priority: 'required' })
    required.push({ ...cas, priority: 'required' })

    // Bank statement rules based on funding type
    const fundingType = answers['funding_type']
    if (fundingType === 'self_funded') {
        required.push({
            ...bankStatement,
            priority: 'required',
            note: 'Show £1,334 per month (up to 9 months) for London, or £1,023 for outside London, plus full tuition for first year.',
        })
    } else if (fundingType === 'scholarship') {
        required.push({
            ...bankStatement,
            priority: 'required',
            note: 'Provide scholarship award letter and proof of any remaining funds needed.',
        })
    } else if (fundingType === 'student_loan') {
        required.push({
            ...bankStatement,
            priority: 'required',
            note: 'Provide student loan approval letter showing amount and disbursement schedule.',
        })
    } else if (fundingType === 'sponsor') {
        required.push({
            ...bankStatement,
            priority: 'required',
            note: 'Submit sponsor\'s bank statements (not yours) showing sufficient funds.',
        })
    } else {
        required.push({ ...bankStatement, priority: 'required' })
    }

    // Sponsor letter (conditional on funding_type)
    const sponsorLetter = UK_STUDENT_DOCUMENTS.find((d) => d.key === 'sponsor_letter')!
    if (fundingType === 'sponsor') {
        required.push({
            ...sponsorLetter,
            priority: 'required',
            note: 'Must include relationship proof (birth certificate, etc.) and sponsor\'s consent.',
        })
    } else {
        optional.push({
            ...sponsorLetter,
            priority: 'optional',
            note: 'Only needed if someone else is funding your studies.',
        })
    }

    // TB test (conditional on nationality)
    const nationality = answers['nationality']
    const tbTest = UK_STUDENT_DOCUMENTS.find((d) => d.key === 'TB_test')!
    const tbRequiredCountries = ['india', 'pakistan', 'bangladesh', 'nigeria', 'china']

    if (tbRequiredCountries.includes(nationality)) {
        required.push({
            ...tbTest,
            priority: 'required',
            note: 'Required for nationals of TB-prevalent countries. Get tested at an approved clinic.',
        })
        notes.push('TB test is mandatory for your nationality. Book at an approved clinic listed on gov.uk.')
    } else if (nationality === 'other') {
        optional.push({
            ...tbTest,
            priority: 'conditional',
            note: 'Check gov.uk to see if TB test is required for your country.',
        })
    } else {
        notes.push('TB test is not required for your nationality.')
    }

    // Previous refusal explanation (conditional)
    const previousRefusal = answers['previous_uk_refusal']
    const refusalExplanation = UK_STUDENT_DOCUMENTS.find(
        (d) => d.key === 'previous_refusal_explanation'
    )!

    if (previousRefusal === 'yes') {
        required.push({
            ...refusalExplanation,
            priority: 'required',
            note: 'You MUST explain previous refusal and show how circumstances have changed.',
        })
        notes.push(
            'Previous visa refusal detected. Be transparent and provide detailed explanation with supporting evidence.'
        )
    } else {
        optional.push({
            ...refusalExplanation,
            priority: 'optional',
            note: 'Not applicable - no previous refusals.',
        })
    }

    // CAS status note
    const hasSponsor = answers['has_sponsor']
    if (hasSponsor === 'no') {
        notes.push(
            'You need to apply to and be accepted by a university before applying for your visa.'
        )
    } else if (hasSponsor === 'pending') {
        notes.push('Wait for your CAS to arrive before submitting your visa application.')
    }

    return {
        required_documents: required,
        optional_documents: optional,
        notes,
    }
}
