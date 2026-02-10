import { createClient } from './server'
import { logger } from '../utils/logger'

export interface AiAuditLog {
  prompt: string;
  response?: string;
  model?: string;
  duration_ms?: number;
  error_code?: string;
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
      logger.error('Failed to write AI audit log to database', { error, data })
    } else {
      logger.debug('AI audit log recorded', { model: data.model, duration: data.duration_ms })
    }
  } catch (err: any) {
    // We don't want audit logging to break the main application flow
    logger.error('Unexpected error in logAiAudit', { error: err.message })
  }
}
