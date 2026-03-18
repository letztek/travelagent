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
  
  const supabase = useMemo(() => createClient(), [])

  const form = useForm<z.infer<typeof setupSchema>>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    // 偵錯：確認環境變數是否有抓到
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth Event:', event, session ? 'Session OK' : 'No Session')
      if (session) {
        setHasSession(true)
        setError(null)
      } else {
        setHasSession(false)
      }
    })

    const checkInitialSession = async () => {
      // 1. 嘗試獲取現有 Session
      let { data: { session } } = await supabase.auth.getSession()
      
      // 2. 如果沒 Session 且有 Hash，強制執行 setSession
      if (!session && typeof window !== 'undefined' && window.location.hash) {
        const hash = window.location.hash.substring(1)
        const params = new URLSearchParams(hash)
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        const errorMsg = params.get('error_description')

        if (errorMsg) {
          setError(`邀請連結無效：${decodeURIComponent(errorMsg.replace(/\+/g, ' '))}`)
          return
        }
        
        if (accessToken && refreshToken) {
          console.log('手動從 Hash 恢復 Session...')
          const { data, error: setErrorObj } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          
          if (setErrorObj) {
            console.error('SetSession Error:', setErrorObj)
            if (setErrorObj.message.includes('User from sub claim')) {
              setError('錯誤：該邀請的使用者 ID 已在資料庫中消失。請聯繫管理員重新發送一份「全新」的邀請郵件。')
            } else {
              setError(`無法啟用邀請：${setErrorObj.message}`)
            }
          } else {
            session = data.session
            setHasSession(true)
          }
        }
      }

      if (session) {
        setHasSession(true)
      } else if (!window.location.hash.includes('access_token=')) {
        setError('找不到有效的邀請資訊，請確保您是透過郵件中的連結進入此頁面。')
      }
    }
    
    checkInitialSession()
    return () => subscription.unsubscribe()
  }, [supabase])

  async function onSubmit(values: z.infer<typeof setupSchema>) {
    setIsLoading(true)
    setError(null)
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('登入工作階段已失效。這通常是因為您點擊了舊的連結，或是該連結的使用者已被刪除。請重新點擊郵件連結。')
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
      setError(err.message)
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
            {hasSession ? '請為您的 TravelAgent 帳號設定登入密碼' : '正在驗證您的邀請資訊...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 py-3">
                  <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
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
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
