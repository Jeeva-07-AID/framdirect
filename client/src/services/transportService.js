import { supabase } from '../lib/supabaseClient';
import { DEMO_MODE } from './authService';

/**
 * Fetch available transport routes.
 */
export const getTransportRoutes = async (source = '', destination = '') => {
  let query = supabase
    .from('transport_routes')
    .select('*');

  if (source && destination) {
    // Basic filtering for source/destination
    query = query.ilike('source', `%${source}%`).ilike('destination', `%${destination}%`);
  }

  const { data, error } = await query;

  if (error && !DEMO_MODE) throw error;
  
  if (DEMO_MODE && (!data || data.length === 0)) {
    return [
      { id: 't-demo-1', source: source || 'Hub', destination: destination || 'Market', boarding_point: 'Main Gate', delivery_point: 'Central Sector', departure_time: '18:00', arrival_time: '06:00' },
      { id: 't-demo-2', source: source || 'Hub', destination: destination || 'Market', boarding_point: 'South Depot', delivery_point: 'North Sector', departure_time: '20:00', arrival_time: '08:00' }
    ];
  }

  return data || [];
};

/**
 * Assign a transport route to an order and begin tracking.
 */
export const assignTransportToOrder = async (orderId, transportId, boardingPoint) => {
  if (DEMO_MODE && String(orderId).startsWith('ord-demo-')) {
    console.warn("DEMO_MODE: Bypassing transport assignment for fake order");
    return;
  }

  const { error } = await supabase
    .from('orders')
    .update({
      status: 'Picked Up',
      transport_id: transportId,
      delivery_status: 'picked',
      current_location: boardingPoint + ' (Waiting to depart)'
    })
    .eq('id', orderId);

  if (error) throw error;
  
  simulateRealtimeTracking(orderId);
};

/**
 * Subscribe to real-time tracking updates for a specific order.
 */
export const subscribeOrderTracking = (orderId, callback) => {
  const channel = supabase
    .channel(`order-tracking-${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
};

/**
 * Simulates real-time tracking by updating the order state in Supabase.
 */
export const simulateRealtimeTracking = async (orderId) => {
  const steps = [
    { loc: 'Warehouse - Trichy', status: 'picked', delay: 2000 },
    { loc: 'Highway - 40km remaining', status: 'in_transit', delay: 4000 },
    { loc: 'Entering Thanjavur', status: 'in_transit', delay: 4000 },
    { loc: 'Near Thanjavur Market', status: 'in_transit', delay: 3000 },
    { loc: 'Delivered', status: 'delivered', delay: 3000 },
  ];

  const updateLocation = async (stepInfo) => {
    await supabase
      .from('orders')
      .update({
        delivery_status: stepInfo.status,
        current_location: stepInfo.loc,
        ...(stepInfo.status === 'delivered' ? { status: 'Delivered' } : {})
      })
      .eq('id', orderId);
  };

  let cumulativeDelay = 0;
  for (const step of steps) {
    cumulativeDelay += step.delay;
    setTimeout(() => {
      updateLocation(step).catch(console.error);
    }, cumulativeDelay);
  }
};
