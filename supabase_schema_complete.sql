-- ============================================================
-- FarmDirect - Complete Supabase PostgreSQL Database Setup
-- Run this entire script in Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ============================================================

-- Enable pgcrypto extension for UUID generation
create extension if not exists pgcrypto;

-- ============================================================
-- 1. TABLES DEFINITION
-- ============================================================

-- 1. Profiles Table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text default '',
  phone text,
  email text,
  role text check (role in ('Farmer', 'Buyer')) not null default 'Buyer',
  location text default '',
  language text default 'en',
  avatar text default '',
  average_rating numeric(3,2) default 0,
  has_set_password boolean default false,
  created_at timestamptz default now() not null
);

-- 2. Products Table (Standard Farmer marketplace catalog)
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  category text default 'Vegetables',
  price_per_kg numeric not null check (price_per_kg >= 0),
  quantity numeric not null check (quantity >= 0),
  image text default '',
  created_at timestamptz default now() not null
);

-- 3. Farmer Direct Shop Products Table
create table if not exists public.farmer_shop_products (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid references public.profiles(id) on delete cascade not null,
  product_name text not null,
  total_quantity numeric not null check (total_quantity > 0),
  available_quantity numeric not null check (available_quantity >= 0),
  price_per_kg numeric not null check (price_per_kg >= 0),
  expiry_date date not null,
  location text not null,
  created_at timestamptz default now() not null
);

-- 4. Fast Sell / Flash Sale Table (Time-sensitive produce)
create table if not exists public.fast_sell (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid references public.profiles(id) on delete cascade not null,
  product_name text not null,
  price numeric not null check (price >= 0),
  quantity numeric not null check (quantity > 0),
  location text not null,
  expiry_time timestamptz not null,
  created_at timestamptz default now() not null
);

-- 5. Transport Logistics Routes Table
create table if not exists public.transport_routes (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  destination text not null,
  boarding_point text not null,
  delivery_point text not null,
  departure_time time not null,
  arrival_time time not null,
  created_at timestamptz default now() not null
);

-- 6. Storage & Cold Warehouse Facilities Table
create table if not exists public.storage_facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('cold', 'freezer', 'dry')),
  location text not null,
  capacity numeric not null check (capacity > 0),
  available_capacity numeric not null check (available_capacity >= 0),
  price_per_day numeric not null check (price_per_day >= 0),
  contact text default '',
  created_at timestamptz default now() not null
);

-- 7. Pre-Order & Future Harvest Products Table
create table if not exists public.pre_orders_products (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid references public.profiles(id) on delete cascade,
  product_name text not null,
  expected_quantity numeric not null check (expected_quantity > 0),
  cultivation_date date not null,
  harvest_date date not null,
  location text not null,
  created_at timestamptz default now() not null
);

-- 8. Unified Orders Table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references public.profiles(id) on delete cascade not null,
  farmer_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  shop_product_id uuid references public.farmer_shop_products(id) on delete set null,
  fast_sell_id uuid references public.fast_sell(id) on delete set null,
  pre_order_product_id uuid references public.pre_orders_products(id) on delete set null,
  transport_id uuid references public.transport_routes(id) on delete set null,
  quantity numeric not null check (quantity > 0),
  total_price numeric not null check (total_price >= 0),
  status text default 'Ordered' check (status in ('Ordered', 'Picked Up', 'Delivered')),
  payment_method text default 'COD',
  payment_status text default 'Pending' check (payment_status in ('Pending', 'Paid', 'Failed')),
  delivery_status text default 'pending' check (delivery_status in ('pending', 'picked', 'in_transit', 'delivered')),
  current_location text default '',
  created_at timestamptz default now() not null
);

-- 9. Reviews & Rating Table
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references public.profiles(id) on delete cascade not null,
  farmer_id uuid references public.profiles(id) on delete cascade not null,
  rating int check (rating between 1 and 5) not null,
  comment text default '',
  created_at timestamptz default now() not null
);

-- 10. In-App Realtime Notifications Table
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  title text not null,
  message text not null,
  read boolean default false,
  created_at timestamptz default now() not null
);

-- ============================================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.farmer_shop_products enable row level security;
alter table public.fast_sell enable row level security;
alter table public.transport_routes enable row level security;
alter table public.storage_facilities enable row level security;
alter table public.pre_orders_products enable row level security;
alter table public.orders enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;

