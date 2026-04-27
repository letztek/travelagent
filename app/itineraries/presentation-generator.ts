'use server'

import { Itinerary } from '@/schemas/itinerary'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { withRetry } from '@/lib/utils/ai-retry'
import { logger } from '@/lib/utils/logger'
import { extractLandmarks } from '@/lib/utils/extract-landmarks'

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  console.error('Error: GEMINI_API_KEY is not set in environment variables.')
}
const genAI = new GoogleGenerativeAI(apiKey || '')

export async function generatePresentationPrompt(itinerary: Itinerary, language: 'zh' | 'en' = 'zh') {
  try {
    const primaryModelName = process.env.GEMINI_PRIMARY_MODEL || 'gemini-3-flash-preview'
    const fallbackModelName = process.env.GEMINI_FALLBACK_MODEL || 'gemini-2.5-flash'

    const langInstruction = language === 'zh' 
      ? "The response content (Slide Titles, Bullet points, Descriptions) MUST be in Traditional Chinese (繁體中文)."
      : "The response content (Slide Titles, Bullet points, Descriptions) MUST be in English.";

    const landmarksData = extractLandmarks(itinerary)
    const geoInstruction = `
      【Geographic Grounding & Accuracy】
      - 擷取到的主要目的地 (Main Destination): ${landmarksData.mainDestination}
      - 擷取到的重要地標 (Key Landmarks): ${landmarksData.landmarks.slice(0, 10).join(', ')}
      - 封面圖片必須高度對應行程的主要目的地或最具標誌性的地標。
      - 內頁投影片必須包含具體對應的地標或景點，避免使用通用風景圖。
      - 整體視覺風格必須符合當地的氛圍與特色。
      - 標題或內文文字因為圖片背景滿版，蓋到一點沒關係，但盡可能不要蓋住圖片上的標誌性內容。
    `

    const prompt = `
      You are a specialized creative writer for high-end, luxury travel proposals.
      Your task is to convert a detailed travel itinerary into a highly structured Markdown presentation script.
      This output will be pasted directly into an AI Presentation Generator (like Gamma.app), so adherence to layout tags and structure is CRITICAL.

      【Copywriting Tone & Style】
      - The tone MUST be poetic, engaging, and inspiring. Evoke a strong sense of wanderlust and premium experience.
      - Avoid robotic "timetable" descriptions. Transform "Morning: Visit Temple" into "Morning | A Serene Awakening at the Temple".
      - ${langInstruction}

      ${geoInstruction}

      【Input Itinerary JSON】
      ${JSON.stringify(itinerary, null, 2)}

      【Output Structure & Visual Instructions】
      You MUST organize the presentation into the following EXACT pages in order:

      1. **Cover Slide (頁面 1: 封面)**
         - Use tag: \`[Layout: Full background image, centered text with elegant solid background box for readability]\`
         - ⚠️ IMPORTANT: Do NOT use a full dark overlay over the image. Ensure the text has a solid or semi-transparent background box to stay legible against the bright image.
         - Include a grand, evocative Title, a poetic Subtitle, and the total duration (e.g., "5 Days / 4 Nights").
         - \`[Image Prompt: A cinematic, photorealistic, ultra-high resolution, authentic travel photography shot of [Iconic destination from itinerary], dramatic lighting, epic scale, 8k]\`

      For EACH Day in the itinerary, create the following sequence of slides:

      2. **Daily Overview (每日概覽)**
         - Use tag: \`[Layout: Split screen, text left, image right]\`
         - Title: Day X - [Poetic Theme of the Day]
         - Content: A brief, elegant summary of the day. List Morning/Afternoon/Evening highlights and the overnight Accommodation.
         - \`[Image Prompt: Photorealistic, high quality authentic travel photo capturing the essence of [Day's main region], natural lighting]\`

      3. **Feature Spotlights (景點深度介紹 - 1 to 2 slides per day)**
         - Select 1 or 2 of the most iconic or unique activities from that day.
         - Use tag: \`[Layout: Large image top, text bottom]\` or \`[Layout: Image grid with text in a solid background box]\`
         - Title: [Name of the Spot/Activity]
         - Content: A deeply engaging paragraph describing the sensory experience, history, or unique value of this spot. Make the client feel like they are already there.
         - \`[Image Prompt: Ultra-realistic, award-winning travel photography of [Specific spot/activity], close-up or sweeping view depending on context, vivid colors, 8k]\`

      4. **Accommodation Highlight (住宿特色 - Only if it's a notable hotel/ryokan)**
         - Use tag: \`[Layout: Split screen, large image, elegant typography]\`
         - Title: 宿 | [Hotel Name]
         - Content: Describe the luxury, comfort, or unique features (e.g., hot springs, ocean view) of the accommodation.
         - \`[Image Prompt: Interior architectural photography of a luxury [hotel type/ryokan] room or lobby, warm inviting lighting, highly detailed, photorealistic]\`

      【Format Rules】
      - Start each new slide with \`# Page X: [Slide Type]\`
      - Immediately follow with the \`[Layout: ...]\` tag.
      - Immediately follow with the \`[Image Prompt: ...]\` tag (Image prompts MUST remain in English for the AI generator).
      - Then provide the slide content.
      - Output ONLY the Markdown text. No conversational filler.
    `

    let responseText = ''
    let finalModelUsed = primaryModelName

    const result = await withRetry(async (attempt) => {
      finalModelUsed = attempt > 0 ? fallbackModelName : primaryModelName
      if (attempt > 0) {
        logger.info(`Fallback triggered: Switching model to ${finalModelUsed} for attempt ${attempt + 1}`)
      }
      const model = genAI.getGenerativeModel({ model: finalModelUsed })
      return model.generateContent(prompt)
    })
    
    responseText = result.response.text()
    
    return { success: true, data: responseText }

  } catch (error) {
    console.error('Presentation Generation Error:', error)
    return { success: false, error: 'Failed to generate presentation prompt' }
  }
}