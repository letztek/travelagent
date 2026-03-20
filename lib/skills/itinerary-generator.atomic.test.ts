import { expect, test, vi, describe } from 'vitest'
import { runItinerarySkill } from './itinerary-generator'

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn(() => ({
    getGenerativeModel: vi.fn(() => ({
      generateContent: vi.fn(() => Promise.resolve({
        response: { 
          text: () => JSON.stringify({
            title: "Test Itinerary",
            days: [
              {
                day: 1,
                date: "2026-03-20",
                activities: [
                  { 
                    time_slot: "Morning", 
                    activity: "Atomic Activity", 
                    description: "這是一個原子化的活動描述。" 
                  },
                  { 
                    time_slot: "Afternoon", 
                    activity: "Atomic Activity 2", 
                    description: "前往景點B參觀。" 
                  }
                ],
                meals: { breakfast: "B", lunch: "L", dinner: "D" },
                accommodation: "Hotel"
              }
            ]
          })
        }
      }))
    }))
  })),
  SchemaType: { OBJECT: 'OBJECT', ARRAY: 'ARRAY', STRING: 'STRING', INTEGER: 'INTEGER' }
}))

describe('itinerary-generator atomicity', () => {
  test('should not have multiple activities in one description', async () => {
    const requirement: any = {
      travel_dates: { start: '2026-03-20', end: '2026-03-20' },
      travelers: { adult: 1, senior: 0, child: 0, infant: 0 },
      preferences: { dietary: [], accommodation: [] }
    }
    
    const result = await runItinerarySkill(requirement)
    
    result.days.forEach(day => {
      day.activities.forEach(act => {
        // Simple heuristic for non-atomic activities: containing sequential keywords
        const nonAtomicKeywords = ['接著', '隨後', '之後前往', '然後去']
        const isNonAtomic = nonAtomicKeywords.some(k => act.description.includes(k))
        
        // This test will initially fail for our mock data, which is what we want for TDD
        // Actually, let's make it pass/fail based on real logic later
        expect(isNonAtomic, `Activity description should be atomic: "${act.description}"`).toBe(false)
      })
    })
  })
})
