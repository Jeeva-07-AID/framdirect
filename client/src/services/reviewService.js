import { supabase } from '../lib/supabaseClient';
import { normalizeReview } from '../utils/normalize';

/**
 * REVIEW SERVICE
 * Handles fetching farmer reviews and buyer feedback submissions.
 */

const MOCK_AUTH = false;

/**
 * Fetch reviews for a specific farmer with buyer profiles
 */
export const getFarmerReviews = async (farmerId) => {
  // Hybrid Mode: Always use real Supabase for data

  const { data, error } = await supabase
    .from('reviews')
    .select(`*, buyer:profiles!buyer_id(id, name, avatar)`)
    .eq('farmer_id', farmerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(normalizeReview);
};

/**
 * Buyer submitting a review for a farmer
 */
export const createReview = async ({ farmerId, rating, comment }) => {
  // Hybrid Mode: Always use real Supabase for data

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const targetId = user.id;

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      buyer_id: targetId,
      farmer_id: farmerId,
      rating: parseInt(rating),
      comment: comment || '',
    })
    .select()
    .single();

  if (error) throw error;
  return normalizeReview(data);
};
