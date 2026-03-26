import { createClient } from '@/lib/supabase/server'

export interface SearchFavoritesOptions {
  query?: string
  lat?: number
  lng?: number
  radiusKm?: number
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180)
}

export async function searchFavorites(options: SearchFavoritesOptions) {
  const supabase = await createClient()
  
  if (options.query) {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('*')
      .or(`name.ilike.%${options.query}%,description.ilike.%${options.query}%`)
      
    if (error) return { success: false, error }
    return { success: true, data }
  }

  if (options.lat !== undefined && options.lng !== undefined && options.radiusKm !== undefined) {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('*')
      
    if (error) return { success: false, error }
    
    const filtered = data?.filter(item => {
      if (item.metadata?.location?.latitude && item.metadata?.location?.longitude) {
        const dist = calculateDistance(
          options.lat!, 
          options.lng!, 
          item.metadata.location.latitude, 
          item.metadata.location.longitude
        )
        return dist <= options.radiusKm!
      }
      return false
    }) || []
    
    return { success: true, data: filtered }
  }
  
  return { success: true, data: [] }
}
