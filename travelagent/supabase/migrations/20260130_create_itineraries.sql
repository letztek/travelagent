-- Create the itineraries table
CREATE TABLE IF NOT EXISTS public.itineraries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requirement_id UUID REFERENCES public.requirements(id) ON DELETE CASCADE NOT NULL,
  content JSONB NOT NULL, -- Stores the full structure validated by itinerarySchema
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;

-- Create Policies

-- Policy 1: Users can view itineraries linked to their own requirements
-- Note: This requires joining with requirements to check user_id
CREATE POLICY "Users can view their own itineraries"
  ON public.itineraries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.requirements
      WHERE public.requirements.id = itineraries.requirement_id
      AND public.requirements.user_id = auth.uid()
    )
  );

-- Policy 2: Users can insert itineraries linked to their own requirements
CREATE POLICY "Users can insert their own itineraries"
  ON public.itineraries FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.requirements
      WHERE public.requirements.id = requirement_id
      AND public.requirements.user_id = auth.uid()
    )
  );

-- Policy 3: Users can delete their own itineraries
CREATE POLICY "Users can delete their own itineraries"
  ON public.itineraries FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.requirements
      WHERE public.requirements.id = itineraries.requirement_id
      AND public.requirements.user_id = auth.uid()
    )
  );
