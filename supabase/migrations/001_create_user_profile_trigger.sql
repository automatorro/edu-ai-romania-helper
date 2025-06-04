-- Migration to create trigger function and trigger to auto-create profile on new user signup
-- Drops existing trigger and function if they exist to avoid conflicts

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, user_type, created_at)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'user_type', now());
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();