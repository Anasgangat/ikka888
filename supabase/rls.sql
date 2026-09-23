-- Row-level security policies for the browser Supabase client
-- Run this after schema.sql and auth-setup.sql

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payment_proofs enable row level security;
alter table public.course_access enable row level security;
alter table public.course_lessons enable row level security;
alter table public.course_files enable row level security;

-- Make this script safe to run again after policy changes.
drop policy if exists "Users can read their own profile" on public.profiles;
drop policy if exists "Admins can read all profiles" on public.profiles;
drop policy if exists "Anyone can read published products" on public.products;
drop policy if exists "Admins can create products" on public.products;
drop policy if exists "Admins can update products" on public.products;
drop policy if exists "Admins can delete products" on public.products;
drop policy if exists "Users can read their own orders" on public.orders;
drop policy if exists "Users can create their own orders" on public.orders;
drop policy if exists "Admins can review orders" on public.orders;
drop policy if exists "Users can submit proof for their orders" on public.orders;
drop policy if exists "Users can read their own order items" on public.order_items;
drop policy if exists "Users can create items for their own orders" on public.order_items;
drop policy if exists "Users can read their own course access" on public.course_access;
drop policy if exists "Admins can grant course access" on public.course_access;
drop policy if exists "Admins can update course access" on public.course_access;
drop policy if exists "Users can read lessons for active courses" on public.course_lessons;
drop policy if exists "Admins can create lessons" on public.course_lessons;
drop policy if exists "Admins can update lessons" on public.course_lessons;
drop policy if exists "Admins can delete lessons" on public.course_lessons;
drop policy if exists "Users can read files for active courses" on public.course_files;
drop policy if exists "Users can read their own payment proofs" on public.payment_proofs;
drop policy if exists "Users can submit their own payment proofs" on public.payment_proofs;
drop policy if exists "Users can update their own payment proofs" on public.payment_proofs;
drop policy if exists "Admins can review payment proofs" on public.payment_proofs;
drop policy if exists "Admins can delete payment proofs" on public.payment_proofs;
drop policy if exists "Users can upload their own payment proof files" on storage.objects;
drop policy if exists "Users and admins can read payment proof files" on storage.objects;
drop policy if exists "Users can update their own payment proof files" on storage.objects;
drop policy if exists "Admins can upload course content files" on storage.objects;
drop policy if exists "Admins can update course content files" on storage.objects;
drop policy if exists "Admins can delete course content files" on storage.objects;
drop policy if exists "Users with access can read course content files" on storage.objects;

create policy "Users can read their own profile"
on public.profiles for select
to authenticated
using (id = auth.uid());

create policy "Admins can read all profiles"
on public.profiles for select
to authenticated
using (public.is_admin());

create policy "Anyone can read published products"
on public.products for select
to anon, authenticated
using (status = 'published' or public.is_admin());

create policy "Admins can create products"
on public.products for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update products"
on public.products for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete products"
on public.products for delete
to authenticated
using (public.is_admin());

create policy "Users can read their own orders"
on public.orders for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "Users can create their own orders"
on public.orders for insert
to authenticated
with check (user_id = auth.uid());

create policy "Admins can review orders"
on public.orders for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Users can submit proof for their orders"
on public.orders for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid() and status = 'proof_submitted');

create or replace function public.prevent_user_order_tampering()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if new.user_id is distinct from old.user_id
    or new.total_amount is distinct from old.total_amount
    or new.currency is distinct from old.currency
    or new.payment_method is distinct from old.payment_method
    or new.order_number is distinct from old.order_number
    or new.status <> 'proof_submitted' then
    raise exception 'Users may only submit payment proof for their own order';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_user_order_tampering on public.orders;
create trigger prevent_user_order_tampering
before update on public.orders
for each row execute function public.prevent_user_order_tampering();

create policy "Users can read their own order items"
on public.order_items for select
to authenticated
using (
  exists (
    select 1 from public.orders
    where orders.id = order_id
      and (orders.user_id = auth.uid() or public.is_admin())
  )
);

create policy "Users can create items for their own orders"
on public.order_items for insert
to authenticated
with check (
  exists (
    select 1 from public.orders
    where orders.id = order_id and orders.user_id = auth.uid()
  )
);

create policy "Users can read their own course access"
on public.course_access for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "Admins can grant course access"
on public.course_access for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update course access"
on public.course_access for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Users can read lessons for active courses"
on public.course_lessons for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.course_access
    where course_access.product_id = course_lessons.product_id
      and course_access.user_id = auth.uid()
      and course_access.status = 'active'
  )
);

create policy "Admins can create lessons"
on public.course_lessons for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update lessons"
on public.course_lessons for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete lessons"
on public.course_lessons for delete
to authenticated
using (public.is_admin());

create policy "Users can read files for active courses"
on public.course_files for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.course_access
    where course_access.product_id = course_files.product_id
      and course_access.user_id = auth.uid()
      and course_access.status = 'active'
  )
);

create policy "Users can read their own payment proofs"
on public.payment_proofs for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "Users can submit their own payment proofs"
on public.payment_proofs for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can update their own pending payment proofs"
on public.payment_proofs for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid() and status = 'pending');

create policy "Admins can review payment proofs"
on public.payment_proofs for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete payment proofs"
on public.payment_proofs for delete
to authenticated
using (public.is_admin());

insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

create policy "Users can upload their own payment proof files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'payment-proofs'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users and admins can read payment proof files"
on storage.objects for select
to authenticated
using (bucket_id = 'payment-proofs' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

create policy "Users can update their own payment proof files"
on storage.objects for update
to authenticated
using (bucket_id = 'payment-proofs' and (storage.foldername(name))[1] = auth.uid()::text);

-- Private course content bucket.
-- Files are stored as: course-content/<product_id>/<file-name>
-- The first folder is the product id, which lets us check course access.
insert into storage.buckets (id, name, public)
values ('course-content', 'course-content', false)
on conflict (id) do nothing;

create policy "Admins can upload course content files"
on storage.objects for insert
to authenticated
with check (bucket_id = 'course-content' and public.is_admin());

create policy "Admins can update course content files"
on storage.objects for update
to authenticated
using (bucket_id = 'course-content' and public.is_admin());

create policy "Admins can delete course content files"
on storage.objects for delete
to authenticated
using (bucket_id = 'course-content' and public.is_admin());

-- A learner may read a file only if they have active access to the product
-- whose id is the first folder in the file path.
create policy "Users with access can read course content files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'course-content'
  and (
    public.is_admin()
    or exists (
      select 1 from public.course_access
      where course_access.user_id = auth.uid()
        and course_access.status = 'active'
        and course_access.product_id::text = (storage.foldername(name))[1]
    )
  )
);
