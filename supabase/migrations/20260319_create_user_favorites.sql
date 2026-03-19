-- Create the favorite_type ENUM
DO $$ BEGIN
    CREATE TYPE favorite_type AS ENUM ('spot', 'accommodation', 'food');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the user_favorites table
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type favorite_type NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    location_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    tags TEXT[] NOT NULL DEFAULT '{}'::text[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT user_favorites_name_not_empty CHECK (char_length(name) > 0)
);

-- Enable RLS
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own favorites"
    ON public.user_favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own favorites"
    ON public.user_favorites FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorites"
    ON public.user_favorites FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
    ON public.user_favorites FOR DELETE
    USING (auth.uid() = user_id);

-- Create index for faster querying
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_type ON public.user_favorites(type);
