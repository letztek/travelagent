import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { itinerarySchema, type Itinerary } from '@/schemas/itinerary'
import { type Requirement } from '@/schemas/requirement'
import { RouteConcept } from '@/schemas/route'
import { withRetry } from '../utils/ai-retry'
import { logAiAudit } from '../supabase/audit'
import { logger } from '../utils/logger'
import { format, parseISO } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { GoogleDistanceMatrixResponse } from '../types/google-places'
import { extractJsonFromText, normalizeItinerary } from '../utils/itinerary-utils'

function formatDateWithWeekday(dateStr: string): string {
  try {
    const date = parseISO(dateStr)
    return format(date, 'yyyy-MM-dd (EEEE)', { locale: zhTW })
  } catch {
    return dateStr
  }
}

export interface FavoriteItem {
  name: string
  type: string
  description?: string
  tags?: string[]
  metadata?: {
    location?: { latitude: number; longitude: number };
    regularOpeningHours?: { weekdayDescriptions?: string[] };
    rating?: number;
    formattedAddress?: string;
  }
}

export interface DestinationCoordinate {
  name: string;
  location: { latitude: number; longitude: number };
}

export async function runItinerarySkill(
  requirement: Requirement, 
  routeConcept?: RouteConcept,
  userFavorites?: FavoriteItem[],
  distanceMatrix?: GoogleDistanceMatrixResponse,
  destination_coordinates?: DestinationCoordinate[],
  retrievalLog?: any
): Promise<{ itinerary: Itinerary; groundingMetadata?: any }> {
  const apiKey = process.env.GEMINI_API_KEY
  const primaryModelName = process.env.GEMINI_PRIMARY_MODEL || 'gemini-3-flash-preview'
  const fallbackModelName = process.env.GEMINI_FALLBACK_MODEL || 'gemini-2.5-flash'

  if (!apiKey && process.env.NODE_ENV !== 'test') {
    logger.error('GEMINI_API_KEY is not defined')
    throw new Error('GEMINI_API_KEY is not defined')
  }

  const genAI = new GoogleGenerativeAI(apiKey || 'mock-key')
  const fullJsonConfig = {
    responseMimeType: "application/json",
    responseSchema: {
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
      required: ["days"]
    }
  }

  const favoritesPrompt = userFavorites && userFavorites.length > 0 
    ? `
    【使用者私房最愛名單 (RAG Context)】
    以下是從使用者資料庫檢索到的相關口袋名單。請優先參考此名單進行排程：
    ${userFavorites.map((f, idx) => {
      const typeStr = f.type === 'spot' ? '景點' : f.type === 'food' ? '餐廳' : '住宿'
      const meta = f.metadata
      const hours = meta?.regularOpeningHours?.weekdayDescriptions?.join('; ') || '無資訊'
      const rating = meta?.rating ? ` (評分: ${meta.rating})` : ''
      return `- [Ref ID: ${idx}] [${typeStr}] ${f.name}${rating}${f.description ? `: ${f.description}` : ''}
      地址: ${meta?.formattedAddress || '無'}
      營業時間: ${hours}
      座標: ${meta?.location?.latitude}, ${meta?.location?.longitude}`
    }).join('\n    ')}

    【RAG 執行規範】
    1. **【意圖感知過濾 (Intent-based Filtering)】**：上述名單僅作為「建議池」，你必須根據本次行程的主題（如：${requirement.notes || '一般旅遊'}）與需求，僅選取符合本次行程主題的地點。不相關的地點請忽略。
    2. **【精準身份對齊 (Strict Identity Alignment)】**：若你決定採用上述名單中的某個地點，你「必須」直接使用該地點的名稱，嚴禁在行程中輸出 [Ref ID: X] 這種標籤，也嚴禁根據你的內建知識進行重命名或修改。
    3. **【類別屬性對齊】**：
       - **[餐廳]** 類別的地點「必須優先」安排在 JSON 結構中的 \`meals\` (breakfast, lunch, dinner) 欄位中。
       - **[景點]** 類別的地點「必須」安排在 \`activities\` 陣列中。
       - **[住宿]** 類別的地點「必須」安排在 \`accommodation\` 欄位中。
    4. **【營業時間感知】**：你「必須」核對上述名單中的「營業時間」，嚴禁在該地點的「公休日」安排活動。若衝突，請調整天數或尋找替代方案。
    ` : ''

  const isDistanceMatrixEnabled = process.env.GOOGLE_DISTANCE_MATRIX_ENABLED === 'true'
  const distancePrompt = (isDistanceMatrixEnabled && distanceMatrix && distanceMatrix.rows.length > 0 && userFavorites && userFavorites.length > 0)
    ? `
    【交通距離與時程參考 (Distance Matrix)】
    以下是名單中各地點之間的交通參考（僅列出部分）：
    ${userFavorites.map((f1, i) => {
      if (i >= distanceMatrix.rows.length) return ''
      return distanceMatrix.rows[i].elements.map((el, j) => {
        if (i === j || el.status !== 'OK' || !userFavorites[j]) return ''
        return `從 ${f1.name} 到 ${userFavorites[j].name}: ${el.duration.text} (${el.distance.text})`
      }).filter(Boolean).join('\n    ')
    }).filter(Boolean).join('\n    ')}
    
    請務必參考上述時程來規劃每日活動的「順序」與「間隔」，確保行程不會過於擁擠或地理邏輯不通。
    ` : ''

  const systemPrompt = `
    你是一位專業的旅遊顧問助理。
    請根據客戶的需求，生成一份詳細且地理邏輯合理（不走回頭路、交通時間最佳化）的旅遊行程。
    
    ${routeConcept ? `【路線骨架約束】
    你「必須」遵守以下已確認的路線規劃：
    - 規劃理由：${routeConcept.rationale}
    - 城市順序：${routeConcept.nodes.map(n => `Day ${n.day}: ${n.location} (${n.description})`).join(' -> ')}
    ` : ''}

    ${favoritesPrompt}
    ${distancePrompt}

    ${destination_coordinates && destination_coordinates.length > 0 ? `
    【目的地精準座標】
    以下是本次行程目的地的中心座標，請以此為基準判斷周邊景點的地理合理性：
    ${destination_coordinates.map(d => `- ${d.name}: ${d.location.latitude}, ${d.location.longitude}`).join('\n    ')}
    ` : ''}

    【需求細節】
    - 出發地：${requirement.origin || '未指定'}
    - 目的地：${requirement.destinations && requirement.destinations.length > 0 ? requirement.destinations.join(', ') : '未指定'}
    - 旅遊日期：${formatDateWithWeekday(requirement.travel_dates.start)} 至 ${formatDateWithWeekday(requirement.travel_dates.end)}
    - 旅客結構：成人 ${requirement.travelers.adult}, 長輩 ${requirement.travelers.senior}, 兒童 ${requirement.travelers.child}, 嬰兒 ${requirement.travelers.infant}
    - 總預算範圍：${requirement.budget_range} (此為整團旅客的總預算)
    - 偏好設定：飲食禁忌 [${requirement.preferences.dietary.join(', ')}], 住宿偏好 [${requirement.preferences.accommodation.join(', ')}]
    - 特殊備註：${requirement.notes || '無'}

    【輸出要求】
    1. 所有的內容（活動名稱、描述、餐飲、住宿）請使用「繁體中文」撰寫。
    2. **【關鍵約束】行程必須完全發生在「目的地」(${requirement.destinations?.join(', ')}) 及其周邊地區。嚴禁安排目的地以外的地點（如：若目的地是日本，絕不可安排日月潭）。**
    ${routeConcept ? `3. **【路線骨架】必須嚴格遵循上述路線骨架安排每日活動地點。**` : `3. **【交通邏輯】第一天請明確安排從「出發地」(${requirement.origin}) 前往「目的地」的交通方式（如：搭乘飛機、高鐵等），最後一天安排返回。**`}
    4. **【原子化活動 (重要)】** 每個 \`activities\` 陣列中的 JSON 物件「必須且只能」代表一個單一的活動、景點或事件。
       - 嚴禁在單一活動描述中包含多個行程階段（例如：禁止寫「先去 A 接著去 B」）。
       - 如果一個時段有多個活動，請將其拆分為多個 JSON 物件放入陣列中。
       - 每個描述應專注於該特定地點或活動的體驗。
    5. 行程安排需考慮地理位置的順暢性，避免無謂的往返。
    6. **【地圖對齊要求 (Grounding)】**：你在安排每一個景點、餐廳或飯店時，你「必須」調用提供的 \`googleMaps\` 工具來確認該地點在現實中存在，並獲取精準的 Google 地標 ID。
    7. **【輸出格式要求】**：你「必須」僅輸出純 JSON 格式，不要包含 Markdown 的程式碼區塊標籤（如 \`\`\`json ）。每個 \`days\` 陣列中的物件，都「必須」包含 \`activities\`, \`meals\` (含 breakfast, lunch, dinner), \`accommodation\` 欄位，不可遺漏。
    8. **【時間段要求】**：\`activities\` 中的 \`time_slot\` 「只能」是 "Morning", "Afternoon", "Evening" 其中之一。嚴禁使用如 "Late Morning" 或 "Night" 等其他值。
    9. 請為這份行程起一個吸引人且符合主題的「標題」(title)，例如：「台東山海深度體驗 4 日」、「京都古都之美經典探索」。

    【JSON 結構範例】
    {
      "title": "行程標題",
      "days": [
        {
          "day": 1,
          "date": "YYYY-MM-DD",
          "activities": [
            { "time_slot": "Morning", "activity": "地點名稱", "description": "描述" }
          ],
          "meals": { "breakfast": "...", "lunch": "...", "dinner": "..." },
          "accommodation": "..."
        }
      ]
    }
  `

  const startTime = Date.now()
  let responseText = ''
  let errorCode: string | undefined
  let finalModelUsed = primaryModelName
  let groundingMetadata: any

  try {
    const result = await withRetry(async (attempt) => {
      finalModelUsed = attempt > 0 ? fallbackModelName : primaryModelName;
      if (attempt > 0) {
        logger.info(`Fallback triggered: Switching model to ${finalModelUsed} for attempt ${attempt + 1}`)
      }
      
      // Disable strict JSON mode for ALL models to allow Google Maps Grounding metadata to pass through.
      // We rely on the extractJsonFromText utility to parse the response.
      const currentGenerationConfig = { temperature: 0.2, topP: 0.8, topK: 40 };

      const model = genAI.getGenerativeModel({
        model: finalModelUsed,
        generationConfig: currentGenerationConfig as any,
        tools: [{ googleMaps: {} }] as any
      })
      return model.generateContent(systemPrompt)
    })
    const response = await result.response
    responseText = response.text()
    // Extract grounding metadata if present
    groundingMetadata = (response as any).candidates?.[0]?.groundingMetadata
    
    // Use robust JSON extraction since 2.5 might not strictly adhere to JSON mode when tools are used
    const parsedData = extractJsonFromText(responseText)
    
    // Normalize time slots before validation to handle non-standard values like "Late Morning"
    const normalizedData = normalizeItinerary(parsedData)
    const itinerary = itinerarySchema.parse(normalizedData)
    
    return { itinerary, groundingMetadata }
  } catch (err: any) {
    errorCode = err.status?.toString() || err.message
    throw err
  } finally {
    const duration = Date.now() - startTime
    // Non-blocking audit log
    logAiAudit({
      prompt: systemPrompt,
      response: responseText,
      model: finalModelUsed,
      duration_ms: duration,
      error_code: errorCode,
      retrieval_log: retrievalLog,
      grounding_metadata: groundingMetadata
    }).catch(() => {}) // Prevent unhandled rejection in background task
  }
}