-- PROFILES
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- PRODUCTS
drop policy if exists "Products are viewable by everyone" on public.products;
create policy "Products are viewable by everyone"
  on public.products for select
  using (true);

drop policy if exists "Farmers can insert products" on public.products;
create policy "Farmers can insert products"
  on public.products for insert
  to authenticated
  with check (auth.uid() = farmer_id);

drop policy if exists "Farmers can update own products" on public.products;
create policy "Farmers can update own products"
  on public.products for update
  to authenticated
  using (auth.uid() = farmer_id);

drop policy if exists "Farmers can delete own products" on public.products;
create policy "Farmers can delete own products"
  on public.products for delete
  to authenticated
  using (auth.uid() = farmer_id);

-- FARMER SHOP PRODUCTS
drop policy if exists "Shop products are viewable by everyone" on public.farmer_shop_products;
create policy "Shop products are viewable by everyone"
  on public.farmer_shop_products for select
  using (true);

drop policy if exists "Farmers can manage own shop products" on public.farmer_shop_products;
create policy "Farmers can manage own shop products"
  on public.farmer_shop_products for all
  to authenticated
  using (auth.uid() = farmer_id)
  with check (auth.uid() = farmer_id);

-- FAST SELL
drop policy if exists "Fast sell items are viewable by everyone" on public.fast_sell;
create policy "Fast sell items are viewable by everyone"
  on public.fast_sell for select
  using (true);

drop policy if exists "Farmers can insert fast_sell" on public.fast_sell;
create policy "Farmers can insert fast_sell"
  on public.fast_sell for insert
  to authenticated
  with check (auth.uid() = farmer_id);

drop policy if exists "Farmers can update own fast_sell" on public.fast_sell;
create policy "Farmers can update own fast_sell"
  on public.fast_sell for update
  to authenticated
  using (auth.uid() = farmer_id);

drop policy if exists "Farmers can delete own fast_sell" on public.fast_sell;
create policy "Farmers can delete own fast_sell"
  on public.fast_sell for delete
  to authenticated
  using (auth.uid() = farmer_id);

-- TRANSPORT ROUTES
drop policy if exists "Transport routes are viewable by everyone" on public.transport_routes;
create policy "Transport routes are viewable by everyone"
  on public.transport_routes for select
  using (true);

-- STORAGE FACILITIES
drop policy if exists "Storage facilities are viewable by everyone" on public.storage_facilities;
create policy "Storage facilities are viewable by everyone"
  on public.storage_facilities for select
  using (true);

-- PRE-ORDERS
drop policy if exists "Pre-orders are viewable by everyone" on public.pre_orders_products;
create policy "Pre-orders are viewable by everyone"
  on public.pre_orders_products for select
  using (true);

drop policy if exists "Farmers can manage own pre-orders" on public.pre_orders_products;
create policy "Farmers can manage own pre-orders"
  on public.pre_orders_products for all
  to authenticated
  using (auth.uid() = farmer_id or farmer_id is null)
  with check (auth.uid() = farmer_id);

-- ORDERS
drop policy if exists "Users can view their related orders" on public.orders;
create policy "Users can view their related orders"
  on public.orders for select
  to authenticated
  using (auth.uid() = buyer_id or auth.uid() = farmer_id);

drop policy if exists "Buyers can insert orders" on public.orders;
create policy "Buyers can insert orders"
  on public.orders for insert
  to authenticated
  with check (auth.uid() = buyer_id);

drop policy if exists "Participants can update order status" on public.orders;
create policy "Participants can update order status"
  on public.orders for update
  to authenticated
  using (auth.uid() = buyer_id or auth.uid() = farmer_id);

-- REVIEWS
drop policy if exists "Reviews are viewable by everyone" on public.reviews;
create policy "Reviews are viewable by everyone"
  on public.reviews for select
  using (true);

drop policy if exists "Buyers can insert reviews" on public.reviews;
create policy "Buyers can insert reviews"
  on public.reviews for insert
  to authenticated
  with check (auth.uid() = buyer_id);

-- NOTIFICATIONS
drop policy if exists "Users can view their own notifications" on public.notifications;
create policy "Users can view their own notifications"
  on public.notifications for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can update their own notifications" on public.notifications;
create policy "Users can update their own notifications"
  on public.notifications for update
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Authenticated users can insert notifications" on public.notifications;
create policy "Authenticated users can insert notifications"
  on public.notifications for insert
  to authenticated
  with check (true);


