-- Supabase Auth + profile setup
-- Run this in Supabase SQL Editor

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    'user'
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = excluded.full_name,
      updated_at = now();

  return new;
end;
$$;

create or replace trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_authenticated()
returns boolean
language sql
security definer
set search_path = public
as $$
  select auth.uid() is not null;
$$;
