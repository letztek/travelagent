import { expect, test, vi, beforeEach } from 'vitest'
import { signIn, signUp, signOut } from './index'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

test('signIn calls supabase.auth.signInWithPassword', async () => {
  const mockSignIn = vi.fn(() => Promise.resolve({ error: null }))
  vi.mocked(createClient).mockResolvedValue({
    auth: { signInWithPassword: mockSignIn },
  } as any)

  const formData = new FormData()
  formData.append('email', 'test@example.com')
  formData.append('password', 'password123')

  await signIn(formData)

  expect(mockSignIn).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123',
  })
  expect(redirect).toHaveBeenCalledWith('/requirements')
})

test('signUp calls supabase.auth.signUp with metadata', async () => {
  const mockSignUp = vi.fn(() => Promise.resolve({ error: null }))
  vi.mocked(createClient).mockResolvedValue({
    auth: { signUp: mockSignUp },
  } as any)

  const formData = new FormData()
  formData.append('email', 'test@example.com')
  formData.append('password', 'password123')
  formData.append('displayName', 'Test User')

  await signUp(formData)

  expect(mockSignUp).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123',
    options: {
      data: { display_name: 'Test User' },
    },
  })
  expect(redirect).toHaveBeenCalledWith('/requirements')
})

test('signOut calls supabase.auth.signOut', async () => {
  const mockSignOut = vi.fn(() => Promise.resolve({ error: null }))
  vi.mocked(createClient).mockResolvedValue({
    auth: { signOut: mockSignOut },
  } as any)

  await signOut()

  expect(mockSignOut).toHaveBeenCalled()
  expect(redirect).toHaveBeenCalledWith('/login')
})
