'use server'

import { createClient } from '@/lib/supabase/server'
import { requirementSchema, type Requirement } from '@/schemas/requirement'

export async function createRequirement(data: Requirement) {
  // 1. Validate data
  const validated = requirementSchema.safeParse(data)
  if (!validated.success) {
    return { success: false, error: validated.error.format() }
  }

  // 2. Insert into Supabase
  const supabase = await createClient()
  
  // Get current user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'User not authenticated' }
  }

  const { data: insertedData, error } = await supabase
    .from('requirements')
    .insert([
      {
        ...validated.data,
        user_id: user.id
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Supabase error:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data: insertedData }
}

export async function getRequirements() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('requirements')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Supabase error:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function getRequirement(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('requirements')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Supabase error:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}