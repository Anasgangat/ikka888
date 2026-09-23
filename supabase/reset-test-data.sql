-- This keeps user accounts and products.
-- Run once in the Supabase SQL Editor.

-- Orders cascade to order_items and payment_proofs because of schema foreign keys.
delete from public.orders;

-- Optional: remove course access created during previous approval tests.
-- Uncomment only if you want every user's course access reset too.
-- delete from public.course_access;
