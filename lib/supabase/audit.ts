import { createClient } from './server'
import { logger } from '../utils/logger'

export interface AiAuditLog {
  prompt: string;
  response?: string;
  model?: string;
  duration_ms?: number;
  error_code?: string;
  retrieval_log?: any;
  grounding_metadata?: any;
}

/**
 * Logs AI interaction to Supabase.
 * This is designed to be non-blocking (doesn't throw if logging fails).
 */
export async function logAiAudit(data: AiAuditLog) {
  try {
    const supabase = await createClient()
    
    // Get current user if available
    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase
      .from('ai_audit_logs')
      .insert([
        {
          ...data,
          user_id: user?.id || null,
        }
      ])

    if (error) {
      if (error.code === 'PGRST204') {
        logger.error('Failed to write AI audit log: Missing columns. Please run travelagent/supabase/migrations/20260402_update_ai_audit_logs.sql to update your database schema.', { error })
      } else {
        logger.error('Failed to write AI audit log to database', { error, data })
      }
    } else {
      logger.debug('AI audit log recorded', { model: data.model, duration: data.duration_ms })
    }
  } catch (err: any) {
    // We don't want audit logging to break the main application flow
    logger.error('Unexpected error in logAiAudit', { error: err.message })
  }
}
