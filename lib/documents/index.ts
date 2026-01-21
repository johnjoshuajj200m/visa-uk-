import { getVisaAnswers } from '@/lib/database/visa-answers'
import { generateDocumentChecklist, type ChecklistResult } from './checklist-generator'

/**
 * Generate document checklist for a visa profile
 * Loads answers from database and applies rules
 */
export async function getDocumentChecklistForProfile(
    profileId: string
): Promise<ChecklistResult> {
    // Load answers from database
    const answers = await getVisaAnswers(profileId)

    // Convert to Record<string, string>
    const answersMap = answers.reduce((acc, answer) => {
        acc[answer.question_key] = answer.answer_value || ''
        return acc
    }, {} as Record<string, string>)

    // Generate checklist using rule engine
    return generateDocumentChecklist(answersMap)
}
