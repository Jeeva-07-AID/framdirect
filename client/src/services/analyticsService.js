import { supabase } from '../lib/supabaseClient';
import { DEMO_MODE } from './authService';

/**
 * ANALYTICS SERVICE
 * Calculation logic for farmer dashboards and trend visualization.
 */

const MOCK_AUTH = true; // Match authService.js for consistency

/**
 * Calculate and return summarized sales metrics for a farmer.
 * Includes total, today, weekly, and monthly earnings + chart data.
 */
export const getFarmerMetrics = async () => {
  // Hybrid Mode: Always use real Supabase for data

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    if (DEMO_MODE) {
      console.warn("DEMO_MODE: No real user session, returning mock metrics");
      return {
        metrics: { totalEarnings: 12500, todayEarnings: 850, weeklyEarnings: 4200, monthlyEarnings: 12500 },
        chartData: Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(); d.setDate(d.getDate() - (6 - i));
            const key = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            return { _id: key, dailyEarnings: Math.floor(Math.random() * 2000), sales: Math.floor(Math.random() * 10) };
        }),
      };
    }
    throw new Error('Not authenticated');
  }
  const targetId = user.id;

  const { data: orders, error } = await supabase
    .from('orders')
    .select('total_price, created_at')
    .eq('farmer_id', targetId);

  if (error) throw error;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today); monthAgo.setMonth(monthAgo.getMonth() - 1);

  let totalEarnings = 0, todayEarnings = 0, weeklyEarnings = 0, monthlyEarnings = 0;
  const dailyData = {};

  (orders || []).forEach(order => {
    const amount = parseFloat(order.total_price) || 0;
    totalEarnings += amount;
    const orderDate = new Date(order.created_at);

    if (orderDate >= today) todayEarnings += amount;
    if (orderDate >= weekAgo) weeklyEarnings += amount;
    if (orderDate >= monthAgo) monthlyEarnings += amount;

    const dayKey = `${String(orderDate.getMonth() + 1).padStart(2, '0')}-${String(orderDate.getDate()).padStart(2, '0')}`;
    dailyData[dayKey] = (dailyData[dayKey] || 0) + amount;
  });

  const chartData =
    Object.keys(dailyData).length > 0
      ? Object.keys(dailyData).sort().map(key => ({
          _id: key,
          dailyEarnings: dailyData[key],
          sales: Math.floor(dailyData[key] / 50),
        }))
      : // Fallback data for clean demo viz
        Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(); d.setDate(d.getDate() - (6 - i));
            const key = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            return { _id: key, dailyEarnings: 0, sales: 0 };
        });

  return {
    metrics: { totalEarnings, todayEarnings, weeklyEarnings, monthlyEarnings },
    chartData,
  };
};
