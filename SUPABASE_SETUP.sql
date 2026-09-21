-- ============================================================
-- FarmDirect - Supabase PostgreSQL Setup
-- Run this entire file in your Supabase SQL Editor
-- ============================================================

-- ==================== TABLES ====================

-- Profiles table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text default '',
  phone text,
  email text,
  role text check (role in ('Farmer', 'Buyer')) not null,
  location text default '',
  language text default 'en',
  avatar text default '',
  average_rating numeric(3,2) default 0,
  has_set_password boolean default false,
  created_at timestamptz default now() not null
);

-- Products table
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

-- Orders table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references public.profiles(id) not null,
  farmer_id uuid references public.profiles(id) not null,
  product_id uuid references public.products(id) not null,
  quantity numeric not null check (quantity > 0),
  total_price numeric not null,
  status text default 'Ordered' check (status in ('Ordered', 'Picked Up', 'Delivered')),
  payment_method text default 'COD',
  payment_status text default 'Pending' check (payment_status in ('Pending', 'Paid', 'Failed')),
  created_at timestamptz default now() not null,
  transport_id uuid,
  delivery_status text default 'pending' check (delivery_status in ('pending', 'picked', 'in_transit', 'delivered')),
  current_location text default ''
);

-- Reviews table
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references public.profiles(id) not null,
  farmer_id uuid references public.profiles(id) not null,
  rating int check (rating between 1 and 5) not null,
  comment text default '',
  created_at timestamptz default now() not null
);

-- ==================== ROW LEVEL SECURITY ====================

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.reviews enable row level security;

-- PROFILES POLICIES
create policy "Authenticated users can view all profiles"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- PRODUCTS POLICIES
create policy "Anyone can view products"
  on public.products for select
  using (true);

create policy "Farmers can insert products"
  on public.products for insert
  to authenticated
  with check (auth.uid() = farmer_id);

create policy "Farmers can update own products"
  on public.products for update
  to authenticated
  using (auth.uid() = farmer_id);

create policy "Farmers can delete own products"
  on public.products for delete
  to authenticated
  using (auth.uid() = farmer_id);

-- ORDERS POLICIES
create policy "Users can view their own orders"
  on public.orders for select
  to authenticated
  using (auth.uid() = buyer_id or auth.uid() = farmer_id);

create policy "Buyers can create orders"
  on public.orders for insert
  to authenticated
  with check (auth.uid() = buyer_id);

create policy "Farmers can update order status"
  on public.orders for update
  to authenticated
  using (auth.uid() = farmer_id);

-- REVIEWS POLICIES
create policy "Anyone can view reviews"
  on public.reviews for select
  using (true);

create policy "Buyers can create reviews"
  on public.reviews for insert
  to authenticated
  with check (auth.uid() = buyer_id);

-- ==================== FUNCTIONS & TRIGGERS ====================

-- Auto-update farmer's average_rating when a review is inserted
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
  for each row
  execute function public.update_average_rating();

-- ==================== REALTIME ====================
-- Enable realtime for orders table for live status updates
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.transport_routes;

-- ==================== TRANSPORT ROUTES TABLE ====================
create table if not exists public.transport_routes (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  destination text not null,
  boarding_point text,
  delivery_point text,
  departure_time time,
  arrival_time time,
  created_at timestamptz default now() not null
);

alter table public.transport_routes enable row level security;

create policy "Anyone can view transport routes"
  on public.transport_routes for select
  using (true);

-- Seed sample data
insert into public.transport_routes (source, destination, boarding_point, delivery_point, departure_time, arrival_time)
values 
  ('Trichy', 'Thanjavur', 'Trichy Central Market', 'Thanjavur Old Bus Stand', '23:00:00', '05:00:00'),
  ('Madurai', 'Chennai', 'Mattuthavani', 'Koyambedu', '20:00:00', '06:00:00'),
  ('Coimbatore', 'Salem', 'Mettupalayam Road', 'Salem Junction', '22:00:00', '02:00:00'),
  ('Salem', 'Coimbatore', 'Salem Junction', 'Mettupalayam Road', '06:00:00', '10:00:00'),
  ('Chennai', 'Madurai', 'Koyambedu', 'Mattuthavani', '21:00:00', '05:00:00');

-- Foreign key for orders
alter table public.orders 
  add constraint fk_order_transport 
  foreign key (transport_id) 
  references public.transport_routes(id);

-- ==================== FAST SELL TABLE ====================
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

alter table public.fast_sell enable row level security;

-- FAST SELL POLICIES
create policy "Anyone can view active fast_sell items"
  on public.fast_sell for select
  using (true);

create policy "Farmers can insert fast_sell items"
  on public.fast_sell for insert
  to authenticated
  with check (auth.uid() = farmer_id);

create policy "Farmers can update own fast_sell items"
  on public.fast_sell for update
  to authenticated
  using (auth.uid() = farmer_id);

create policy "Farmers can delete own fast_sell items"
  on public.fast_sell for delete
  to authenticated
  using (auth.uid() = farmer_id);

-- Add fast_sell to realtime publication
alter publication supabase_realtime add table public.fast_sell;


-- ==================== SAMPLE DATA (OPTIONAL) ====================
-- Uncomment and run after creating your first user accounts to add demo data
-- (Replace 'YOUR_FARMER_UUID' with actual IDs from your profiles table)

