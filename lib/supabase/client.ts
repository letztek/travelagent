import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase 關鍵環境變數遺失！', { 
      url: !!supabaseUrl, 
      key: !!supabaseAnonKey 
    })
    throw new Error('Supabase environment variables are missing')
  }

  // 檢查 Key 是否看起來像 JWT (Supabase Anon Key 應該是 JWT)
  if (!supabaseAnonKey.startsWith('eyJ')) {
    console.warn('警告：NEXT_PUBLIC_SUPABASE_ANON_KEY 看起來不像是有效的 Supabase JWT。請檢查 .env.local')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
