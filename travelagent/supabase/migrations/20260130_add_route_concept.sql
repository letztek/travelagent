-- Add route_concept column to itineraries table
ALTER TABLE public.itineraries
ADD COLUMN IF NOT EXISTS route_concept JSONB;

COMMENT ON COLUMN public.itineraries.route_concept IS 'High-level route plan (nodes, rationale)';
