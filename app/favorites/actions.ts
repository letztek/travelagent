'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type FavoriteType = 'spot' | 'accommodation' | 'food'

export interface Favorite {
  id: string
  user_id: string
  type: FavoriteType
  name: string
  description?: string
  location_data: any
  tags: string[]
  created_at: string
}

export async function createFavorite(data: Omit<Favorite, 'id' | 'user_id' | 'created_at'>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data: favorite, error } = await supabase
    .from('user_favorites')
    .insert({
      ...data,
      user_id: user.id
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  return { success: true, data: favorite }
}

export async function getFavorites() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data: favorites, error } = await supabase
    .from('user_favorites')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data: favorites }
}

export async function updateFavorite(id: string, data: Partial<Omit<Favorite, 'id' | 'user_id' | 'created_at'>>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data: favorite, error } = await supabase
    .from('user_favorites')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  return { success: true, data: favorite }
}

export async function deleteFavorite(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('user_favorites')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}

export async function suggestTags(name: string, description?: string, type?: FavoriteType) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return { success: true, data: ['親子', '必去', '網美'] } // Fallback for dev if no key
  }

  const { GoogleGenerativeAI, SchemaType } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          tags: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING }
          }
        },
        required: ["tags"]
      } as any
    }
  })

  const prompt = `
    你是一位旅遊專家。請根據以下景點/餐廳/住宿的名稱與描述，推薦 3-5 個適合的繁體中文標籤（例如：親子、秘境、網美、必吃、奢華、CP值高）。
    
    名稱：${name}
    描述：${description || '無'}
    類型：${type || '未指定'}
    
    請直接回傳 JSON 格式。
  `

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    const parsed = JSON.parse(text)
    return { success: true, data: parsed.tags }
  } catch (error) {
    console.error('AI Tag Suggestion Error:', error)
    return { success: false, error: 'AI 推薦失敗' }
  }
}
