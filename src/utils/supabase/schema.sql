-- ============================================================
-- OnlyOne Hairboss – Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- PRODUCTS
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  price numeric not null,
  description text default '',
  images text[] default array[]::text[],
  category text default 'general',
  is_featured boolean default false,
  in_stock boolean default true,
  stock_count int default 0,
  created_at timestamptz default now()
);

-- PROFILES (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text default '',
  email text default '',
  phone text default '',
  role text default 'customer',
  created_at timestamptz default now()
);

-- ORDERS
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text not null,
  address text not null,
  city text not null,
  state text not null,
  total numeric not null,
  status text default 'pending',
  payment_method text default 'transfer',
  payment_proof text default '',
  notes text default '',
  created_at timestamptz default now()
);

-- ORDER ITEMS
create table if not exists order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  product_image text default '',
  quantity int not null default 1,
  price numeric not null
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table products enable row level security;
alter table profiles enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- SECURITY DEFINER helper: checks admin role without triggering RLS recursion
-- (querying profiles inside an RLS policy on profiles causes infinite recursion)
create or replace function is_admin()
returns boolean language sql security definer as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin')
$$;

-- Products: public read, admin write
create policy "products_public_read" on products for select using (true);
create policy "products_admin_write" on products for all using (is_admin());

-- Profiles: users manage own profile, admins read all
create policy "profiles_own" on profiles for all using (id = auth.uid());
create policy "profiles_admin_read" on profiles for select using (is_admin());

-- Orders: users see own orders, admins see all
create policy "orders_own_read" on orders for select using (
  user_id = auth.uid() or is_admin()
);
create policy "orders_insert" on orders for insert with check (true);
create policy "orders_admin_update" on orders for update using (is_admin());

-- Order items: follow parent order access
create policy "order_items_read" on order_items for select using (
  exists (
    select 1 from orders where id = order_id and (
      user_id = auth.uid() or
      exists (select 1 from profiles where id = auth.uid() and role = 'admin')
    )
  )
);
create policy "order_items_insert" on order_items for insert with check (true);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- STORAGE BUCKET FOR PRODUCT IMAGES
-- ============================================================
-- Run this separately in the Storage section of Supabase:
-- Create a bucket called "product-images" and set it to PUBLIC.
-- Or run:
-- insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true);
