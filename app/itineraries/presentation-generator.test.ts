import { expect, test, vi, beforeEach } from 'vitest'
import { generatePresentationPrompt } from './presentation-generator'
import { Itinerary } from '@/schemas/itinerary'

const mockGenerateContent = vi.fn().mockResolvedValue({
  response: {
    text: () => `
# Slide 1: Japan Trip
![Image Prompt: Cinematic view of Tokyo Tower]
    `
  }
})

// Mock Gemini SDK
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: mockGenerateContent
    })
  }))
}))

const mockItinerary: Itinerary = {
  title: '東京五日遊',
  days: [
    {
      day: 1,
      date: '2026-06-01',
      activities: [{ time_slot: 'Morning', activity: '雷門淺草寺', description: '參觀' }],
      meals: { breakfast: 'None', lunch: 'Ramen', dinner: 'Sushi' },
      accommodation: 'Hotel Tokyo'
    }
  ]
}

beforeEach(() => {
  injectedMock.mockClear()
})

test('generatePresentationPrompt returns structured markdown', async () => {
  const result = await generatePresentationPrompt(mockItinerary)
  
  expect(result.success).toBe(true)
  expect(result.data).toContain('# Slide 1: Japan Trip')
})

test('generatePresentationPrompt supports language option', async () => {
  const result = await generatePresentationPrompt(mockItinerary, 'en')
  expect(result.success).toBe(true)
})

test('generatePresentationPrompt includes geographic grounding instructions based on extracted landmarks', async () => {
  await generatePresentationPrompt(mockItinerary)
  
  expect(injectedMock).toHaveBeenCalled()
  const prompt = injectedMock.mock.calls[0][0]
  
  expect(prompt).toContain('東京五日遊')
  expect(prompt).toContain('雷門淺草寺')
  expect(prompt).toContain('封面圖片必須高度對應行程的主要目的地或最具標誌性的地標')
  expect(prompt).toContain('標題或內文文字因為圖片背景滿版，蓋到一點沒關係，但盡可能不要蓋住圖片上的標誌性內容')
  expect(prompt).toContain('內頁投影片必須包含')
  expect(prompt).toContain('整體視覺風格必須符合當地的氛圍與特色')
})

test('Integration: System gracefully handles manual retries (successive calls)', async () => {
  // First call (initial generation)
  const result1 = await generatePresentationPrompt(mockItinerary)
  expect(result1.success).toBe(true)
  expect(injectedMock).toHaveBeenCalledTimes(1)

  // Simulate user reviewing the result, then clicking regenerate (manual retry)
  const result2 = await generatePresentationPrompt(mockItinerary)
  expect(result2.success).toBe(true)
  
  // It should simply invoke the generation again without state bleeding or automated loops
  expect(injectedMock).toHaveBeenCalledTimes(2)
})