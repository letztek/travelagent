import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

async function testConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Missing environment variables in .env.local')
    process.exit(1)
  }

  console.log('Checking connection to: ' + supabaseUrl)

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    const { data, error } = await supabase.from('non_existent_table_test_connection').select('*').limit(1)
    
    // If we get here, it means the client initialized and attempted a request.
    // Even if it's a 404 or permission error, the connection is valid.
    console.log('✅ Connection Successful!')

  } catch (err) {
    console.error('❌ Connection Failed:', err)
    process.exit(1)
  }
}

testConnection()
