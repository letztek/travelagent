import { Itinerary } from '@/schemas/itinerary'

export interface LandmarkData {
  mainDestination: string
  landmarks: string[]
}

export function extractLandmarks(itinerary: Itinerary): LandmarkData {
  const landmarks: string[] = []

  // Extract landmarks from activities
  for (const day of itinerary.days) {
    if (day.activities) {
      for (const activity of day.activities) {
        if (activity.activity) {
          landmarks.push(activity.activity)
        }
      }
    }
  }

  // Determine main destination
  let mainDestination = itinerary.title || ''
  if (!mainDestination && landmarks.length > 0) {
    mainDestination = landmarks[0]
  } else if (!mainDestination) {
    mainDestination = 'Unknown Destination'
  }

  // Optional: Clean up and deduplicate landmarks (keep it simple for now)
  const uniqueLandmarks = Array.from(new Set(landmarks))

  return {
    mainDestination,
    landmarks: uniqueLandmarks
  }
}