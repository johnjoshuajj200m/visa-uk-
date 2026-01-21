// UK Student Visa onboarding questions
export type Question = {
    key: string
    label: string
    type: 'select' | 'radio'
    options: { value: string; label: string }[]
}

export const UK_STUDENT_QUESTIONS: Question[] = [
    {
        key: 'nationality',
        label: 'What is your nationality?',
        type: 'select',
        options: [
            { value: 'india', label: 'India' },
            { value: 'china', label: 'China' },
            { value: 'nigeria', label: 'Nigeria' },
            { value: 'pakistan', label: 'Pakistan' },
            { value: 'bangladesh', label: 'Bangladesh' },
            { value: 'other', label: 'Other' },
        ],
    },
    {
        key: 'study_level',
        label: 'What level of study are you applying for?',
        type: 'radio',
        options: [
            { value: 'undergraduate', label: 'Undergraduate (Bachelor\'s degree)' },
            { value: 'postgraduate_taught', label: 'Postgraduate Taught (Master\'s)' },
            { value: 'postgraduate_research', label: 'Postgraduate Research (PhD)' },
            { value: 'foundation', label: 'Foundation or Pre-sessional course' },
        ],
    },
    {
        key: 'funding_type',
        label: 'How will you fund your studies?',
        type: 'radio',
        options: [
            { value: 'self_funded', label: 'Self-funded (personal or family funds)' },
            { value: 'scholarship', label: 'Scholarship or grant' },
            { value: 'student_loan', label: 'Student loan' },
            { value: 'sponsor', label: 'Financial sponsor' },
        ],
    },
    {
        key: 'has_sponsor',
        label: 'Do you have a confirmed sponsor (university acceptance)?',
        type: 'radio',
        options: [
            { value: 'yes', label: 'Yes, I have a CAS (Confirmation of Acceptance for Studies)' },
            { value: 'pending', label: 'Pending - waiting for CAS' },
            { value: 'no', label: 'No, not yet applied' },
        ],
    },
    {
        key: 'previous_uk_refusal',
        label: 'Have you previously been refused a UK visa?',
        type: 'radio',
        options: [
            { value: 'no', label: 'No' },
            { value: 'yes', label: 'Yes' },
        ],
    },
]
