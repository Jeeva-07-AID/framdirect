import { supabase } from '../lib/supabaseClient';

/**
 * Add a new product to the Farmer Shop
 */

const MOCK_AUTH = false; // Match authService.js for consistency
export const addShopProduct = async (product) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const targetId = user.id;

  const { data, error } = await supabase
    .from('farmer_shop_products')
    .insert([{ 
        ...product, 
        farmer_id: targetId,
        available_quantity: product.total_quantity 
    }])
    .select();

  if (error) throw error;
  return data[0];
};

/**
 * Get all shop products. If farmerId is provided, filters for that farmer.
 */
export const getShopProducts = async (farmerId = null) => {
  // Hybrid Mode: Always use real Supabase for data

  let query = supabase
    .from('farmer_shop_products')
    .select(`
      *,
      farmer:profiles!farmer_id(id, name, location, avatar)
    `)
    .order('created_at', { ascending: false });

  if (farmerId) {
    query = query.eq('farmer_id', farmerId);
  } else {
    // Buyers shouldn't see products with 0 available quantity
    query = query.gt('available_quantity', 0);
  }

  const { data, error } = await query;
  if (error) throw error;
  
  const realShopProducts = data || [];
  return realShopProducts;
};

/**
 * Delete a product from the shop
 */
export const deleteShopProduct = async (id) => {
  const { error } = await supabase
    .from('farmer_shop_products')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

/**
 * Process a partial quantity purchase
 * Updates available_quantity and creates an order record
 */
export const purchaseProduct = async (shopProduct, quantity, buyerId, paymentDetails) => {
  // 1. Validate constraints
  if (quantity <= 0) throw new Error("Quantity must be greater than 0");
  if (quantity > shopProduct.available_quantity) throw new Error("Requested quantity exceeds available stock");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const targetId = user.id;

  const newQuantity = shopProduct.available_quantity - quantity;

  // 2. Update the available quantity in the DB
  const { error: updateError } = await supabase
    .from('farmer_shop_products')
    .update({ available_quantity: newQuantity })
    .eq('id', shopProduct.id);

  if (updateError) throw updateError;

  // 3. Create the order record
  const totalPrice = quantity * shopProduct.price_per_kg;

  const orderData = {
    buyer_id: targetId,
    farmer_id: shopProduct.farmer_id,
    shop_product_id: shopProduct.id, // Linking to the new optional column in orders table
    quantity: quantity,
    total_price: totalPrice,
    status: 'Ordered',
    payment_method: paymentDetails.paymentMethod || 'Online',
    payment_status: paymentDetails.paymentStatus || 'Paid',
    delivery_status: 'pending'
  };

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([orderData])
    .select();

  if (orderError) throw orderError;

  return order[0];
};
