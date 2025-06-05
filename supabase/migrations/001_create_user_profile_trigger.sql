
-- Migration to create trigger function and trigger to auto-create profile on new user signup
-- Drops existing trigger and function if they exist to avoid conflicts

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Drop the enum if it exists and recreate it to ensure it's properly defined
DROP TYPE IF EXISTS public.user_type CASCADE;
CREATE TYPE public.user_type AS ENUM ('profesor', 'elev', 'parinte');

-- Create the function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    profile_count INTEGER;
    role_count INTEGER;
BEGIN
    -- Log inițial
    RAISE LOG 'Starting handle_new_user for user: % (ID: %)', NEW.email, NEW.id;
    
    -- Verific dacă profilul există deja
    SELECT COUNT(*) INTO profile_count FROM public.profiles WHERE user_id = NEW.id;
    RAISE LOG 'Existing profiles for user %: %', NEW.id, profile_count;
    
    -- Doar dacă profilul nu există, îl creez
    IF profile_count = 0 THEN
        RAISE LOG 'Creating profile for user: %', NEW.email;
        
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
    ELSE
        RAISE LOG 'Profile already exists for user: %, skipping creation', NEW.email;
    END IF;
    
    -- Verific dacă role-ul există deja
    SELECT COUNT(*) INTO role_count FROM public.user_roles WHERE user_id = NEW.id;
    RAISE LOG 'Existing roles for user %: %', NEW.id, role_count;
    
    -- Doar dacă role-ul nu există, îl creez
    IF role_count = 0 THEN
        IF NEW.email = 'admin@automator.ro' THEN
            INSERT INTO public.user_roles (user_id, role)
            VALUES (NEW.id, 'admin');
            RAISE LOG 'Admin role assigned to: %', NEW.email;
        ELSE
            INSERT INTO public.user_roles (user_id, role)
            VALUES (NEW.id, 'user');
            RAISE LOG 'User role assigned to: %', NEW.email;
        END IF;
    ELSE
        RAISE LOG 'Role already exists for user: %, skipping creation', NEW.email;
    END IF;
    
    RAISE LOG 'handle_new_user completed successfully for user: %', NEW.email;
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'ERROR in handle_new_user for user % (%): % - %', NEW.email, NEW.id, SQLERRM, SQLSTATE;
        -- Nu facem RAISE pentru a nu bloca înregistrarea
        RETURN NEW;
END;
$function$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
