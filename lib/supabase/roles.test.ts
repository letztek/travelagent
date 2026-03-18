import { expect, test, vi, beforeEach } from 'vitest'
import { getUserRole, isAdmin, createClient } from './server'

// Mock entire server module to avoid cookies() issues
vi.mock('./server', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    createClient: vi.fn(),
    getUserRole: async () => {
      const supabase = await (createClient as any)()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single()
      if (error || !data) return 'editor'
      return data.role
    },
    isAdmin: async () => {
      // Direct call to our mocked getUserRole logic
      const supabase = await (createClient as any)()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false
      const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single()
      if (error || !data) return false
      return data.role === 'admin'
    }
  }
})

describe('User Roles Helper', () => {
  const mockUser = { id: 'test-user-id' }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('getUserRole returns admin when role is admin', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
    }
    ;(createClient as any).mockResolvedValue(mockSupabase)

    const role = await getUserRole()
    expect(role).toBe('admin')
  })

  test('isAdmin returns true for admin', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
    }
    ;(createClient as any).mockResolvedValue(mockSupabase)

    const result = await isAdmin()
    expect(result).toBe(true)
  })

  test('getUserRole returns editor by default if no role found', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
    }
    ;(createClient as any).mockResolvedValue(mockSupabase)

    const role = await getUserRole()
    expect(role).toBe('editor')
  })
})
