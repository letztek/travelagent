'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * 專門用於攔截 URL Hash 中的邀請資訊。
 * 如果使用者因為 Supabase Redirect 錯誤而降落在首頁，
 * 本組件會負責將其導向正確的 /auth/setup-password 頁面。
 */
export function InviteRedirect() {
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      
      // 偵測是否包含 Supabase 邀請的 token
      if (hash.includes('access_token=') && (hash.includes('type=invite') || hash.includes('type=signup'))) {
        console.log('偵測到邀請 Token，正在導向密碼設定頁面...')
        // 保留 hash 並導向正確的處理頁面
        router.replace('/auth/setup-password' + hash)
      }
    }
  }, [router])

  return null
}
