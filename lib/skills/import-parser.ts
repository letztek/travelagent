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
  const primaryModelName = process.env.GEMINI_PRIMARY_MODEL || 'gemini-3-flash-preview'
  const fallbackModelName = process.env.GEMINI_FALLBACK_MODEL || 'gemini-2.5-flash'

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
                        time_slot: { type: SchemaType.STRING, enum: ['Morning', 'Afternoon', 'Evening'] },
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
    2. **補齊缺漏**：若來源資料中某些必要欄位真的找不到（例如未標明預算、出發地），請不要留空，填入預設值（例如：預算填入"未指定"，出發地填入"未知"，人數可預設為 adult: 2，其餘為 0）。
    3. **嚴格日期格式**：所有日期相關欄位 (包含 travel_dates.start, travel_dates.end, 以及每日的 date) 必須「絕對嚴格」遵守 YYYY-MM-DD 格式 (例如 2024-05-01)。若文件未提供日期，請務必自行推算一組合理的未來日期填入，絕對不允許填入 "TBD"、"未知" 或其他非 YYYY-MM-DD 的文字。
    4. **格式化行程**：請將每一天的活動拆分為早、午、晚 (Morning, Afternoon, Evening) 三個時段，並確保活動與描述內容清晰。
    5. **語系**：請一律將輸出的行程內容轉換為繁體中文。
    6. **忠於原意與嚴禁幻覺**：
       - 請「僅根據使用者提供的內容」進行解析。
       - **絕對禁止** 套用任何非相關的範例行程（如東京、大阪、京都等）。
       - **精準對齊來源**：若輸入文字的核心目的地是 A，則輸出的 'extracted_metadata.destinations' 必須精確為 A。嚴禁將目的地 A 誤植或腦補為其他地區。
       - 若輸入內容過於簡略，請在 'extracted_metadata' 中如實反映，不要自行編造未提及的景點。

    請根據附帶的檔案與以下文字補充說明進行解析（這是最高優先權的資訊來源）：
    ${textInput ? `使用者輸入文字：
${textInput}` : '無補充文字'}
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
      const model = genAI.getGenerativeModel({ model: finalModelUsed, generationConfig: generationConfig as any })
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
