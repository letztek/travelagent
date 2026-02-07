import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { itinerarySchema, type Itinerary } from '@/schemas/itinerary'
import { type Requirement } from '@/schemas/requirement'
import { RouteConcept } from '@/schemas/route'

export async function runItinerarySkill(requirement: Requirement, routeConcept?: RouteConcept): Promise<Itinerary> {
  const apiKey = process.env.GEMINI_API_KEY
  const modelName = process.env.GEMINI_MODEL_NAME || 'gemini-3-pro-preview'

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
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
  })

  const systemPrompt = `
    你是一位專業的旅遊顧問助理。
    請根據客戶的需求，生成一份詳細且地理邏輯合理（不走回頭路、交通時間最佳化）的旅遊行程。
    
    ${routeConcept ? `【路線骨架約束】
    你「必須」遵守以下已確認的路線規劃：
    - 規劃理由：${routeConcept.rationale}
    - 城市順序：${routeConcept.nodes.map(n => `Day ${n.day}: ${n.location} (${n.description})`).join(' -> ')}
    ` : ''}

    【需求細節】
    - 出發地：${requirement.origin || '未指定'}
    - 目的地：${requirement.destinations && requirement.destinations.length > 0 ? requirement.destinations.join(', ') : '未指定'}
    - 旅遊日期：${requirement.travel_dates.start} 至 ${requirement.travel_dates.end}
    - 旅客結構：成人 ${requirement.travelers.adult}, 長輩 ${requirement.travelers.senior}, 兒童 ${requirement.travelers.child}, 嬰兒 ${requirement.travelers.infant}
    - 總預算範圍：${requirement.budget_range} (此為整團旅客的總預算)
    - 偏好設定：飲食禁忌 [${requirement.preferences.dietary.join(', ')}], 住宿偏好 [${requirement.preferences.accommodation.join(', ')}]
    - 特殊備註：${requirement.notes || '無'}

    【輸出要求】
    1. 所有的內容（活動名稱、描述、餐飲、住宿）請使用「繁體中文」撰寫。
    2. **【關鍵約束】行程必須完全發生在「目的地」(${requirement.destinations?.join(', ')}) 及其周邊地區。嚴禁安排目的地以外的地點（如：若目的地是日本，絕不可安排日月潭）。**
    ${routeConcept ? `3. **【路線骨架】必須嚴格遵循上述路線骨架安排每日活動地點。**` : `3. **【交通邏輯】第一天請明確安排從「出發地」(${requirement.origin}) 前往「目的地」的交通方式（如：搭乘飛機、高鐵等），最後一天安排返回。**`}
    4. 行程安排需考慮地理位置的順暢性，避免無謂的往返。
    5. 請為這份行程起一個吸引人且符合主題的「標題」(title)，例如：「台東山海慢漫遊 4 日」、「京都古都之美深度探索」。
  `

  const result = await model.generateContent(systemPrompt)
  const response = await result.response
  const text = response.text()

  const parsedData = JSON.parse(text)
  
  return itinerarySchema.parse(parsedData)
}
