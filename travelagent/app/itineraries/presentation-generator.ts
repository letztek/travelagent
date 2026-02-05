'use server'

import { Itinerary } from '@/schemas/itinerary'
import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  console.error('Error: GEMINI_API_KEY is not set in environment variables.')
}
const genAI = new GoogleGenerativeAI(apiKey || '')

export async function generatePresentationPrompt(itinerary: Itinerary) {
  try {
    // Use Pro model for creative writing
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" })

    const prompt = `
      You are a specialized creative writer for high-end travel proposals.
      Your task is to convert a detailed travel itinerary into a structured Markdown presentation script.
      The output will be used by an AI Presentation Generator (like Gamma/Seede), so the structure must be precise.

      【Input Itinerary JSON】
      ${JSON.stringify(itinerary, null, 2)}

      【Output Structure & Style】
      1. **Cover Slide**: Title, Date Range, and a catchy Slogan.
      2. **Daily Summaries**: One slide per day. Summarize activities into bullet points. Group by Morning/Afternoon/Evening if busy.
      3. **Feature Spotlights**: Select ALL highly attractive/famous spots from the itinerary. Create a dedicated "Spotlight" slide for EACH one.
         - Label them clearly (e.g., "# Spotlight: [Name]").
         - Include a "Must See" or "Experience" text block describing why it's special.
      4. **Assurance & Details**: A final slide with standard travel assurance info (Insurance, Transport, Contact).

      【Visual Instructions】
      - For EVERY slide, you MUST provide an Image Prompt in this exact format:
        \`![Image Prompt: A cinematic, photorealistic shot of [Scene Description], 8k resolution]\`
      - The image prompt should be in English.

      【Format Requirement】
      - Use Markdown headers (# for Slide Titles).
      - Use standard Markdown lists for content.
      - Keep text concise (presentation style, not paragraphs).
      - Output ONLY the Markdown text. No conversational filler.

      【Example Output】
      # Slide 1: [Title]
      ![Image Prompt: ...]
      ...

      # Slide 2: Day 1 - [Theme]
      ![Image Prompt: ...]
      - ...
    `

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    return { success: true, data: responseText }

  } catch (error) {
    console.error('Presentation Generation Error:', error)
    return { success: false, error: 'Failed to generate presentation prompt' }
  }
}