-- insert into public.products (farmer_id, name, category, price_per_kg, quantity, image)
-- values
--   ('YOUR_FARMER_UUID', 'Fresh Tomatoes', 'Vegetables', 40, 100, ''),
--   ('YOUR_FARMER_UUID', 'Red Onions', 'Vegetables', 30, 200, ''),
--   ('YOUR_FARMER_UUID', 'Alphonso Mangoes', 'Fruits', 120, 50, '');

-- ==================== STORAGE FACILITIES TABLE ====================
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

alter table public.storage_facilities enable row level security;

create policy "Anyone can view storage facilities"
  on public.storage_facilities for select
  using (true);

-- Seed storage facilities data
insert into public.storage_facilities (name, type, location, capacity, available_capacity, price_per_day, contact)
values
  ('Trichy ColdCore',      'cold',    'Trichy, Tamil Nadu',      500,  120,  250, '+91 98432 11234'),
  ('Thanjavur FreshFreeze','freezer', 'Thanjavur, Tamil Nadu',   300,  300,  400, '+91 98765 54321'),
  ('Salem Dry Grain Hub',  'dry',     'Salem, Tamil Nadu',       1000,  45,  100, '+91 94432 88765'),
  ('Madurai KoolVault',    'cold',    'Madurai, Tamil Nadu',      800,  600, 300, '+91 98001 22333'),
  ('Coimbatore IcePlex',   'freezer', 'Coimbatore, Tamil Nadu',  400,   30,  450, '+91 96001 77654'),
  ('Chennai AgroStore',    'dry',     'Chennai, Tamil Nadu',    2000, 1200,  150, '+91 82000 43210');

-- ==================== PRE-ORDERS PRODUCTS TABLE ====================
create table if not exists public.pre_orders_products (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid references public.profiles(id) on delete cascade,
  product_name text not null,
  expected_quantity numeric not null,
  cultivation_date date not null,
  harvest_date date not null,
  location text not null,
  created_at timestamptz default now() not null
);

alter table public.pre_orders_products enable row level security;

create policy "Anyone can view pre-orders"
  on public.pre_orders_products for select
  using (true);

create policy "Farmers can manage their own pre-orders"
  on public.pre_orders_products for all
  to authenticated
  using (auth.uid() = farmer_id)
  with check (auth.uid() = farmer_id);

-- Seed data from user
insert into public.pre_orders_products 
(product_name, expected_quantity, cultivation_date, harvest_date, location)
values
('Brinjal', 50, '2026-04-01', '2026-05-15', 'Trichy'),
('Tomato', 100, '2026-04-05', '2026-05-10', 'Thanjavur'),
('Chilli', 30, '2026-04-03', '2026-05-20', 'Karur');

-- ==================== FARMER SHOP PRODUCTS TABLE ====================
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

alter table public.farmer_shop_products enable row level security;

create policy "Anyone can view shop products"
  on public.farmer_shop_products for select
  using (true);

create policy "Farmers can manage own shop products"
  on public.farmer_shop_products for all
  to authenticated
  using (auth.uid() = farmer_id)
  with check (auth.uid() = farmer_id);

-- Enable realtime for shop products
alter publication supabase_realtime add table public.farmer_shop_products;

-- Alter orders table to support shop purchases, fast sell, and pre-orders natively
alter table public.orders alter column product_id drop not null;
alter table public.orders add column shop_product_id uuid references public.farmer_shop_products(id);
alter table public.orders add column fast_sell_id uuid references public.fast_sell(id);
alter table public.orders add column pre_order_product_id uuid references public.pre_orders_products(id);

-- ==================== NOTIFICATIONS TABLE ====================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  title text not null,
  message text not null,
  read boolean default false,
  created_at timestamptz default now() not null
);

alter table public.notifications enable row level security;

create policy "Users can view their own notifications"
  on public.notifications for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Service role can insert notifications"
  on public.notifications for insert
  to authenticated
  with check (true);

-- Enable realtime for notifications
alter publication supabase_realtime add table public.notifications;

-- ==================== SAMPLE SHOP DATA (SEED) ====================
-- Uses the first available farmer ID to assign these sandbox items
insert into public.farmer_shop_products 
(farmer_id, product_name, total_quantity, available_quantity, price_per_kg, expiry_date, location)
values
((select id from public.profiles where role = 'Farmer' limit 1), 'Orange', 100, 100, 40, '2026-04-10', 'Trichy'),
((select id from public.profiles where role = 'Farmer' limit 1), 'Tomato', 200, 200, 20, '2026-04-05', 'Thanjavur'),
((select id from public.profiles where role = 'Farmer' limit 1), 'Potato', 300, 300, 15, '2026-05-01', 'Karur'),
((select id from public.profiles where role = 'Farmer' limit 1), 'Onion', 250, 250, 18, '2026-04-20', 'Madurai'),
((select id from public.profiles where role = 'Farmer' limit 1), 'Brinjal', 150, 150, 25, '2026-04-15', 'Salem'),
((select id from public.profiles where role = 'Farmer' limit 1), 'Carrot', 120, 120, 30, '2026-04-18', 'Erode'),
((select id from public.profiles where role = 'Farmer' limit 1), 'Cabbage', 180, 180, 22, '2026-04-12', 'Coimbatore'),
((select id from public.profiles where role = 'Farmer' limit 1), 'Chilli', 80, 80, 50, '2026-04-25', 'Dindigul'),
((select id from public.profiles where role = 'Farmer' limit 1), 'Banana', 500, 500, 10, '2026-04-30', 'Tirunelveli'),
((select id from public.profiles where role = 'Farmer' limit 1), 'Mango', 200, 200, 60, '2026-05-10', 'Salem');
