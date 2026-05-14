-- ============================================================
-- OnlyOne Hairboss – Billing Schema
-- Run AFTER schema.sql in your Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. SAFE ADMIN HELPER (security definer bypasses RLS —
--    prevents infinite recursion when policies query profiles)
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer          -- runs as function owner, bypasses RLS
stable                    -- result is constant within one statement
set search_path = public  -- pin search_path against hijacking
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Grant execute to authenticated users only
revoke execute on function public.is_admin() from public;
grant  execute on function public.is_admin() to authenticated;


-- ============================================================
-- 2. FIX EXISTING SCHEMA — replace inline subqueries with
--    is_admin() to eliminate recursive RLS evaluation on profiles
-- ============================================================

-- Products: admin write (was using inline subquery)
drop policy if exists "products_admin_write" on products;
create policy "products_admin_write" on products
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- Profiles: admin read-all
drop policy if exists "profiles_admin_read" on profiles;
create policy "profiles_admin_read" on profiles
  for select
  using (public.is_admin());

-- Orders: combined select
drop policy if exists "orders_own_read" on orders;
create policy "orders_own_read" on orders
  for select
  using (user_id = auth.uid() or public.is_admin());

-- Orders: admin update
drop policy if exists "orders_admin_update" on orders;
create policy "orders_admin_update" on orders
  for update
  using (public.is_admin());

-- ============================================================
-- 3. FIX handle_new_user — handle Google OAuth (uses 'name')
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
      nullif(trim(new.raw_user_meta_data->>'name'), ''),   -- Google OAuth
      ''
    )
  )
  on conflict (id) do update
    set
      email     = excluded.email,
      full_name = case
                    when excluded.full_name <> '' then excluded.full_name
                    else profiles.full_name
                  end;
  return new;
end;
$$;


-- ============================================================
-- 4. BILLING INFO TABLE
-- ============================================================

create table if not exists public.billing_info (
  id          uuid        default gen_random_uuid() primary key,
  user_id     uuid        not null unique references auth.users(id) on delete cascade,
  full_name   text        not null,
  email       text        not null,
  phone       text        not null default '',
  address     text        not null default '',
  city        text        not null default '',
  state       text        not null default '',
  country     text        not null default 'Nigeria',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- Light server-side validation
  constraint billing_full_name_not_blank check (trim(full_name) <> ''),
  constraint billing_email_not_blank     check (trim(email) <> ''),
  constraint billing_email_format        check (email like '%@%.%')
);

comment on table public.billing_info is
  'One billing/shipping address row per user. Upserted on checkout.';


-- ============================================================
-- 5. updated_at AUTO-STAMP
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists billing_info_set_updated_at on public.billing_info;
create trigger billing_info_set_updated_at
  before update on public.billing_info
  for each row execute function public.set_updated_at();


-- ============================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================

alter table public.billing_info enable row level security;

-- ── SELECT ───────────────────────────────────────────────────
-- Customers: own row only
create policy "billing_customer_select" on public.billing_info
  for select
  using (user_id = auth.uid());

-- Admins: all rows
create policy "billing_admin_select" on public.billing_info
  for select
  using (public.is_admin());

-- ── INSERT ───────────────────────────────────────────────────
-- Customers: can only insert a row for themselves
-- (WITH CHECK enforces the new row's user_id matches caller)
create policy "billing_customer_insert" on public.billing_info
  for insert
  with check (user_id = auth.uid());

-- ── UPDATE ───────────────────────────────────────────────────
-- Customers: can only update their own row, and cannot change user_id
-- USING  → which existing row may be touched
-- WITH CHECK → what the resulting row is allowed to look like
create policy "billing_customer_update" on public.billing_info
  for update
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Admins: can update any row (e.g. mark as verified)
create policy "billing_admin_update" on public.billing_info
  for update
  using  (public.is_admin())
  with check (public.is_admin());

-- ── DELETE ───────────────────────────────────────────────────
-- No DELETE policies → no one can delete billing rows via RLS.
-- Cascading deletes from auth.users still work at DB level.

-- ============================================================
-- END OF BILLING SCHEMA
-- ============================================================
