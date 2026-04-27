import { describe, it, expect } from 'vitest'
import { extractLandmarks } from './extract-landmarks'
import { Itinerary } from '@/schemas/itinerary'

describe('extractLandmarks', () => {
  it('should extract main destination from the itinerary title', () => {
    const itinerary: Itinerary = {
      title: '冰島藍湖與雷克雅維克五日遊',
      days: [
        {
          day: 1,
          date: '2026-05-01',
          activities: [
            { time_slot: 'Morning', activity: '抵達雷克雅維克', description: '機場接送' }
          ],
          meals: { breakfast: '無', lunch: '機場', dinner: '市區餐廳' },
          accommodation: '市區飯店'
        }
      ]
    }
    const result = extractLandmarks(itinerary)
    expect(result.mainDestination).toBe('冰島藍湖與雷克雅維克五日遊')
  })

  it('should extract key landmarks from activities', () => {
    const itinerary: Itinerary = {
      title: '東京賞櫻之旅',
      days: [
        {
          day: 1,
          date: '2026-04-01',
          activities: [
            { time_slot: 'Morning', activity: '上野公園賞櫻', description: '...' },
            { time_slot: 'Afternoon', activity: '淺草寺', description: '...' },
          ],
          meals: { breakfast: '飯店', lunch: '拉麵', dinner: '壽司' },
          accommodation: '東京飯店'
        },
        {
          day: 2,
          date: '2026-04-02',
          activities: [
            { time_slot: 'Morning', activity: '明治神宮', description: '...' }
          ],
          meals: { breakfast: '飯店', lunch: '天婦羅', dinner: '居酒屋' },
          accommodation: '東京飯店'
        }
      ]
    }
    const result = extractLandmarks(itinerary)
    expect(result.landmarks).toContain('上野公園賞櫻')
    expect(result.landmarks).toContain('淺草寺')
    expect(result.landmarks).toContain('明治神宮')
  })

  it('should handle itineraries without a title', () => {
    const itinerary: Itinerary = {
      days: [
        {
          day: 1,
          date: '2026-06-01',
          activities: [
            { time_slot: 'Morning', activity: '雪梨歌劇院', description: '...' }
          ],
          meals: { breakfast: '飯店', lunch: '海鮮', dinner: '牛排' },
          accommodation: '雪梨飯店'
        }
      ]
    }
    const result = extractLandmarks(itinerary)
    expect(result.mainDestination).toBe('雪梨歌劇院') // Fallback to first activity or generic
    expect(result.landmarks).toContain('雪梨歌劇院')
  })
})