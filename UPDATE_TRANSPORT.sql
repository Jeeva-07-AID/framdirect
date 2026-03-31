-- ============================================================
-- FarmDirect - Transport & Tracking Update
-- Run this file in your Supabase SQL Editor
-- ============================================================

-- 1. Create transport_routes table
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

-- Enable RLS for transport_routes
alter table public.transport_routes enable row level security;

-- Policies for transport_routes
create policy "Anyone can view transport routes"
  on public.transport_routes for select
  using (true);

-- 2. Update existing orders table
alter table public.orders 
  add column if not exists transport_id uuid references public.transport_routes(id),
  add column if not exists delivery_status text default 'pending' check (delivery_status in ('pending', 'picked', 'in_transit', 'delivered')),
  add column if not exists current_location text;

-- 3. Insert mock transport data for testing
-- These routes match some likely random location names, but we'll fall back to 'Any' on source/dest for a generic demo.
insert into public.transport_routes 
  (source, destination, boarding_point, delivery_point, departure_time, arrival_time)
values
  ('Trichy', 'Thanjavur', 'Trichy Main Market', 'Thanjavur Bus Stand', '23:00', '05:00'),
  ('Coimbatore', 'Chennai', 'CBE Wholesale Market', 'Koyambedu Market', '20:30', '06:00'),
  ('Madurai', 'Trichy', 'Madurai Central', 'Trichy Wholesale', '18:00', '22:30'),
  ('Bangalore', 'Chennai', 'KR Market', 'Koyambedu Market', '22:00', '04:30'),
  ('Any', 'Any', 'Local Farm Hub', 'City Center Dropoff', '09:00', '14:00'), -- Generic fallback route 1
  ('Any', 'Any', 'Rural Outpost', 'Main District Market', '16:00', '20:00') -- Generic fallback route 2
on conflict do nothing;

-- 4. Ensure Realtime is fully listening to orders (if not already)
-- Use this query to verify realtime features reflect current_location and delivery_status
begin;
  alter publication supabase_realtime add table public.transport_routes;
commit;
