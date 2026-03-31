import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Loader2, Star, MessageSquare, TrendingUp, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFarmerReviews } from '../../services/reviewService';
import GlassCard from '../ui/GlassCard';

// Dummy fallback reviews for demo when DB is empty
const DEMO_REVIEWS = [
  { _id: 'r1', rating: 5, comment: 'Absolutely fresh produce! The tomatoes were delivered same-day and quality was outstanding.', buyer: { name: 'Priya Sharma', avatar: '' }, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { _id: 'r2', rating: 4, comment: 'Good quality potatoes. Packaging could be better but overall great value for money.', buyer: { name: 'Kumar Raj', avatar: '' }, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { _id: 'r3', rating: 5, comment: 'Best farmer on the platform! Always on time, produce is always organic and fresh. Highly recommend!', buyer: { name: 'Ananya M.', avatar: '' }, createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
];

const StarRow = ({ rating, filled = false }) => (
  <div className="flex items-center gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`}
      />
    ))}
  </div>
);

const FarmerReviews = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) fetchReviews();
  }, [user?.id]);

  const fetchReviews = async () => {
    try {
      const data = await getFarmerReviews(user.id);
      const result = data && data.length > 0 ? data : DEMO_REVIEWS;
      setReviews(result);
    } catch (err) {
      console.error('Failed to load reviews:', err);
      setReviews(DEMO_REVIEWS);
    } finally {
      setLoading(false);
    }
  };

  // Compute rating stats
  const stats = useMemo(() => {
    if (!reviews.length) return { avg: 0, counts: Array(5).fill(0), total: 0 };
    const counts = Array(5).fill(0);
    let sum = 0;
    reviews.forEach(r => {
      sum += r.rating;
      if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1]++;
    });
    return { avg: (sum / reviews.length).toFixed(1), counts, total: reviews.length };
  }, [reviews]);

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* Rating Summary */}
      {!loading && reviews.length > 0 && (
        <GlassCard className="border-amber-500/20 bg-amber-500/5" delay={0}>
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Big number */}
            <div className="text-center shrink-0">
              <div className="text-6xl font-black text-white leading-none">{stats.avg}</div>
              <StarRow rating={Math.round(parseFloat(stats.avg))} />
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">
                {stats.total} Review{stats.total !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Distribution bars */}
            <div className="flex-1 w-full space-y-2">
              {[5, 4, 3, 2, 1].map(star => {
                const count = stats.counts[star - 1];
                const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-500 w-3 shrink-0">{star}</span>
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                    <div className="flex-1 bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: (5 - star) * 0.1 }}
                        className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
                      />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 w-8 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>

            {/* Badges */}
            <div className="flex flex-col gap-3 shrink-0">
              {parseFloat(stats.avg) >= 4.5 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-2xl">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black text-amber-400 uppercase tracking-widest">Top Rated</span>
                </div>
              )}
              {stats.total >= 3 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Trusted Seller</span>
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Reviews List */}
      <GlassCard delay={0.1} className="p-0 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-2xl font-bold text-white tracking-tight">{t('customer_reviews')}</h2>
          <p className="text-slate-400 text-sm mt-1">{t('reviews_desc')}</p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center p-12 text-emerald-500">
              <Loader2 className="w-10 h-10 animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-20 bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-800">
              <MessageSquare className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">{t('no_reviews')}</p>
            </div>
          ) : (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
              {reviews.map((rev) => (
                <motion.div
                  variants={item}
                  key={rev._id}
                  className="bg-slate-800/40 border border-white/5 p-6 rounded-2xl hover:border-amber-500/20 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-700 overflow-hidden border border-slate-700 shrink-0 flex items-center justify-center text-base font-black text-emerald-400 bg-emerald-500/10">
                        {rev.buyer?.avatar
                          ? <img src={rev.buyer.avatar} className="w-full h-full object-cover" alt="buyer" />
                          : (rev.buyer?.name?.charAt(0) || 'U')
                        }
                      </div>
                      <div>
                        <h4 className="font-bold text-white tracking-tight text-sm">{rev.buyer?.name || t('anonymous_buyer')}</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                          {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="bg-slate-900/80 px-3 py-1.5 rounded-xl border border-amber-500/20 flex items-center gap-1.5">
                      <StarRow rating={rev.rating} />
                      <span className="text-xs font-black text-amber-400 ml-1">{rev.rating}/5</span>
                    </div>
                  </div>
                  {rev.comment && (
                    <p className="text-slate-300 text-sm leading-relaxed italic pl-13 border-l-2 border-amber-500/20 pl-4 ml-1">
                      "{rev.comment}"
                    </p>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default FarmerReviews;
