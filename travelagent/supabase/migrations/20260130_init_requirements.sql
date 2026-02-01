-- Create the requirements table
CREATE TABLE IF NOT EXISTS public.requirements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(), -- Link to Supabase Auth User
  
  -- Structured Data (JSONB)
  travel_dates JSONB NOT NULL, -- Format: { "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" }
  travelers JSONB NOT NULL,    -- Format: { "adult": 0, "senior": 0, "child": 0, "infant": 0 }
  
  -- Simple Fields
  budget_range TEXT NOT NULL,
  notes TEXT,
  
  -- Preferences (JSONB for flexibility)
  preferences JSONB NOT NULL DEFAULT '{}'::JSONB, -- Format: { "dietary": [], "accommodation": [] }
  
  -- Status Tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'draft'))
);

-- Enable Row Level Security
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;

-- Create Policies

-- Policy 1: Users can view their own requirements
CREATE POLICY "Users can view their own requirements"
  ON public.requirements FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own requirements
CREATE POLICY "Users can insert their own requirements"
  ON public.requirements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own requirements
CREATE POLICY "Users can update their own requirements"
  ON public.requirements FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy 4: Service role (AI Agent) needs full access (Implicitly has it, but good to know)
