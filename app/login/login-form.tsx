'use client'

import { useState, useEffect } from 'react'
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
import { signIn } from '@/app/auth/actions'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, KeyRound, Lock } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email({ message: '請輸入有效的電子郵件地址。' }),
  password: z.string().min(6, { message: '密碼至少需要 6 個字元。' }),
})

const inviteSchema = z.object({
  password: z.string().min(6, { message: '新密碼至少需要 6 個字元。' }),
  confirmPassword: z.string().min(6, { message: '請確認您的密碼。' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "密碼不一致",
  path: ["confirmPassword"],
})

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInviteMode, setIsInviteMode] = useState(false)

  useEffect(() => {
    // Check for invite token in hash
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      if (hash.includes('type=invite') || hash.includes('access_token=')) {
        setIsInviteMode(true)
      }
    }
  }, [])

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const inviteForm = useForm<z.infer<typeof inviteSchema>>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  async function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true)
    setError(null)
    const formData = new FormData()
    formData.append('email', values.email)
    formData.append('password', values.password)
    const result = await signIn(formData)
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  async function onInviteSubmit(values: z.infer<typeof inviteSchema>) {
    setIsLoading(true)
    setError(null)
    const supabase = createClient()
    
    // This updates the password for the current user (the one logged in via the token in the hash)
    const { error } = await supabase.auth.updateUser({ 
      password: values.password 
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
    } else {
      alert('密碼設定成功！')
      router.push('/itineraries')
      router.refresh()
    }
  }

  // Invite Mode View
  if (isInviteMode) {
    return (
      <Card className="w-full max-w-md mx-auto border-none shadow-2xl bg-white/90 backdrop-blur-md ring-1 ring-black/5">
        <CardHeader className="space-y-1 pb-6 text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <KeyRound className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">設定登入密碼</CardTitle>
          <CardDescription className="text-slate-500">
            請為您的帳號設定一個安全的密碼
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...inviteForm}>
            <form onSubmit={inviteForm.handleSubmit(onInviteSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 py-3">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <FormField
                control={inviteForm.control}
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
                          className="pl-10 bg-white focus:ring-2 focus:ring-blue-500/20"
                          autoComplete="new-password"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={inviteForm.control}
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
                          className="pl-10 bg-white focus:ring-2 focus:ring-blue-500/20"
                          autoComplete="new-password"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 transition-all mt-2 shadow-lg shadow-blue-200" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    處理中...
                  </>
                ) : '啟用帳號並登入'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    )
  }

  // Normal Login View
  return (
    <Card className="w-full max-w-md mx-auto border-none shadow-2xl bg-white/80 backdrop-blur-md ring-1 ring-black/5">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">歡迎回來</CardTitle>
        <CardDescription className="text-slate-500">
          登入以管理您的專業旅遊規劃
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...loginForm}>
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <FormField
              control={loginForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700">電子郵件</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="name@example.com" 
                      {...field} 
                      className="bg-white/50 border-slate-200 focus:border-slate-400 transition-colors"
                      autoComplete="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={loginForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700">密碼</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      {...field} 
                      className="bg-white/50 border-slate-200 focus:border-slate-400 transition-colors"
                      autoComplete="current-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full bg-slate-900 hover:bg-slate-800 text-white h-11 transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  登入中...
                </>
              ) : (
                '登入'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
