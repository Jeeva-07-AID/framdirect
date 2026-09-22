import React, { useState } from 'react';
import { createReview } from '../../services/reviewService';
import { useTranslation } from 'react-i18next';
import { X, Star, Loader2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { notifyError, notifySuccess } from '../../services/notificationService';

const ReviewModal = ({ order, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createReview({
        farmerId: order.farmer?.id || order.farmer?._id,
        rating,
        comment
      });
      notifySuccess('Review Submitted! ⭐', 'Thank you for rating the producer.');
      onSuccess();
      onClose();
    } catch (err) {
      notifyError('Review Failed', (t('error_submit_review') || 'Error submitting review: ') + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-8 shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
           <div className="w-20 h-20 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary-500/20 shadow-inner">
              <Star className="w-10 h-10 text-primary-500 fill-primary-500/20" />
           </div>
           <h3 className="text-2xl font-bold text-white tracking-tight">{t('btn_rate')}</h3>
           <p className="text-slate-400 text-sm mt-1">Order #{(order.id || order._id || '').slice(-6).toUpperCase()}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="flex justify-center space-x-2 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform active:scale-90 p-1"
                >
                  <Star 
                    className={`w-10 h-10 transition-colors ${
                      (hoveredRating || rating) >= star ? 'text-amber-500 fill-amber-500' : 'text-slate-700'
                    }`} 
                  />
                </button>
              ))}
           </div>

           <div className="relative">
              <MessageSquare className="w-5 h-5 absolute left-4 top-4 text-slate-500" />
              <textarea 
                required
                placeholder={t('review_placeholder')}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-2xl pl-12 pr-4 py-4 min-h-[120px] focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all placeholder-slate-500 text-sm leading-relaxed"
              />
           </div>

           <button 
             type="submit"
             disabled={loading}
             className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-2xl uppercase tracking-widest shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
           >
             {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t('submit_feedback')}
           </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ReviewModal;
