'use server'

import { Itinerary } from '@/schemas/itinerary'
import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  console.error('Error: GEMINI_API_KEY is not set in environment variables.')
}
const genAI = new GoogleGenerativeAI(apiKey || '')

export async function generatePresentationPrompt(itinerary: Itinerary, language: 'zh' | 'en' = 'zh') {
  try {
    // Use Pro model for creative writing
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" })

    const langInstruction = language === 'zh' 
      ? "The response content (Slide Titles, Bullet points, Descriptions) MUST be in Traditional Chinese (繁體中文)."
      : "The response content (Slide Titles, Bullet points, Descriptions) MUST be in English.";

    const prompt = `
      You are a specialized creative writer for high-end, luxury travel proposals.
      Your task is to convert a detailed travel itinerary into a highly structured Markdown presentation script.
      This output will be pasted directly into an AI Presentation Generator (like Gamma.app), so adherence to layout tags and structure is CRITICAL.

      【Copywriting Tone & Style】
      - The tone MUST be poetic, engaging, and inspiring. Evoke a strong sense of wanderlust and premium experience.
      - Avoid robotic "timetable" descriptions. Transform "Morning: Visit Temple" into "Morning | A Serene Awakening at the Temple".
      - ${langInstruction}

      【Input Itinerary JSON】
      ${JSON.stringify(itinerary, null, 2)}

      【Output Structure & Visual Instructions】
      You MUST organize the presentation into the following EXACT pages in order:

      1. **Cover Slide (頁面 1: 封面)**
         - Use tag: \`[Layout: Full background image, dark overlay, centered text]\`
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
         - Use tag: \`[Layout: Large image top, text bottom]\` or \`[Layout: Image grid with text overlay]\`
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

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    return { success: true, data: responseText }

  } catch (error) {
    console.error('Presentation Generation Error:', error)
    return { success: false, error: 'Failed to generate presentation prompt' }
  }
}