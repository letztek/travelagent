import { describe, it, expect, vi, beforeEach } from 'vitest'
import { searchFavorites } from './favorites-search'
import { createClient } from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn()
}))

describe('Favorites Search Service', () => {
  let mockSupabase: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user_123' } } })
      }
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase)
  })

  it('performs name and address-based search correctly', async () => {
    mockSupabase.or.mockResolvedValue({ data: [{ id: '1', name: 'National Palace Museum', metadata: { formattedAddress: 'Taipei, Taiwan' } }], error: null })

    const result = await searchFavorites({ query: 'Taipei' })

    expect(mockSupabase.from).toHaveBeenCalledWith('user_favorites')
    expect(mockSupabase.or).toHaveBeenCalledWith('name.ilike.%Taipei%,description.ilike.%Taipei%,metadata->>formattedAddress.ilike.%Taipei%')
    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(1)
    expect(result.data[0].metadata.formattedAddress).toContain('Taipei')
  })

  it('performs radius-based search correctly (simulated)', async () => {
    // For radius search, we might use a rpc call or filter logic.
    // Let's assume we implement it via a specialized rpc if we want efficiency, 
    // or just fetch and filter for simplicity if it's "Private Favorites".
    // The spec says "Support both". 
    
    mockSupabase.select.mockResolvedValue({ 
      data: [
        { id: '1', name: 'Nearby', metadata: { location: { latitude: 25.0339, longitude: 121.5644 } } },
        { id: '2', name: 'Far away', metadata: { location: { latitude: 22.6273, longitude: 120.3014 } } }
      ], 
      error: null 
    })

    const result = await searchFavorites({ 
      lat: 25.0330, 
      lng: 121.5600, 
      radiusKm: 10 
    })

    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(1)
    expect(result.data[0].name).toBe('Nearby')
  })
})
