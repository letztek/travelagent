import { expect, test, vi, beforeEach } from 'vitest'
import { createClient } from './server'
import { createServerClient } from '@supabase/ssr'

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({})),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    getAll: vi.fn(() => []),
    set: vi.fn(),
  })),
}))

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'fake-key')
})

test('createClient calls createServerClient with env vars', async () => {
  const client = await createClient()
  expect(createServerClient).toHaveBeenCalledWith(
    'https://example.supabase.co',
    'fake-key',
    expect.objectContaining({
      cookies: expect.any(Object),
    })
  )

  // Test cookie functions
  const mockCreateServerClient = vi.mocked(createServerClient)
  const cookieOptions = mockCreateServerClient.mock.calls[0][2].cookies

  cookieOptions.getAll()
  cookieOptions.setAll([{ name: 'test', value: 'val', options: {} }])
})

test('createClient throws error if env vars are missing', async () => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
  await expect(createClient()).rejects.toThrow('Supabase environment variables are missing')
})
