
-- Migration to create trigger function and trigger to auto-create profile on new user signup
-- Drops existing trigger and function if they exist to avoid conflicts

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Check if user_type enum exists, and create it if it doesn't
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type') THEN
        CREATE TYPE user_type AS ENUM ('profesor', 'elev', 'parinte');
    END IF;
END $$;

-- Create the function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Insert profile with proper enum casting
  INSERT INTO public.profiles (user_id, name, user_type, provider, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name', 
      NEW.raw_user_meta_data ->> 'name', 
      NEW.raw_user_meta_data ->> 'user_name',
      split_part(NEW.email, '@', 1)
    ),
    CASE 
      WHEN (NEW.raw_user_meta_data ->> 'user_type') IN ('profesor', 'elev', 'parinte') 
      THEN (NEW.raw_user_meta_data ->> 'user_type')::user_type
      ELSE 'profesor'::user_type
    END,
    COALESCE(NEW.raw_app_meta_data ->> 'provider', 'email'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  
  -- Assign admin role if email is admin@automator.ro, otherwise assign user role
  IF NEW.email = 'admin@automator.ro' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
