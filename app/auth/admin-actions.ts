'use server'

import { createAdminClient, isAdmin } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

export async function inviteUserAction(email: string) {
  // 1. Authorization check
  const adminCheck = await isAdmin()
  if (!adminCheck) {
    return { success: false, error: '只有管理員可以發送邀請。' }
  }

  try {
    // 2. Create admin client with service role
    const adminClient = await createAdminClient()

    // 3. Determine the base URL for redirection
    // Priority: NEXT_PUBLIC_SITE_URL > headers(host) > VERCEL_URL > localhost
    let baseUrl = process.env.NEXT_PUBLIC_SITE_URL
    
    if (!baseUrl) {
      const headersList = await headers()
      const host = headersList.get('host')
      if (host) {
        const protocol = host.includes('localhost') ? 'http' : 'https'
        baseUrl = `${protocol}://${host}`
      }
    }

    if (!baseUrl && process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`
    }

    if (!baseUrl) {
      baseUrl = 'http://localhost:3000'
    }

    console.log('Using baseUrl for invite:', baseUrl)

    // 4. Send invitation
    // Redirect to a dedicated password setup page to avoid hash/form conflicts
    const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${baseUrl}/auth/setup-password`,
    })

    if (error) {
      console.error('Supabase Invite Error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/users')
    return { success: true, data }
  } catch (error: any) {
    console.error('Invite Action Exception:', error)
    return { success: false, error: '伺服器發生錯誤，無法發送邀請。' }
  }
}

export async function getInvitedUsersAction() {
  const adminCheck = await isAdmin()
  if (!adminCheck) {
    return { success: false, error: '無權限存取。' }
  }

  try {
    const adminClient = await createAdminClient()
    
    // Get all users from auth.users (requires service role)
    const { data: { users }, error } = await adminClient.auth.admin.listUsers()

    if (error) throw error

    // Fetch roles for these users to determine join status
    const { data: roles } = await adminClient
      .from('user_roles')
      .select('user_id, role, created_at')

    const userList = users.map(user => ({
      id: user.id,
      email: user.email,
      last_sign_in_at: user.last_sign_in_at,
      created_at: user.created_at,
      status: user.email_confirmed_at ? 'joined' : 'invited',
      role: roles?.find(r => r.user_id === user.id)?.role || 'none'
    }))

    return { success: true, data: userList }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function revokeInvitationAction(userId: string) {
  const adminCheck = await isAdmin()
  if (!adminCheck) return { success: false, error: 'Forbidden' }

  try {
    const adminClient = await createAdminClient()
    const { error } = await adminClient.auth.admin.deleteUser(userId)
    if (error) throw error

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
