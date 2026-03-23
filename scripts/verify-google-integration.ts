import dotenv from 'dotenv'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function verifyGooglePlaces() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!apiKey) {
    console.error('❌ Error: GOOGLE_PLACES_API_KEY is missing in .env.local')
    process.exit(1)
  }

  console.log('🚀 Testing Google Places API Connection...')
  
  try {
    const response = await fetch(`https://places.googleapis.com/v1/places:searchText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress'
      },
      body: JSON.stringify({
        textQuery: 'Taipei 101',
        languageCode: 'zh-TW'
      })
    })

    if (!response.ok) {
      const err = await response.text()
      console.error(`❌ Google API Error: ${response.status}`, err)
      process.exit(1)
    }

    const data = await response.json()
    const place = data.places?.[0]
    
    if (place) {
      console.log('✅ Google API Success!')
      console.log(`📍 Found: ${place.displayName?.text} (ID: ${place.id})`)
      console.log(`🏠 Address: ${place.formattedAddress}`)
      
      // Test Database Cache
      if (supabaseUrl && supabaseServiceKey) {
        console.log('\n🗄️ Testing Supabase Cache Entry...')
        const supabase = createClient(supabaseUrl, supabaseServiceKey)
        
        const cacheKey = `search:Taipei 101:zh-TW`
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)

        const { error } = await supabase.from('place_cache').upsert({
          cache_key: cacheKey,
          data: data.places,
          expires_at: expiresAt.toISOString()
        })

        if (error) {
          console.error('❌ Supabase Cache Error:', error.message)
        } else {
          console.log('✅ Cache Entry Successful!')
          
          // Verify read
          const { data: cachedData } = await supabase.from('place_cache').select('*').eq('cache_key', cacheKey).single()
          if (cachedData) {
            console.log(`📦 Verified cached data for: ${cachedData.cache_key}`)
          }
        }
      }
    } else {
      console.log('⚠️ No places found for Taipei 101.')
    }

  } catch (error) {
    console.error('❌ Unexpected Error:', error)
    process.exit(1)
  }
}

verifyGooglePlaces()
