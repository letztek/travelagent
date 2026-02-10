-- Add origin and destinations columns to requirements table
ALTER TABLE public.requirements
ADD COLUMN IF NOT EXISTS origin TEXT,
ADD COLUMN IF NOT EXISTS destinations TEXT[] DEFAULT '{}';

-- Comment on columns
COMMENT ON COLUMN public.requirements.origin IS 'Departure city/country';
COMMENT ON COLUMN public.requirements.destinations IS 'List of target destinations';
