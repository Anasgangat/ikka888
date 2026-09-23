-- GameBoost Academy database schema
-- Run this in Supabase SQL Editor

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null unique,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  short_description text,
  price numeric(12,2) not null check (price >= 0),
  currency text not null default 'ZAR',
  thumbnail_url text,
  category text not null default 'general',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger products_set_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_number text not null unique default 'ORD-' || substr(md5(random()::text), 1, 10),
  status text not null default 'pending_payment' check (
    status in (
      'pending_payment',
      'proof_submitted',
      'payment_review',
      'paid',
      'rejected',
      'cancelled'
    )
  ),
  total_amount numeric(12,2) not null check (total_amount >= 0),
  currency text not null default 'ZAR',
  payment_method text not null default 'EFT' check (payment_method = 'EFT'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger orders_set_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  created_at timestamptz not null default now(),
  unique (order_id, product_id)
);

create table if not exists public.payment_proofs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  file_url text not null,
  file_name text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger payment_proofs_set_updated_at
before update on public.payment_proofs
for each row
execute function public.set_updated_at();

create table if not exists public.course_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'revoked', 'expired')),
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists public.course_lessons (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  title text not null,
  description text,
  lesson_order integer not null default 1,
  content_type text not null default 'text' check (content_type in ('text', 'video', 'pdf', 'file')),
  content_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger course_lessons_set_updated_at
before update on public.course_lessons
for each row
execute function public.set_updated_at();

create table if not exists public.course_files (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  lesson_id uuid references public.course_lessons(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  file_type text,
  is_private boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_products_status on public.products(status);
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_course_access_user_id on public.course_access(user_id);
create index if not exists idx_course_access_product_id on public.course_access(product_id);
create index if not exists idx_payment_proofs_order_id on public.payment_proofs(order_id);
