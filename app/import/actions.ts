'use server'

import { runImportParserSkill, FileData } from '@/lib/skills/import-parser'
import { createClient } from '@/lib/supabase/server'

/**
 * Parses import data by invoking the Gemini multi-modal skill.
 * @param textInput Any text input provided by the user.
 * @param filesDataUrls Array of data URLs (e.g. "data:image/png;base64,iVBO...")
 */
export async function parseImportData(textInput: string, filesDataUrls: string[]) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const files: FileData[] = filesDataUrls.map(dataUrl => {
    // A data URL looks like: data:[<mediatype>][;base64],<data>
    // Example: data:image/png;base64,iVBOR...
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

  return result
}