-- ============================================================
-- 3. FUNCTIONS & TRIGGERS (AUTH SYNCHRONIZATION)
-- ============================================================

-- Function: Automatically create or update public.profiles on auth.users signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, phone, role, name, has_set_password)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'phone', new.phone),
    coalesce(new.raw_user_meta_data->>'role', 'Buyer'),
    coalesce(new.raw_user_meta_data->>'name', ''),
    true
  )
  on conflict (id) do update set
    email = excluded.email,
    phone = coalesce(excluded.phone, public.profiles.phone),
    role = coalesce(excluded.role, public.profiles.role),
    name = case when public.profiles.name = '' then excluded.name else public.profiles.name end;
  return new;
end;
$$;

-- Trigger on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Function: Automatically compute farmer's average rating when a review is created
create or replace function public.update_average_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set average_rating = (
    select coalesce(avg(rating)::numeric(3,2), 0)
    from public.reviews
    where farmer_id = new.farmer_id
  )
  where id = new.farmer_id;
  return new;
end;
$$;

drop trigger if exists on_review_inserted on public.reviews;
create trigger on_review_inserted
  after insert on public.reviews
  for each row execute function public.update_average_rating();


-- ============================================================
-- 4. REALTIME PUBLICATION SETUP
-- ============================================================

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'orders') then
    alter publication supabase_realtime add table public.orders;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'transport_routes') then
    alter publication supabase_realtime add table public.transport_routes;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'fast_sell') then
    alter publication supabase_realtime add table public.fast_sell;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'farmer_shop_products') then
    alter publication supabase_realtime add table public.farmer_shop_products;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'notifications') then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;


-- ============================================================
-- 5. SEED MASTER DATA
-- ============================================================

-- Seed Transport Routes
insert into public.transport_routes (source, destination, boarding_point, delivery_point, departure_time, arrival_time)
values 
  ('Trichy', 'Thanjavur', 'Trichy Central Market', 'Thanjavur Old Bus Stand', '23:00:00', '05:00:00'),
  ('Madurai', 'Chennai', 'Mattuthavani', 'Koyambedu', '20:00:00', '06:00:00'),
  ('Coimbatore', 'Salem', 'Mettupalayam Road', 'Salem Junction', '22:00:00', '02:00:00'),
  ('Salem', 'Coimbatore', 'Salem Junction', 'Mettupalayam Road', '06:00:00', '10:00:00'),
  ('Chennai', 'Madurai', 'Koyambedu', 'Mattuthavani', '21:00:00', '05:00:00'),
  ('Bangalore', 'Chennai', 'KR Market', 'Koyambedu Market', '22:00:00', '04:30:00')
on conflict do nothing;

-- Seed Storage Facilities
insert into public.storage_facilities (name, type, location, capacity, available_capacity, price_per_day, contact)
values
  ('Trichy ColdCore',       'cold',    'Trichy, Tamil Nadu',      500,  120,  250, '+91 98432 11234'),
  ('Thanjavur FreshFreeze', 'freezer', 'Thanjavur, Tamil Nadu',   300,  300,  400, '+91 98765 54321'),
  ('Salem Dry Grain Hub',   'dry',     'Salem, Tamil Nadu',       1000,  45,  100, '+91 94432 88765'),
  ('Madurai KoolVault',     'cold',    'Madurai, Tamil Nadu',      800,  600, 300, '+91 98001 22333'),
  ('Coimbatore IcePlex',    'freezer', 'Coimbatore, Tamil Nadu',  400,   30,  450, '+91 96001 77654'),
  ('Chennai AgroStore',     'dry',     'Chennai, Tamil Nadu',    2000, 1200,  150, '+91 82000 43210')
on conflict do nothing;

-- Seed Pre-Orders Sample Catalogs
insert into public.pre_orders_products 
  (product_name, expected_quantity, cultivation_date, harvest_date, location)
values
  ('Brinjal', 50, '2026-04-01', '2026-05-15', 'Trichy'),
  ('Tomato', 100, '2026-04-05', '2026-05-10', 'Thanjavur'),
  ('Chilli', 30, '2026-04-03', '2026-05-20', 'Karur'),
  ('Organic Alphonso Mangoes', 1000, '2026-03-01', '2026-05-15', 'Ratnagiri'),
  ('Premium Basmati Rice', 2500, '2026-02-15', '2026-06-20', 'Karnal')
on conflict do nothing;
