import { expect, test, vi, beforeEach, describe } from 'vitest'
import { createFavorite, getFavorites, updateFavorite, deleteFavorite, suggestTags } from './actions'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn(() => ({
    getGenerativeModel: vi.fn(() => ({
      generateContent: vi.fn(() => Promise.resolve({
        response: { text: () => JSON.stringify({ tags: ['Tag A', 'Tag B'] }) }
      }))
    }))
  })),
  SchemaType: { OBJECT: 'OBJECT', ARRAY: 'ARRAY', STRING: 'STRING' }
}))

const mockChain = {
  insert: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  single: vi.fn(),
  order: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
}

const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => mockChain),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}))

describe('Favorite Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
    mockChain.insert.mockReturnThis()
    mockChain.select.mockReturnThis()
    mockChain.order.mockReturnThis()
    mockChain.eq.mockReturnThis()
    mockChain.update.mockReturnThis()
    mockChain.delete.mockReturnThis()
  })

  test('createFavorite saves favorite successfully', async () => {
    const favoriteData = {
      type: 'spot',
      name: 'Taipei 101',
      description: 'A tall building',
      location_data: { lat: 25.033, lng: 121.564 },
      tags: ['famous', 'landmark'],
    }

    mockChain.single.mockResolvedValue({ 
      data: { ...favoriteData, id: 'fav-123', user_id: 'user-123' }, 
      error: null 
    })

    const result = await createFavorite(favoriteData as any)
    expect(result.success).toBe(true)
    // @ts-ignore
    expect(result.data.name).toBe('Taipei 101')
  })

  test('getFavorites returns favorites for the user', async () => {
    // @ts-ignore
    mockChain.order.mockResolvedValue({
      data: [{ id: 'fav-123', name: 'Taipei 101' }],
      error: null
    })

    const result = await getFavorites()
    expect(result.success).toBe(true)
    // @ts-ignore
    expect(result.data).toHaveLength(1)
  })

  test('updateFavorite updates favorite successfully', async () => {
    const updateData = { name: 'New Name' }
    mockChain.single.mockResolvedValue({
      data: { id: 'fav-123', name: 'New Name' },
      error: null
    })

    const result = await updateFavorite('fav-123', updateData)
    expect(result.success).toBe(true)
    // @ts-ignore
    expect(result.data.name).toBe('New Name')
  })

  test('deleteFavorite deletes favorite successfully', async () => {
    // We want the SECOND call to eq to return the promise
    mockChain.eq
      .mockReturnValueOnce(mockChain)
      .mockResolvedValueOnce({ error: null })

    const result = await deleteFavorite('fav-123')
    expect(result.success).toBe(true)
  })

  describe('Error Paths', () => {
    test('createFavorite returns error when unauthorized', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
      const result = await createFavorite({} as any)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    test('createFavorite returns database error', async () => {
      mockChain.single.mockResolvedValue({ data: null, error: { message: 'DB Error' } })
      const result = await createFavorite({ name: 'Test' } as any)
      expect(result.success).toBe(false)
      expect(result.error).toBe('DB Error')
    })

    test('getFavorites returns error when unauthorized', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
      const result = await getFavorites()
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    test('getFavorites returns database error', async () => {
      // @ts-ignore
      mockChain.order.mockResolvedValue({ data: null, error: { message: 'DB Error' } })
      const result = await getFavorites()
      expect(result.success).toBe(false)
      expect(result.error).toBe('DB Error')
    })

    test('updateFavorite returns error when unauthorized', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
      const result = await updateFavorite('123', {})
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    test('updateFavorite returns database error', async () => {
      mockChain.single.mockResolvedValue({ data: null, error: { message: 'DB Error' } })
      const result = await updateFavorite('123', { name: 'New' })
      expect(result.success).toBe(false)
      expect(result.error).toBe('DB Error')
    })

    test('deleteFavorite returns error when unauthorized', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
      const result = await deleteFavorite('123')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    test('deleteFavorite returns database error', async () => {
      // @ts-ignore
      mockChain.eq.mockReturnValueOnce(mockChain).mockResolvedValueOnce({ error: { message: 'DB Error' } })
      const result = await deleteFavorite('123')
      expect(result.success).toBe(false)
      expect(result.error).toBe('DB Error')
    })
  })

  describe('suggestTags', () => {
    test('suggestTags returns recommended tags', async () => {
      vi.stubEnv('GEMINI_API_KEY', 'fake-key')
      const result = await suggestTags('Taipei 101')
      expect(result.success).toBe(true)
      expect(result.data).toContain('Tag A')
      vi.unstubAllEnvs()
    })
  })
})
