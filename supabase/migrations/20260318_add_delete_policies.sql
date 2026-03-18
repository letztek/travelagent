-- Add DELETE policy for requirements table
-- Allow users to delete their own requirements
CREATE POLICY "Users can delete their own requirements"
  ON public.requirements FOR DELETE
  USING (auth.uid() = user_id);

-- Confirming itineraries already has a delete policy, but adding it if missing
-- Based on research, it exists, but we ensure it covers the user_id correctly.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'itineraries' AND policyname = 'Users can delete their own itineraries'
    ) THEN
        CREATE POLICY "Users can delete their own itineraries"
          ON public.itineraries FOR DELETE
          USING (
            EXISTS (
              SELECT 1 FROM public.requirements
              WHERE public.requirements.id = itineraries.requirement_id
              AND public.requirements.user_id = auth.uid()
            )
          );
    END IF;
END $$;
