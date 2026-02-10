import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

async function testGemini3Connection() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY

  if (!apiKey) {
    console.error('❌ Error: Missing GOOGLE_GENERATIVE_AI_API_KEY in .env.local')
    process.exit(1)
  }

  console.log('Checking connection to Google Gemini 3 Pro Preview...')

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' })

    const result = await model.generateContent('Say "Gemini 3 Pro is active!" if you can hear me.')
    const response = await result.response
    const text = response.text()

    console.log('✅ Connection Successful!')
    console.log('🤖 AI Response:', text)

  } catch (err: any) {
    console.error('❌ Connection Failed:', err.message || err)
    process.exit(1)
  }
}

testGemini3Connection()