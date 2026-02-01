'use server'

import { getSupabase } from '@/lib/supabase'
import { requirementSchema, type Requirement } from '@/schemas/requirement'

export async function createRequirement(data: Requirement) {
  // 1. Validate data
  const validated = requirementSchema.safeParse(data)
  if (!validated.success) {
    return { success: false, error: validated.error.format() }
  }

  // 2. Insert into Supabase
  const supabase = getSupabase()
  const { data: insertedData, error } = await supabase
    .from('requirements')
    .insert([validated.data])
    .select()
    .single()

  if (error) {
    console.error('Supabase error:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data: insertedData }
}