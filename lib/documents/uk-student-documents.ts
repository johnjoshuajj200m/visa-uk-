// UK Student Visa document definitions
export type Document = {
    key: string
    title: string
    description: string
    common_mistakes: string[]
    required: boolean // Base requirement (can be overridden by rules)
}

export const UK_STUDENT_DOCUMENTS: Document[] = [
    {
        key: 'passport',
        title: 'Valid Passport',
        description: 'Your passport must be valid for the entire duration of your stay in the UK.',
        common_mistakes: [
            'Passport expires before course end date',
            'Insufficient blank pages (need at least 2)',
            'Damaged passport pages',
        ],
        required: true,
    },
    {
        key: 'CAS_letter',
        title: 'CAS (Confirmation of Acceptance for Studies)',
        description: 'Official confirmation from your university that you have been offered a place.',
        common_mistakes: [
            'CAS number not matching application',
            'CAS expired (valid for 6 months)',
            'Institution not on approved sponsor list',
        ],
        required: true,
    },
    {
        key: 'bank_statement',
        title: 'Financial Evidence',
        description: 'Proof that you have sufficient funds to cover tuition and living expenses.',
        common_mistakes: [
            'Bank statements older than 31 days',
            'Insufficient funds shown',
            'Not in your name or parents\' name',
            'Missing required 28-day history',
        ],
        required: true,
    },
    {
        key: 'TB_test',
        title: 'TB Test Certificate',
        description: 'Tuberculosis test certificate from an approved clinic (required for certain countries).',
        common_mistakes: [
            'Test taken at non-approved clinic',
            'Certificate expired (valid for 6 months)',
            'Not required but submitted anyway',
        ],
        required: false, // Conditional based on nationality
    },
    {
        key: 'sponsor_letter',
        title: 'Financial Sponsor Letter',
        description: 'Letter from sponsor confirming they will cover your expenses, with their financial evidence.',
        common_mistakes: [
            'Missing sponsor relationship proof',
            'Sponsor\'s bank statements not included',
            'Letter not properly formatted',
        ],
        required: false, // Conditional based on funding_type
    },
    {
        key: 'previous_refusal_explanation',
        title: 'Previous Visa Refusal Explanation',
        description: 'Detailed explanation of previous UK visa refusal and how you\'ve addressed the issues.',
        common_mistakes: [
            'Not mentioning previous refusal',
            'Insufficient explanation',
            'No evidence of changed circumstances',
        ],
        required: false, // Conditional based on previous_uk_refusal
    },
]
