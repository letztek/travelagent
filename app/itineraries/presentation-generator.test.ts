import { expect, test, vi } from 'vitest'
import { generatePresentationPrompt } from './presentation-generator'
import { Itinerary } from '@/schemas/itinerary'

// Mock Gemini SDK
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () => `
# Slide 1: Japan Trip
![Image Prompt: Cinematic view of Tokyo Tower]

# Slide 2: Day 1 - Arrival
- Arrive at Narita
![Image Prompt: Narita Airport]

# Feature Spotlight: Senso-ji
![Image Prompt: Senso-ji Temple]
Must See: The lantern.

# Assurance
- Insurance included
          `
        }
      })
    })
  }))
}))

const mockItinerary: Itinerary = {
  days: [
    {
      day: 1,
      date: '2026-06-01',
      activities: [{ time_slot: 'Morning', activity: 'Arrival', description: 'Land in Tokyo' }],
      meals: { breakfast: 'None', lunch: 'Ramen', dinner: 'Sushi' },
      accommodation: 'Hotel Tokyo'
    }
  ]
}

test('generatePresentationPrompt returns structured markdown', async () => {
  const result = await generatePresentationPrompt(mockItinerary)
  
  expect(result.success).toBe(true)
  expect(result.data).toContain('# Slide 1: Japan Trip')
})

test('generatePresentationPrompt supports language option', async () => {
  const result = await generatePresentationPrompt(mockItinerary, 'en')
  expect(result.success).toBe(true)
  // The mock returns fixed text, so we can't check content difference without more complex mocking,
  // but we verify it runs without error.
})
