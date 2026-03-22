'use server'

import { runImportParserSkill, FileData } from '@/lib/skills/import-parser'
import { createClient } from '@/lib/supabase/server'
import { type Requirement } from '@/schemas/requirement'

/**
 * Parses import data by invoking the Gemini multi-modal skill.
 * Uses FormData to avoid "Maximum array nesting exceeded" errors with large payloads.
 */
export async function parseImportData(formData: FormData) {
  try {
    const textInput = formData.get('textInput') as string || ''
    const filesDataUrlsJson = formData.get('filesDataUrls') as string || '[]'
    const filesDataUrls: string[] = JSON.parse(filesDataUrlsJson)

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' }
    }

    const files: FileData[] = filesDataUrls.map(dataUrl => {
      const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
      if (!matches || matches.length !== 3) {
        throw new Error('Invalid file format: must be a base64 encoded data URL')
      }

      return {
        mimeType: matches[1],
        base64Data: matches[2]
      }
    })

    // Call the AI skill
    const result = await runImportParserSkill(textInput, files)

    // BUG-0320-01 Fix: Stringify the entire response data to cut RSC serialization tree depth.
    // This is the safest way to return deep/large objects from a Server Action.
    return { 
      success: true, 
      resultJson: JSON.stringify(result)
    }
  } catch (error: any) {
    console.error('Parse Import Data Error:', error)
    return { success: false, error: error.message || 'Failed to parse import data' }
  }
}

/**
 * Finalizes the import by saving the requirement to the database.
 * The user will be redirected to the Gap Analyzer next.
 */
export async function finalizeImport(metadata: Requirement) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  // Insert Requirement only
  const { data: reqData, error: reqError } = await supabase
    .from('requirements')
    .insert([
      {
        ...metadata,
        user_id: user.id
      }
    ])
    .select()
    .single()

  if (reqError) {
    console.error('Failed to create requirement:', reqError)
    return { success: false, error: reqError.message }
  }

  return { success: true, requirementId: reqData.id }
}
