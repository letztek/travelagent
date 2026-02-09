-- Create AI Audit Logs table
CREATE TABLE IF NOT EXISTS ai_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    prompt TEXT NOT NULL,
    response TEXT,
    model TEXT,
    duration_ms INTEGER,
    error_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ai_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create Policy: Users can only see their own logs
CREATE POLICY "Users can view their own AI audit logs"
    ON ai_audit_logs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create Policy: Users can insert their own logs
CREATE POLICY "Users can insert their own AI audit logs"
    ON ai_audit_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create index for faster querying
CREATE INDEX IF NOT EXISTS idx_ai_audit_logs_user_id ON ai_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_audit_logs_created_at ON ai_audit_logs(created_at);
