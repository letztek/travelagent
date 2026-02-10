import { expect, test, vi, beforeEach } from 'vitest'
import { updateSession } from './middleware'
import { createServerClient } from '@supabase/ssr'

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    },
  })),
}))

vi.mock('next/server', () => ({
  NextResponse: {
    next: vi.fn(() => ({
      cookies: {
        getAll: vi.fn(() => []),
        set: vi.fn(),
      },
    })),
    redirect: vi.fn((url) => ({ url })),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'fake-key')
})

test('updateSession redirects to /login if no user on protected path', async () => {
  const request = {
    nextUrl: { 
      pathname: '/requirements',
      clone: vi.fn(() => new URL('http://localhost:3000/requirements'))
    },
    url: 'http://localhost:3000/requirements',
    cookies: {
      getAll: vi.fn(() => []),
    }
  }
  
  const response = await updateSession(request as any)
  expect(response.url.toString()).toContain('/login')
})

test('updateSession allows access if user exists', async () => {
  const mockGetUser = vi.fn(() => Promise.resolve({ data: { user: { id: '123' } }, error: null }))
  vi.mocked(createServerClient).mockReturnValue({
    auth: { getUser: mockGetUser },
  } as any)

  const request = {
    nextUrl: { pathname: '/requirements' },
    url: 'http://localhost:3000/requirements',
    cookies: {
      getAll: vi.fn(() => []),
    }
  }
  
  const response = await updateSession(request as any)
  expect(response.url).not.toBeDefined() // NextResponse.next() doesn't have url
})
