import { supabase } from '../lib/supabaseClient';
import { DEMO_MODE } from './authService';
import { normalizeProduct, normalizeProfile } from '../utils/normalize';

/**
 * PRODUCT SERVICE
 * Handles general product catalog and farmer profiles for discovery.
 */

const MOCK_AUTH = false; // Match authService.js for consistency

// Persistent mock data for Demo Mode
let demoProducts = [
  { 
    id: 'p1', 
    name: 'Premium Basmati Rice', 
    category: 'Grains', 
    price_per_kg: 85, 
    quantity: 450, 
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800',
    farmer: { name: 'Punjab Heritage Farms', average_rating: 4.9, location: 'Amritsar, Punjab' }
  },
  { 
    id: 'p2', 
    name: 'Organic Red Tomatoes', 
    category: 'Vegetables', 
    price_per_kg: 40, 
    quantity: 120, 
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800',
    farmer: { name: 'Sunny Valley Organics', average_rating: 4.7, location: 'Nashik, Maharashtra' }
  },
  { 
    id: 'p3', 
    name: 'Fresh Alphonso Mangoes', 
    category: 'Fruits', 
    price_per_kg: 150, 
    quantity: 85, 
    image: 'https://images.unsplash.com/photo-1553334866-91b96c2193bd?auto=format&fit=crop&q=80&w=800',
    farmer: { name: 'Konkan Gold Orchards', average_rating: 5.0, location: 'Ratnagiri, Maharashtra' }
  },
  { 
    id: 'p4', 
    name: 'Pure Forest Honey', 
    category: 'Spices', 
    price_per_kg: 450, 
    quantity: 30, 
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800',
    farmer: { name: 'Nilgiri Tribal Coop', average_rating: 4.8, location: 'Ooty, Tamil Nadu' }
  },
  { 
    id: 'p5', 
    name: 'Kashmiri Saffron (Grade A)', 
    category: 'Spices', 
    price_per_kg: 2500, 
    quantity: 5, 
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?auto=format&fit=crop&q=80&w=800',
    farmer: { name: 'Himalayan Bloom', average_rating: 4.9, location: 'Pampore, J&K' }
  },
  { 
    id: 'p6', 
    name: 'Organic Cold Pressed Coconut Oil', 
    category: 'Oil', 
    price_per_kg: 280, 
    quantity: 200, 
    image: 'https://images.unsplash.com/photo-1620984850380-43406f850239?auto=format&fit=crop&q=80&w=800',
    farmer: { name: 'Kerala Greens', average_rating: 4.6, location: 'Alleppey, Kerala' }
  },
];

/**
 * Fetch all available products with search filtering
 */
export const getAllProducts = async (search = '') => {
  // Hybrid Mode: Always try real Supabase first
  let data = [];
  try {
    let query = supabase
      .from('products')
      .select(`
        *, 
        farmer:profiles!farmer_id(id, name, location, avatar, average_rating)
      `)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data: realData, error } = await query;
    if (error) throw error;
    data = realData || [];
  } catch (err) {
    console.error("Supabase fetch failed, falling back to demo data if enabled", err);
    if (!DEMO_MODE) throw err;
  }
  
  let realProducts = data.map(normalizeProduct);

  if (DEMO_MODE) {
    // Inject and filter demo products
    let filteredDemo = demoProducts;
    if (search) {
      filteredDemo = demoProducts.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.category.toLowerCase().includes(search.toLowerCase())
      );
    }
    const normalizedDemo = filteredDemo.map(normalizeProduct);
    
    // Merge: Real products first, then demo products (excluding ones that might have same ID)
    const existingIds = new Set(realProducts.map(p => p.id));
    const uniqueDemo = normalizedDemo.filter(p => !existingIds.has(p.id));
    
    return [...realProducts, ...uniqueDemo];
  }

  return realProducts;
};

/**
 * Fetch products belonging to a specific farmer
 */
export const getFarmerProducts = async () => {
  // Hybrid Mode: Always use real Supabase for data

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    if (DEMO_MODE) {
      console.warn("DEMO_MODE: Returning persistent mock products");
      return demoProducts.map(normalizeProduct);
    }
    throw new Error('Not authenticated');
  }
  const targetId = user.id;

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('farmer_id', targetId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(normalizeProduct);
};

/**
 * Farmer adding a new product to their catalog
 */
export const addProduct = async ({ name, category, pricePerKg, quantity, image = '' }) => {
  // Hybrid Mode: Always use real Supabase for data

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    if (DEMO_MODE) {
      console.warn("DEMO_MODE: Adding to persistent mock stack");
      const newP = { id: Math.random().toString(), name, category, price_per_kg: pricePerKg, quantity, image };
      demoProducts = [newP, ...demoProducts];
      return normalizeProduct(newP);
    }
    throw new Error('Not authenticated');
  }
  const targetId = user.id;

  const { data, error } = await supabase
    .from('products')
    .insert({
      farmer_id: targetId,
      name: name.trim(),
      category,
      price_per_kg: parseFloat(pricePerKg),
      quantity: parseFloat(quantity),
      image: image || '',
    })
    .select()
    .single();

  if (error) throw error;
  return normalizeProduct(data);
};

/**
 * Deleting a product from catalog
 */
export const deleteProduct = async (id) => {
  if (DEMO_MODE) {
    console.warn("DEMO_MODE: Removing from persistent mock stack");
    demoProducts = demoProducts.filter(p => p.id !== id);
    return;
  }
  // Hybrid Mode: Always use real Supabase for data
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
};

/**
 * Fetch nearby/top farmers for recommendations
 */
export const getNearbyFarmers = async () => {
  let data = [];
  try {
    const { data: realData, error } = await supabase
      .from('profiles')
      .select('id, name, location, avatar, average_rating')
      .eq('role', 'Farmer')
      .limit(8);

    if (error) throw error;
    data = realData || [];
  } catch (err) {
    console.error("Supabase farmers fetch failed", err);
    if (!DEMO_MODE) throw err;
  }
  
  let realFarmers = data.map(f => ({ ...normalizeProfile(f), _id: f.id, averageRating: f.average_rating || 5.0 }));

  if (DEMO_MODE && realFarmers.length < 3) {
    const demoFarmers = [
      { id: 'f1', name: 'Punjab Heritage Farms', location: 'Amritsar, Punjab', averageRating: 4.9, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200' },
      { id: 'f2', name: 'Sunny Valley Organics', location: 'Nashik, Maharashtra', averageRating: 4.7, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200' },
      { id: 'f3', name: 'Konkan Gold Orchards', location: 'Ratnagiri, Maharashtra', averageRating: 5.0, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' }
    ];
    // Avoid duplicates
    const existingNames = new Set(realFarmers.map(f => f.name));
    const uniqueDemo = demoFarmers.filter(f => !existingNames.has(f.name));
    return [...realFarmers, ...uniqueDemo];
  }

  return realFarmers;
};

/**
 * Uploads a product image to Supabase Storage
 */
export const uploadProductImage = async (file) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('products')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('products')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

/**
 * Real-time subscription for products table
 */
export const subscribeToProducts = (callback) => {
  const channel = supabase
    .channel('public:products')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'products' },
      callback
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
};
