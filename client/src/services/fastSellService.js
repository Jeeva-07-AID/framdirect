import { supabase } from '../lib/supabaseClient';
import { normalizeFastSellItem, normalizeOrder } from '../utils/normalize';

/**
 * FAST SELL / FAST BUY SERVICES
 * High-speed marketplace features with Supabase backend.
 */

const MOCK_AUTH = false;

/**
 * Adds a new urgent flash deal
 */
export const addFastSellItem = async ({ productName, price, quantity, location, expiryHours }) => {
  // Hybrid Mode: Always use real Supabase for data

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const targetId = user.id;

  const expiryTime = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('fast_sell')
    .insert({
      farmer_id: targetId,
      product_name: productName.trim(),
      price: parseFloat(price),
      quantity: parseFloat(quantity),
      location: location.trim(),
      expiry_time: expiryTime
    })
    .select()
    .single();

  if (error) throw error;
  return normalizeFastSellItem(data);
};

/**
 * Fetches all active fast sell listings (not expired and in stock)
 */
export const getActiveFastSellItems = async () => {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('fast_sell')
    .select(`
      *,
      farmer:profiles!farmer_id(id, name, location, average_rating)
    `)
    .gt('expiry_time', now)
    .gt('quantity', 0)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fast Sell Fetch Error:', error);
    throw error;
  }
  
  const realFastSellItems = (data || []).map(normalizeFastSellItem);
  return realFastSellItems;
};

/**
 * Processes a purchase for a fast sell item
 */
export const purchaseFastSellItem = async ({ fastSellId, quantity, paymentMethod = 'Online', paymentStatus = 'Paid' }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const targetId = user.id;

  // 1. Fetch item details
  const { data: item, error: fetchError } = await supabase
    .from('fast_sell')
    .select('*')
    .eq('id', fastSellId)
    .single();

  if (fetchError) throw fetchError;
  if (!item) throw new Error('Item no longer available');
  if (parseFloat(item.quantity) < parseFloat(quantity)) throw new Error('Insufficient stock available');

  const totalPrice = parseFloat(item.price) * parseFloat(quantity);

  // 2. Create the order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      buyer_id: targetId,
      farmer_id: item.farmer_id,
      fast_sell_id: fastSellId,
      quantity: parseFloat(quantity),
      total_price: totalPrice,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      status: 'Ordered',
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // 3. Update or Delete stock
  const newQty = parseFloat(item.quantity) - parseFloat(quantity);
  if (newQty <= 0) {
    await supabase.from('fast_sell').delete().eq('id', fastSellId);
  } else {
    await supabase.from('fast_sell').update({ quantity: newQty }).eq('id', fastSellId);
  }

  return normalizeOrder(order);
};

/**
 * Real-time subscription for the Fast Sell feed
 */
export const subscribeToFastSell = (callback) => {
  const channel = supabase
    .channel('public:fast_sell')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'fast_sell' },
      callback
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
};
