import { Itinerary } from '@/schemas/itinerary'
import { RouteConcept } from '@/schemas/route'
import { cachedPlacesService } from '../services/google-places-cache'
import { isPlaceOpen } from '../utils/opening-hours'
import { parseISO } from 'date-fns'
import { logger } from '../utils/logger'
import { GoogleGenerativeAI } from '@google/generative-ai'

export interface LogicError {
  day: number;
  item: string;
  type: 'opening_hours' | 'distance' | 'route_deviation' | 'other';
  message: string;
  severity: 'high' | 'medium' | 'low';
}

export interface VerificationResult {
  valid: boolean;
  errors: LogicError[];
}

/**
 * Maps itinerary items to placeIds using Gemini's groundingMetadata.
 */
function mapItemsToPlaceIds(itinerary: Itinerary, groundingMetadata: any): Map<string, string> {
  const map = new Map<string, string>()
  if (!groundingMetadata || !groundingMetadata.groundingChunks || !groundingMetadata.groundingSupports) {
    return map
  }

  const chunks = groundingMetadata.groundingChunks
  const supports = groundingMetadata.groundingSupports

  // For each day and activity/meal/accommodation, try to find a match in groundingSupports
  // This is a simplified matching logic. A more robust one would use the text segments.
  for (const support of supports) {
    const text = support.segment?.text
    if (text && support.groundingChunkIndices?.length > 0) {
      const chunkIndex = support.groundingChunkIndices[0]
      const placeId = chunks[chunkIndex]?.placeId
      if (placeId) {
        map.set(text, placeId)
      }
    }
  }

  return map
}

export async function verifyItinerary(
  itinerary: Itinerary, 
  groundingMetadata?: any, 
  routeConcept?: RouteConcept
): Promise<VerificationResult> {
  const errors: LogicError[] = []
  
  if (routeConcept) {
    try {
      const apiKey = process.env.GEMINI_API_KEY
      if (apiKey) {
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ 
          model: process.env.GEMINI_PRIMARY_MODEL || 'gemini-3-flash-preview',
        })
        const prompt = `
        You are a strict adherence verifier. Your job is to ensure the generated itinerary strictly follows the user's route concept.
        
        Route Concept:
        ${JSON.stringify(routeConcept.nodes, null, 2)}
        
        Generated Itinerary:
        ${JSON.stringify(itinerary.days.map(d => ({ day: d.day, activities: d.activities.map(a => a.activity) })), null, 2)}
        
        Check if any day in the generated itinerary contains activities that completely deviate from the planned location for that day in the Route Concept.
        If there are major deviations (e.g. planned Tokyo, but activity is Osaka Castle), report an error.
        
        Output JSON format ONLY (no markdown blocks, just raw JSON):
        {
          "deviations": [
            {
              "day": 1,
              "activity": "Osaka Castle",
              "message": "Activity Osaka Castle deviates from planned location Tokyo"
            }
          ]
        }
        `
        const result = await model.generateContent(prompt)
        const responseText = result.response.text()
        const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim()
        const parsed = JSON.parse(cleanText)
        
        if (parsed.deviations && Array.isArray(parsed.deviations)) {
          for (const dev of parsed.deviations) {
            errors.push({
              day: dev.day,
              item: dev.activity,
              type: 'route_deviation',
              message: dev.message,
              severity: 'high'
            })
          }
        }
      }
    } catch (e) {
      console.error('Failed to verify route adherence', e)
    }
  }

  const placeIdMap = mapItemsToPlaceIds(itinerary, groundingMetadata)
  
  // Cache for place details to avoid redundant API calls
  const placeDetailsCache = new Map<string, any>()

  for (const day of itinerary.days) {
    const date = parseISO(day.date)
    
    // Check Activities
    for (const activity of day.activities) {
      const placeId = placeIdMap.get(activity.activity)
      if (placeId) {
        try {
          let details = placeDetailsCache.get(placeId)
          if (!details) {
            details = await cachedPlacesService.getPlaceDetails(placeId)
            placeDetailsCache.set(placeId, details)
          }

          if (details?.regularOpeningHours) {
            const isOpen = isPlaceOpen(details.regularOpeningHours, date)
            if (!isOpen) {
              errors.push({
                day: day.day,
                item: activity.activity,
                type: 'opening_hours',
                message: `${activity.activity} 在 ${day.date} 可能公休或未營業。`,
                severity: 'high'
              })
            }
          }
        } catch (error) {
          logger.error(`Failed to verify opening hours for ${activity.activity}`, error)
        }
      }
    }

    // Check Meals (Simplified: assume lunch is at 13:00, dinner at 19:00)
    const mealTimes = [
      { name: day.meals.breakfast, slot: 'breakfast' },
      { name: day.meals.lunch, slot: 'lunch' },
      { name: day.meals.dinner, slot: 'dinner' }
    ]

    for (const meal of mealTimes) {
      if (!meal.name) continue
      const placeId = placeIdMap.get(meal.name)
      if (placeId) {
        try {
          let details = placeDetailsCache.get(placeId)
          if (!details) {
            details = await cachedPlacesService.getPlaceDetails(placeId)
            placeDetailsCache.set(placeId, details)
          }
          
          if (details?.regularOpeningHours) {
            // We can't be 100% sure of the exact time, but we can check if it's open at all that day
            const isOpen = isPlaceOpen(details.regularOpeningHours, date)
            if (!isOpen) {
              errors.push({
                day: day.day,
                item: meal.name,
                type: 'opening_hours',
                message: `餐廳 ${meal.name} 在 ${day.date} 可能公休。`,
                severity: 'high'
              })
            }
          }
        } catch (e) {}
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
