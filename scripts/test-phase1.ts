import { logger } from '../lib/utils/logger';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Fix path to travelagent/.env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function runTest() {
  console.log('--- Phase 1 Verification (Script Mode) Start ---');
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Environment variables missing! Check travelagent/.env.local');
    process.exit(1);
  }

  // 1. Test Logger
  logger.info('Testing Logger System...');

  // 2. Test Supabase Audit Log
  console.log('\nAttempting to write to Supabase Audit Log...');
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    const { error } = await supabase
      .from('ai_audit_logs')
      .insert([
        {
          prompt: 'Phase 1 manual verification from script - Take 3',
          response: 'Success - Path fixed',
          model: 'test-script-02',
          duration_ms: 777
        }
      ]);

    if (error) {
      console.error('❌ Supabase Error:', error);
    } else {
      console.log('✅ SUCCESS: Record created in Supabase! Please check ai_audit_logs table.');
    }
  } catch (error) {
    console.error('❌ Unexpected Error:', error);
  }
  
  console.log('\n--- Verification End ---');
}

runTest();