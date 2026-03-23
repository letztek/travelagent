import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GooglePlaceResult } from '../types/google-places'

// We will implement this class
import { CachedGooglePlacesService } from './google-places-cache'
import { GooglePlacesService, placesService } from './google-places'
import { createAdminClient } from '@/lib/supabase/server'

vi.mock('./google-places', () => {
  const mockService = {
    searchText: vi.fn(),
    getPlaceDetails: vi.fn(),
  }
  return {
    GooglePlacesService: vi.fn().mockImplementation(() => mockService),
    placesService: mockService
  }
})

vi.mock('@/lib/supabase/server', () => {
  return {
    createAdminClient: vi.fn()
  }
})

describe('CachedGooglePlacesService', () => {
  let mockSupabase: any
  let cachedService: CachedGooglePlacesService

  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      single: vi.fn(),
      upsert: vi.fn(),
    }
    vi.mocked(createAdminClient).mockResolvedValue(mockSupabase as any)
    
    cachedService = new CachedGooglePlacesService(placesService)
  })

  it('returns cached data if available and not expired', async () => {
    const mockResult: GooglePlaceResult = { id: '123', displayName: { text: 'Test', languageCode: 'zh' } }
    mockSupabase.single.mockResolvedValue({
      data: { data: [mockResult], expires_at: new Date(Date.now() + 10000).toISOString() },
      error: null
    })

    const result = await cachedService.searchText('test query')
    
    expect(mockSupabase.from).toHaveBeenCalledWith('place_cache')
    expect(vi.mocked(placesService.searchText)).not.toHaveBeenCalled()
    expect(result).toEqual([mockResult])
  })

  it('calls underlying service and caches result if not in cache', async () => {
    const mockResult: GooglePlaceResult = { id: '123', displayName: { text: 'Test', languageCode: 'zh' } }
    mockSupabase.single.mockResolvedValue({ data: null, error: { code: 'PGRST116' } }) // Not found
    vi.mocked(placesService.searchText).mockResolvedValue([mockResult])
    mockSupabase.upsert.mockResolvedValue({ error: null })

    const result = await cachedService.searchText('new query')

    expect(vi.mocked(placesService.searchText)).toHaveBeenCalledWith('new query', 'zh-TW')
    expect(mockSupabase.upsert).toHaveBeenCalled()
    expect(result).toEqual([mockResult])
  })

  it('calls underlying service and updates cache if expired', async () => {
    const mockResult: GooglePlaceResult = { id: '123', displayName: { text: 'Updated', languageCode: 'zh' } }
    mockSupabase.single.mockResolvedValue({
      data: { data: [], expires_at: new Date(Date.now() - 10000).toISOString() }, // Expired
      error: null
    })
    vi.mocked(placesService.searchText).mockResolvedValue([mockResult])
    mockSupabase.upsert.mockResolvedValue({ error: null })

    const result = await cachedService.searchText('expired query')

    expect(vi.mocked(placesService.searchText)).toHaveBeenCalled()
    expect(mockSupabase.upsert).toHaveBeenCalled()
    expect(result).toEqual([mockResult])
  })
})
