import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { itinerarySchema, type Itinerary } from '@/schemas/itinerary'
import { withRetry } from '../utils/ai-retry'
import { logAiAudit } from '../supabase/audit'
import { logger } from '../utils/logger'

export interface FileData {
  mimeType: string;
  base64Data: string;
}

export interface ImportParserResult {
  extracted_metadata: {
    destinations: string[];
    origin: string;
    travel_dates: { start: string; end: string };
    travelers: { adult: number; child: number; infant: number; senior: number };
    budget_range: string;
  };
  itinerary: Itinerary;
}

export async function runImportParserSkill(
  textInput: string,
  files: FileData[]
): Promise<ImportParserResult> {
  const apiKey = process.env.GEMINI_API_KEY
  const primaryModelName = process.env.GEMINI_MODEL_NAME || 'gemini-3.1-pro-preview'
  const fallbackModelName = 'gemini-2.5-pro' // Used on retry if 503/429 occurs

  if (!apiKey) {
    logger.error('GEMINI_API_KEY is not defined')
    throw new Error('GEMINI_API_KEY is not defined')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const generationConfig = {
    responseMimeType: "application/json",
    responseSchema: {
      type: SchemaType.OBJECT,
      properties: {
        extracted_metadata: {
          type: SchemaType.OBJECT,
          properties: {
            destinations: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            origin: { type: SchemaType.STRING },
            travel_dates: {
              type: SchemaType.OBJECT,
              properties: {
                start: { type: SchemaType.STRING },
                end: { type: SchemaType.STRING }
              },
              required: ["start", "end"]
            },
            travelers: {
              type: SchemaType.OBJECT,
              properties: {
                adult: { type: SchemaType.INTEGER },
                child: { type: SchemaType.INTEGER },
                infant: { type: SchemaType.INTEGER },
                senior: { type: SchemaType.INTEGER }
              },
              required: ["adult", "child", "infant", "senior"]
            },
            budget_range: { type: SchemaType.STRING }
          },
          required: ["destinations", "origin", "travel_dates", "travelers", "budget_range"]
        },
        itinerary: {
          type: SchemaType.OBJECT,
          properties: {
            title: { type: SchemaType.STRING },
            days: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  day: { type: SchemaType.INTEGER },
                  date: { type: SchemaType.STRING },
                  activities: {
                    type: SchemaType.ARRAY,
                    items: {
                      type: SchemaType.OBJECT,
                      properties: {
                        time_slot: { type: SchemaType.STRING, enum: ['Morning', 'Afternoon', 'Evening'], format: "enum" },
                        activity: { type: SchemaType.STRING },
                        description: { type: SchemaType.STRING }
                      },
                      required: ["time_slot", "activity", "description"]
                    }
                  },
                  meals: {
                    type: SchemaType.OBJECT,
                    properties: {
                      breakfast: { type: SchemaType.STRING },
                      lunch: { type: SchemaType.STRING },
                      dinner: { type: SchemaType.STRING }
                    },
                    required: ["breakfast", "lunch", "dinner"]
                  },
                  accommodation: { type: SchemaType.STRING }
                },
                required: ["day", "date", "activities", "meals", "accommodation"]
              }
            }
          },
          required: ["title", "days"]
        }
      },
      required: ["extracted_metadata", "itinerary"]
    }
  }

  const systemPrompt = `
    你是一位專業的旅遊資料解析助理。你的任務是從使用者提供的文字或圖片、文件（行程表、報價單、對話截圖等）中，盡可能完整地萃取出旅遊行程相關資訊，並將其轉換為結構化的 JSON 格式。
    
    【解析策略】
    1. **寬容處理**：來源資料可能非常凌亂、缺乏明確結構，請利用你的常識與旅遊領域知識推斷正確的資訊。
    2. **補齊缺漏**：若來源資料中某些必要欄位真的找不到（例如未標明預算、出發地或明確日期），請不要留空，填入預設值（例如：預算填入"未指定"，出發地填入"未知"，日期填入"TBD"或猜測的相對日期，人數可預設為 adult: 2，其餘為 0）。
    3. **格式化行程**：請將每一天的活動拆分為早、午、晚 (Morning, Afternoon, Evening) 三個時段，並確保活動與描述內容清晰。
    4. **語系**：請一律將輸出的行程內容轉換為繁體中文。

    請根據附帶的檔案與以下文字補充說明進行解析：
    ${textInput ? `補充文字：
\${textInput}` : '無補充文字'}
  `

  const parts: any[] = [{ text: systemPrompt }]
  for (const file of files) {
    parts.push({
      inlineData: {
        data: file.base64Data,
        mimeType: file.mimeType
      }
    })
  }

  const startTime = Date.now()
  let responseText = ''
  let errorCode: string | undefined
  let finalModelUsed = primaryModelName

  try {
    const result = await withRetry(async (attempt) => {
      finalModelUsed = attempt > 0 ? fallbackModelName : primaryModelName;
      if (attempt > 0) {
        logger.info(`Fallback triggered: Switching model to ${finalModelUsed} for attempt ${attempt + 1}`)
      }
      const model = genAI.getGenerativeModel({ model: finalModelUsed, generationConfig })
      return model.generateContent(parts)
    })
    const response = await result.response
    responseText = response.text()
  } catch (err: any) {
    errorCode = err.status?.toString() || err.message
    throw err
  } finally {
    const duration = Date.now() - startTime
    logAiAudit({
      prompt: systemPrompt,
      response: responseText,
      model: finalModelUsed,
      duration_ms: duration,
      error_code: errorCode
    })
  }

  const parsedData = JSON.parse(responseText)
  
  // Validate inner itinerary with zod schema just to be safe (though Gemini JSON schema should handle it)
  parsedData.itinerary = itinerarySchema.parse(parsedData.itinerary)

  return parsedData as ImportParserResult
}
