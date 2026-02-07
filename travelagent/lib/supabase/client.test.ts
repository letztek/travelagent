import { expect, test, vi, beforeEach } from 'vitest'
import { createClient } from './client'
import { createBrowserClient } from '@supabase/ssr'

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({})),
}))

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'fake-key')
})

test('createClient calls createBrowserClient with env vars', () => {
  createClient()
  expect(createBrowserClient).toHaveBeenCalledWith(
    'https://example.supabase.co',
    'fake-key'
  )
})

test('createClient throws error if env vars are missing', () => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
  expect(() => createClient()).toThrow('Supabase environment variables are missing')
})
