import { supabase } from '../lib/supabaseClient';
import { DEMO_MODE } from './authService';
import { normalizeOrder } from '../utils/normalize';

/**
 * ORDER SERVICE
 * Centralized handling for all buyer/farmer transactions and real-time tracking.
 */

const MOCK_AUTH = false; // Match authService.js for consistency

/**
 * Fetch orders where user is the farmer (Seller view)
 */
export const getFarmerOrders = async () => {
  // Hybrid Mode: Always use real Supabase for data

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    if (DEMO_MODE) {
      console.warn("DEMO_MODE: No real user session, returning empty orders");
      return [];
    }
    throw new Error('Not authenticated');
  }
  const targetId = user.id;

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      buyer:profiles!buyer_id(id, name, location, phone),
      farmer:profiles!farmer_id(id, name, location),
      product:farmer_shop_products!shop_product_id(id, product_name, category, price_per_kg, image)
    `)
    .eq('farmer_id', targetId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(normalizeOrder);
};

/**
 * Fetch orders where user is the buyer (Purchases view)
 */
export const getBuyerOrders = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    if (DEMO_MODE) {
      console.warn("DEMO_MODE: No real user session, returning empty orders");
      return [];
    }
    throw new Error('Not authenticated');
  }
  const targetId = user.id;

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      buyer:profiles!buyer_id(id, name, location),
      farmer:profiles!farmer_id(id, name, location, avatar),
      product:products!product_id(id, name, category, price_per_kg, image)
    `)
    .eq('buyer_id', targetId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(normalizeOrder);
};

/**
 * Buyer creating a new order from a catalog product
 */
export const createOrder = async ({ productId, quantity, paymentMethod = 'COD', paymentStatus = 'Pending' }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const targetId = user.id;

  // Fetch product for pricing and farmer ID
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, price_per_kg, farmer_id, quantity')
    .eq('id', productId)
    .single();

  if (productError || !product) throw new Error('Product not found or removed');
  if (product.quantity < parseFloat(quantity)) throw new Error('Insufficient stock available');

  const totalPrice = parseFloat(product.price_per_kg) * parseFloat(quantity);

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      buyer_id: targetId,
      farmer_id: product.farmer_id,
      product_id: productId,
      quantity: parseFloat(quantity),
      total_price: totalPrice,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      status: 'Ordered',
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // Sync catalog quantity
  await supabase
    .from('products')
    .update({ quantity: product.quantity - parseFloat(quantity) })
    .eq('id', productId);

  return normalizeOrder(order);
};

/**
 * Participant updating order status (e.g., Seller marking as Picked Up)
 */
export const updateOrderStatus = async (orderId, status) => {
  // Hybrid Mode: Always use real Supabase for data

  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return normalizeOrder(data);
};

/**
 * Real-time subscription for order updates (Tracking, Status)
 */
export const subscribeToOrders = (userId, role, callback) => {
  if (!userId) return null;

  const channel = supabase
    .channel(`orders-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `${role === 'Farmer' ? 'farmer_id' : 'buyer_id'}=eq.${userId}`
      },
      callback
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
};
