-- Update handle_new_user function to also set a default role (editor)
-- This ensures all newly invited users automatically become editors.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. Create profile (skip if exists)
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'display_name')
  ON CONFLICT (id) DO NOTHING;

  -- 2. Create default user role (editor)
  -- This runs when the user is first created in auth.users (on invite)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'editor')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
