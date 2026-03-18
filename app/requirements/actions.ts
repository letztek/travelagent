'use server'

import { createClient } from '@/lib/supabase/server'
import { requirementSchema, type Requirement } from '@/schemas/requirement'
import { revalidatePath } from 'next/cache'

// Helper to check if user is admin (copied from admin-actions for consistency)
async function checkIsAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single()
  
  return !error && data?.role === 'admin'
}

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

  revalidatePath('/requirements')
  return { success: true, data: insertedData }
}

export async function getRequirements() {
  const supabase = await createClient()
  
  // Admin can see everything, normal users see only their own
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const isAdmin = await checkIsAdmin(supabase, user.id)

  let query = supabase.from('requirements').select('*')
  
  if (!isAdmin) {
    query = query.eq('user_id', user.id)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Supabase error:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function updateRequirement(id: string, data: Partial<Requirement>) {
  const supabase = await createClient()
  
  // Get current user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'User not authenticated' }
  }

  const isAdmin = await checkIsAdmin(supabase, user.id)

  let query = supabase.from('requirements').update({ ...data }).eq('id', id)
  
  // If not admin, must be the owner
  if (!isAdmin) {
    query = query.eq('user_id', user.id)
  }

  const { data: updatedData, error } = await query.select().single()

  if (error) {
    console.error('Supabase update error:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/requirements')
  return { success: true, data: updatedData }
}

export async function deleteRequirement(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'User not authenticated' }
  }

  const isAdmin = await checkIsAdmin(supabase, user.id)
  console.log(`User ${user.email} (Admin: ${isAdmin}) attempting to delete requirement ${id}`)

  // Request count to verify if anything was actually deleted
  let query = supabase.from('requirements').delete({ count: 'exact' }).eq('id', id)

  // If not admin, security check: must be owner
  if (!isAdmin) {
    query = query.eq('user_id', user.id)
  }

  const { error, count } = await query

  if (error) {
    console.error('Supabase delete error:', error)
    return { success: false, error: error.message }
  }

  console.log(`Delete operation finished. Rows affected: ${count}`)

  if (count === 0) {
    return { success: false, error: '刪除失敗：找不到該項目或您沒有足夠的權限。' }
  }

  revalidatePath('/requirements')
  revalidatePath('/itineraries')
  return { success: true }
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
