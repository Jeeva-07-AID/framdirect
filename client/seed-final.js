import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Parse .env manually to avoid dotenv dependency in client
const envText = fs.readFileSync('.env', 'utf-8');
const env = {};
envText.split('\n').forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length > 0) {
    env[key.trim()] = rest.join('=').trim().replace(/"/g, '').replace(/'/g, '');
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

const MOCK_FARMER_ID = '00000000-0000-4000-a000-000000000000';
const MOCK_BUYER_ID = '00000000-0000-4000-a000-111111111111';

async function seed() {
  console.log('Seeding fake data for hackathon demo...');

  try {
    // 1. Create mock users
    await supabase.from('profiles').upsert([
      { id: MOCK_FARMER_ID, name: 'Demo Farmer', phone: '+919999999999', role: 'Farmer', location: 'Nellore, AP' },
      { id: MOCK_BUYER_ID, name: 'Demo Buyer', phone: '+918888888888', role: 'Buyer', location: 'Chennai, TN' }
    ], { onConflict: 'id' });

    // 2. Add fake products
    const { data: prodData } = await supabase.from('products').upsert([
      { id: '11111111-1111-4000-a000-000000000001', farmer_id: MOCK_FARMER_ID, name: 'Alphonso Mango', category: 'Fruits', price_per_kg: 280, quantity: 150, image: 'https://images.unsplash.com/photo-1553279768-865429fd00dc?w=500' },
      { id: '11111111-1111-4000-a000-000000000002', farmer_id: MOCK_FARMER_ID, name: 'Organic Tomatoes', category: 'Vegetables', price_per_kg: 45, quantity: 15, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500' },
      { id: '11111111-1111-4000-a000-000000000003', farmer_id: MOCK_FARMER_ID, name: 'Red Onions', category: 'Vegetables', price_per_kg: 55, quantity: 800, image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8d1?w=500' },
      { id: '11111111-1111-4000-a000-000000000004', farmer_id: MOCK_FARMER_ID, name: 'Basmati Rice', category: 'Grains', price_per_kg: 110, quantity: 2000, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500' }
    ], { onConflict: 'id' }).select();
    console.log('✅ 4 Products Seeded');

    // 3. Add fake Shop products
    await supabase.from('farmer_shop_products').upsert([
      { id: '88888888-1111-4000-a000-000000000001', farmer_id: MOCK_FARMER_ID, product_name: 'Premium Wheat', total_quantity: 1000, available_quantity: 1000, price_per_kg: 40, expiry_date: '2027-01-01', location: 'Nellore, AP' },
      { id: '88888888-1111-4000-a000-000000000002', farmer_id: MOCK_FARMER_ID, product_name: 'Yellow Turmeric', total_quantity: 200, available_quantity: 150, price_per_kg: 260, expiry_date: '2025-10-15', location: 'Nellore, AP' }
    ], { onConflict: 'id' });
    console.log('✅ 2 Shop Products Seeded');

    // 4. Add fake Fast Sell
    const now = new Date();
    const futureDate = new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString(); 
    const pastDate = new Date(now.getTime() + 1 * 60 * 60 * 1000).toISOString(); 
    
    const { data: fsData } = await supabase.from('fast_sell').upsert([
      { id: '22222222-1111-4000-a000-000000000001', farmer_id: MOCK_FARMER_ID, product_name: 'Flash Sale: Strawberries', price: 200, quantity: 50, location: 'Farm Pickup', expiry_time: futureDate, status: 'Active' },
      { id: '22222222-1111-4000-a000-000000000002', farmer_id: MOCK_FARMER_ID, product_name: 'Clearance: Green Chillies', price: 30, quantity: 120, location: 'City Market Hub', expiry_time: pastDate, status: 'Active' }
    ], { onConflict: 'id' }).select();
    console.log('✅ 2 Fast Sell Items Seeded');

    // 5. Add fake Orders
    await supabase.from('orders').upsert([
      { id: '33333333-1111-4000-a000-000000000001', buyer_id: MOCK_BUYER_ID, farmer_id: MOCK_FARMER_ID, product_id: '11111111-1111-4000-a000-000000000001', quantity: 15, total_price: 15 * 280, status: 'Ordered', payment_method: 'COD', payment_status: 'Pending' },
      { id: '33333333-1111-4000-a000-000000000002', buyer_id: MOCK_BUYER_ID, farmer_id: MOCK_FARMER_ID, fast_sell_id: '22222222-1111-4000-a000-000000000001', quantity: 5, total_price: 5 * 200, status: 'Picked Up', payment_method: 'UPI', payment_status: 'Paid' },
      { id: '33333333-1111-4000-a000-000000000003', buyer_id: MOCK_BUYER_ID, farmer_id: MOCK_FARMER_ID, product_id: '11111111-1111-4000-a000-000000000002', quantity: 2, total_price: 2 * 45, status: 'Delivered', payment_method: 'Credit Card', payment_status: 'Paid' }
    ], { onConflict: 'id' });
    console.log('✅ 3 Orders Seeded');

    console.log('🎉 Seeding Complete! Real Supabase data is ready.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
