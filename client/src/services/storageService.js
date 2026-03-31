import { supabase } from '../lib/supabaseClient';
import { DEMO_MODE } from './authService';

// ============================================================
// STORAGE FACILITIES SERVICE
// ============================================================

export const getStorageFacilities = async () => {
  let data = [];
  try {
    const { data: realData, error } = await supabase
      .from('storage_facilities')
      .select('*')
      .order('available_capacity', { ascending: false });

    if (error) throw error;
    data = realData || [];
  } catch (err) {
    console.error("Supabase fetch for storage failed", err);
    if (!DEMO_MODE) throw err;
  }
  
  if (DEMO_MODE && data.length < 3) {
    const mockFacilities = [
      { id: 's1', name: 'Punjab Agro Cold Chain', location: 'Amritsar, PB', type: 'cold', capacity: 1000, available_capacity: 450, price_per_day: 120, contact: '9876543210' },
      { id: 's2', name: 'Ratnagiri Fruit Storage', location: 'Ratnagiri, MH', type: 'cold', capacity: 500, available_capacity: 120, price_per_day: 150, contact: '9876543211' },
      { id: 's3', name: 'Mega Grain Silo Hub', location: 'Karnal, HR', type: 'dry', capacity: 5000, available_capacity: 2200, price_per_day: 45, contact: '9876543212' },
      { id: 's4', name: 'Nashik Onion Buffer Node', location: 'Nashik, MH', type: 'dry', capacity: 2000, available_capacity: 80, price_per_day: 35, contact: '9876543213' },
      { id: 's5', name: 'Cryo-Freez Logistics', location: 'Bangalore, KA', type: 'freezer', capacity: 300, available_capacity: 250, price_per_day: 350, contact: '9876543214' }
    ];
    // Avoid name duplicates
    const existingNames = new Set(data.map(f => f.name));
    const uniqueDemo = mockFacilities.filter(f => !existingNames.has(f.name));
    return [...data, ...uniqueDemo];
  }

  return data;
};

export const filterStorage = async (type = '', location = '') => {
  let query = supabase
    .from('storage_facilities')
    .select('*')
    .order('price_per_day', { ascending: true });

  if (type && type !== 'all') {
    query = query.eq('type', type);
  }
  if (location) {
    query = query.ilike('location', `%${location}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

// ============================================================
// END OF SERVICE
// ============================================================
