import { expect, test, vi } from 'vitest'
import { getSupabase } from './supabase'

test('getSupabase throws error if env vars are missing', () => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')
  expect(() => getSupabase()).toThrow('Supabase environment variables are missing')
})

test('getSupabase returns client if env vars are present', () => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'fake-key')
  const client = getSupabase()
  expect(client).toBeDefined()
})
