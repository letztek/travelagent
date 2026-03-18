import { getInvitedUsersAction } from '@/app/auth/admin-actions'
import { isAdmin } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import UserManagementClient from './UserManagementClient'

export default async function AdminUsersPage() {
  // 1. Security Check
  const adminCheck = await isAdmin()
  if (!adminCheck) {
    return notFound()
  }

  // 2. Data Fetching
  const result = await getInvitedUsersAction()
  
  if (!result.success) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">使用者管理</h1>
        <p className="text-destructive">載入資料失敗：{result.error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">使用者管理</h1>
      <UserManagementClient initialUsers={result.data as any} />
    </div>
  )
}
