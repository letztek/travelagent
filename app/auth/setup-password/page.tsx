'use client'

import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, KeyRound, Lock } from 'lucide-react'

const setupSchema = z.object({
  password: z.string().min(6, { message: '密碼至少需要 6 個字元。' }),
  confirmPassword: z.string().min(6, { message: '請確認您的密碼。' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "密碼不一致",
  path: ["confirmPassword"],
})

export default function SetupPasswordPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSession, setHasSession] = useState(false)
  
  // Use useMemo to ensure the client is only created once
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    // Check if we have a session on mount or when auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change event:', event)
      if (session) {
        setHasSession(true)
        setError(null)
      } else {
        setHasSession(false)
      }
    })

    const checkInitialSession = async () => {
      // 1. Try to get session normally
      let { data: { session } } = await supabase.auth.getSession()
      
      // 2. If no session, check if it's in the hash and try to manually set it
      // This is a common fix for Supabase invite hash fragments
      if (!session && typeof window !== 'undefined' && window.location.hash) {
        const hash = window.location.hash.substring(1) // remove '#'
        const params = new URLSearchParams(hash)
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        
        if (accessToken && refreshToken) {
          console.log('Manually setting session from hash fragment...')
          const { data, error: setError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          if (!setError) {
            session = data.session
            setHasSession(true)
          }
        }
      }

      console.log('Initial session check result:', session ? 'Found' : 'Not Found')
      if (session) {
        setHasSession(true)
      } else if (!window.location.hash.includes('access_token=')) {
        setError('找不到有效的邀請資訊，請確保您是透過郵件中的連結進入此頁面。')
      }
    }
    
    checkInitialSession()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const form = useForm<z.infer<typeof setupSchema>>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(values: z.infer<typeof setupSchema>) {
    setIsLoading(true)
    setError(null)
    
    try {
      // Re-verify session before update
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('Submission session check:', session ? 'Found' : 'Not Found')
      
      if (sessionError) {
        throw new Error(`獲取會話時發生錯誤: ${sessionError.message}`)
      }
      
      if (!session) {
        // One last desperate attempt to parse the hash
        const hash = window.location.hash
        if (hash.includes('access_token=')) {
          setError('正在初始化您的邀請資訊，請稍候 3 秒後再點擊一次。若持續發生請點擊重新整理。')
          setIsLoading(false)
          return
        }
        throw new Error('目前沒有有效的登入工作階段 (Auth session missing)。請重新點擊郵件連結或重新整理頁面。')
      }
      
      const { error: updateError } = await supabase.auth.updateUser({ 
        password: values.password 
      })

      if (updateError) {
        setError(updateError.message)
        setIsLoading(false)
      } else {
        alert('密碼設定成功！帳號已啟用。')
        router.push('/itineraries')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || '系統發生預期外的錯誤，請嘗試重新整理頁面。')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-md border-none shadow-2xl bg-white ring-1 ring-black/5">
        <CardHeader className="space-y-1 pb-6 text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <KeyRound className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">最後一步：設定密碼</CardTitle>
          <CardDescription className="text-slate-500">
            {hasSession ? '請為您的 TravelAgent 帳號設定登入密碼' : '正在載入您的邀請資訊...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 py-3">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">新密碼</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                          type="password" 
                          placeholder="請輸入至少 6 位字元" 
                          {...field} 
                          className="pl-10 focus:ring-2 focus:ring-blue-500/20"
                          autoComplete="new-password"
                          disabled={!hasSession && !error}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">確認新密碼</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                          type="password" 
                          placeholder="請再次輸入密碼" 
                          {...field} 
                          className="pl-10 focus:ring-2 focus:ring-blue-500/20"
                          autoComplete="new-password"
                          disabled={!hasSession && !error}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 transition-all mt-2" 
                disabled={isLoading || (!hasSession && !error)}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    處理中...
                  </>
                ) : '設定密碼並開始使用'}
              </Button>
              
              {!hasSession && !error && (
                <p className="text-xs text-slate-400 text-center mt-4">
                  正在確認您的邀請狀態，請稍候...
                </p>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
