import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { LogOut, User, Map } from 'lucide-react'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
            <Map size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 hidden sm:inline-block">
            Slow Travel
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm font-medium">
                <User size={16} />
                <span>{profile?.display_name || user.email}</span>
              </div>
              <form action={signOut}>
                <Button variant="ghost" size="sm" className="text-slate-500 hover:text-red-600 gap-2">
                  <LogOut size={16} />
                  <span className="hidden sm:inline">登出</span>
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">登入</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800">註冊</Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
