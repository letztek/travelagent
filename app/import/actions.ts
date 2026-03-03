'use server'

import { runImportParserSkill, FileData } from '@/lib/skills/import-parser'
import { createClient } from '@/lib/supabase/server'
import { type Requirement } from '@/schemas/requirement'
import { type Itinerary } from '@/schemas/itinerary'

/**
 * Parses import data by invoking the Gemini multi-modal skill.
 * @param textInput Any text input provided by the user.
 * @param filesDataUrls Array of data URLs (e.g. "data:image/png;base64,iVBO...")
 */
export async function parseImportData(textInput: string, filesDataUrls: string[]) {
  try {
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

    return { success: true, data: result }
  } catch (error: any) {
    console.error('Parse Import Data Error:', error)
    return { success: false, error: error.message || 'Failed to parse import data' }
  }
}

/**
 * Finalizes the import by saving the requirement and itinerary to the database.
 */
export async function finalizeImport(metadata: Requirement, itineraryDraft: Itinerary) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  // 1. Insert Requirement
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

  // 2. Insert Itinerary Draft
  const { data: itinData, error: itinError } = await supabase
    .from('itineraries')
    .insert([
      {
        requirement_id: reqData.id,
        content: itineraryDraft,
        user_id: user.id
      }
    ])
    .select()
    .single()

  if (itinError) {
    console.error('Failed to create itinerary:', itinError)
    // Could optionally rollback requirement here, but ignoring for simplicity
    return { success: false, error: itinError.message }
  }

  return { success: true, itineraryId: itinData.id }
}

