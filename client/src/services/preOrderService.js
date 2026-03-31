import { supabase } from '../lib/supabaseClient';
import { normalizeProduct } from '../utils/normalize';
import { DEMO_MODE } from './authService';

/**
 * PRE-ORDER SERVICES
 * Managing future harvests and buyers pre-ordering them.
 */

const MOCK_AUTH = false; // Consistent with other services

const MOCK_PREORDERS = [
  { id: 'h1', product_name: 'Alphonso Mangoes', expected_quantity: 1000, cultivation_date: '2026-02-01', harvest_date: '2026-05-15', location: 'Ratnagiri', farmer: { id: 'mock-user-uuid', name: 'Demo Farmer' } },
  { id: 'h2', product_name: 'Basmati Rice', expected_quantity: 2500, cultivation_date: '2026-01-10', harvest_date: '2026-06-20', location: 'Karnal', farmer: { id: 'mock-user-uuid', name: 'Demo Farmer' } },
  { id: 'h3', product_name: 'Red Chillies', expected_quantity: 500, cultivation_date: '2026-03-05', harvest_date: '2026-05-25', location: 'Guntur', farmer: { id: 'mock-user-uuid', name: 'Demo Farmer' } },
];

/**
 * Fetch all pre-order products (future harvests)
 */
export const getPreOrders = async () => {
  // Hybrid Mode: Always use real Supabase for data

  const { data, error } = await supabase
    .from('pre_orders_products')
    .select(`
      *,
      farmer:profiles!farmer_id(id, name, location, avatar)
    `)
    .order('harvest_date', { ascending: true });

  if (error) {
    console.error('Error fetching pre-orders:', error);
    throw error;
  }
  
  const realPreOrders = data || [];
  
  if (realPreOrders.length > 0) return realPreOrders;

  // Fallback high-fidelity mock data if DB is empty
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
  const nextTwoMonths = new Date(now.getFullYear(), now.getMonth() + 2, 1).toISOString();

  const mockFallback = [
    { id: 'h1', product_name: 'Organic Alphonso Mangoes', expected_quantity: 1000, cultivation_date: now.toISOString(), harvest_date: nextMonth, location: 'Ratnagiri, MH', farmer: { id: 'f1', name: 'Ravi Teja Farms', average_rating: 4.9 } },
    { id: 'h2', product_name: 'Premium Basmati Rice', expected_quantity: 2500, cultivation_date: now.toISOString(), harvest_date: nextTwoMonths, location: 'Karnal, HR', farmer: { id: 'f6', name: 'Himalayan Grains', average_rating: 4.7 } },
  ];

  return mockFallback;
};

/**
 * Fetch pre-orders for a specific farmer
 */
export const getFarmerPreOrders = async (farmerId) => {
  let data = [];
  try {
    const targetId = (DEMO_MODE ? farmerId || '00000000-0000-0000-0000-000000000000' : farmerId);
    if (!targetId) return [];

    const { data: realData, error } = await supabase
      .from('pre_orders_products')
      .select('*')
      .eq('farmer_id', targetId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    data = realData || [];
  } catch (err) {
    console.error("Supabase fetch for preorders failed", err);
    if (!DEMO_MODE) throw err;
  }
  
  if (DEMO_MODE && data.length < 3) {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 15).toISOString();
    const nextTwoMonths = new Date(now.getFullYear(), now.getMonth() + 2, 10).toISOString();
    const inThreeWeeks = new Date(now.getTime() + (21 * 24 * 60 * 60 * 1000)).toISOString();

    const mockFarmerHarvests = [
      { id: 'mh1', product_name: 'Organic Alphonso Mangoes', expected_quantity: 800, cultivation_date: now.toISOString(), harvest_date: nextMonth, location: 'Ratnagiri, MH' },
      { id: 'mh2', product_name: 'Premium Basmati Rice', expected_quantity: 2000, cultivation_date: now.toISOString(), harvest_date: nextTwoMonths, location: 'Karnal, HR' },
      { id: 'mh3', product_name: 'Fresh Red Chillies', expected_quantity: 350, cultivation_date: now.toISOString(), harvest_date: inThreeWeeks, location: 'Guntur, AP' }
    ];
    // Avoid name duplicates
    const existingNames = new Set(data.map(h => h.product_name));
    const uniqueDemo = mockFarmerHarvests.filter(h => !existingNames.has(h.product_name));
    return [...data, ...uniqueDemo];
  }

  return data;
};

/**
 * Add a new pre-order (future harvest) listing
 */
export const addPreOrder = async ({ product_name, expected_quantity, cultivation_date, harvest_date, location }) => {
  // Hybrid Mode: Always use real Supabase for data

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const targetId = user.id;

  const { data, error } = await supabase
    .from('pre_orders_products')
    .insert([{ 
      farmer_id: targetId,
      product_name, 
      expected_quantity: parseFloat(expected_quantity), 
      cultivation_date, 
      harvest_date, 
      location 
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding pre-order:', error);
    throw error;
  }
  return data;
};

/**
 * Process a buyer's pre-order placement (with 25% advance)
 */
export const placePreOrder = async ({ preOrderProductId, quantity, totalAmount, paymentDetails }) => {
  // Hybrid Mode: Always use real Supabase for data

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const targetId = user.id;

  const { data: product } = await supabase
    .from('pre_orders_products')
    .select('farmer_id')
    .eq('id', preOrderProductId)
    .single();

  const { data, error } = await supabase
    .from('orders')
    .insert([{
      buyer_id: targetId,
      farmer_id: product.farmer_id,
      pre_order_product_id: preOrderProductId,
      quantity: parseFloat(quantity),
      total_price: parseFloat(totalAmount),
      payment_method: paymentDetails.paymentMethod,
      payment_status: paymentDetails.paymentStatus,
      status: 'Ordered',
      delivery_status: 'pending'
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete a pre-order listing
 */
export const deletePreOrder = async (id) => {
  // Hybrid Mode: Always use real Supabase for data

  const { error } = await supabase
    .from('pre_orders_products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting pre-order:', error);
    throw error;
  }
  return true;
};
