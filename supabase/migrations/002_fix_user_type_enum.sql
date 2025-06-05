
-- Fix the user_type enum and trigger function
-- First, drop existing objects to ensure clean state
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TYPE IF EXISTS public.user_type CASCADE;

-- Create the user_type enum
CREATE TYPE public.user_type AS ENUM ('profesor', 'elev', 'parinte');

-- Create the updated handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Log pentru debugging
  RAISE LOG 'handle_new_user triggered for user: %', NEW.email;
  
  -- Insert profile folosind doar coloanele care există și sunt necesare
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
      THEN (NEW.raw_user_meta_data ->> 'user_type')::public.user_type
      ELSE 'profesor'::public.user_type
    END,
    COALESCE(NEW.raw_app_meta_data ->> 'provider', 'email'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  
  RAISE LOG 'Profile created successfully for user: %', NEW.email;
  
  -- Assign role
  IF NEW.email = 'admin@automator.ro' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
    RAISE LOG 'Admin role assigned to: %', NEW.email;
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    RAISE LOG 'User role assigned to: %', NEW.email;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user for %: % %', NEW.email, SQLERRM, SQLSTATE;
    RAISE;
END;
$function$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
