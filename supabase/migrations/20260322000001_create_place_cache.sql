CREATE TABLE IF NOT EXISTS place_cache (
  cache_key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for expiration
CREATE INDEX IF NOT EXISTS idx_place_cache_expires_at ON place_cache (expires_at);
