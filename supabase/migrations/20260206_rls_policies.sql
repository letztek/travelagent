-- Update Itineraries RLS to use direct user_id
DROP POLICY IF EXISTS "Users can view their own itineraries" ON public.itineraries;
CREATE POLICY "Users can view their own itineraries"
  ON public.itineraries FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own itineraries" ON public.itineraries;
CREATE POLICY "Users can insert their own itineraries"
  ON public.itineraries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own itineraries" ON public.itineraries;
CREATE POLICY "Users can update their own itineraries"
  ON public.itineraries FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own itineraries" ON public.itineraries;
CREATE POLICY "Users can delete their own itineraries"
  ON public.itineraries FOR DELETE
  USING (auth.uid() = user_id);

-- Ensure Requirements RLS is robust
DROP POLICY IF EXISTS "Users can view their own requirements" ON public.requirements;
CREATE POLICY "Users can view their own requirements"
  ON public.requirements FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own requirements" ON public.requirements;
CREATE POLICY "Users can insert their own requirements"
  ON public.requirements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own requirements" ON public.requirements;
CREATE POLICY "Users can update their own requirements"
  ON public.requirements FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own requirements" ON public.requirements;
CREATE POLICY "Users can delete their own requirements"
  ON public.requirements FOR DELETE
  USING (auth.uid() = user_id);
