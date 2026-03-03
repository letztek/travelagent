import { runImportParserSkill } from '../lib/skills/import-parser'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local or .env
dotenv.config({ path: '.env.local' })
dotenv.config()

async function main() {
  console.log('Testing import-parser skill...')
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('Error: GEMINI_API_KEY is not set. Please set it in .env or .env.local')
    process.exit(1)
  }

  const textInput = `
  行程表：
  第一天：早上搭飛機前往首爾，下午逛明洞，晚上吃烤肉。
  第二天：早上首爾塔，下午去弘大，晚上回飯店。
  預算：大約 30000 台幣
  人數：2大1小
  `

  console.log('Input Text:\\n', textInput)
  console.log('Calling AI...')

  try {
    const result = await runImportParserSkill(textInput, [])
    console.log('\\n✅ Extraction Successful!')
    console.log('\\n--- Extracted Metadata ---')
    console.log(JSON.stringify(result.extracted_metadata, null, 2))
    console.log('\\n--- Itinerary ---')
    console.log(JSON.stringify(result.itinerary, null, 2))
  } catch (error) {
    console.error('Failed to parse:', error)
  }
}

main()
