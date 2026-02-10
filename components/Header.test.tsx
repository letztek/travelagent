import { expect, test, vi, beforeEach, describe } from 'vitest'
import { render, screen } from '@testing-library/react'
import Header from './Header'
import { createClient } from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/app/auth/actions', () => ({
  signOut: vi.fn(),
}))

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders login and signup buttons when no user', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn(() => Promise.resolve({ data: { user: null } })) },
    } as any)

    const result = await Header()
    render(result)

    expect(screen.getByText('登入')).toBeDefined()
    expect(screen.getByText('註冊')).toBeDefined()
  })

  test('renders user display name when logged in', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn(() => Promise.resolve({ data: { user: { id: '123', email: 'test@example.com' } } })) },
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { display_name: '張三' }, error: null })),
          })),
        })),
      })),
    } as any)

    const result = await Header()
    render(result)

    expect(screen.getByText('張三')).toBeDefined()
    expect(screen.getByText('登出')).toBeDefined()
  })
})
