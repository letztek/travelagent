-- Add retrieval_log and grounding_metadata columns to ai_audit_logs
ALTER TABLE ai_audit_logs ADD COLUMN IF NOT EXISTS retrieval_log JSONB;
ALTER TABLE ai_audit_logs ADD COLUMN IF NOT EXISTS grounding_metadata JSONB;
