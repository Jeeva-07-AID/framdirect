import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, MapPin, Star, Users, TrendingUp, Zap, Brain, ArrowUpRight, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getNearbyFarmers } from '../../services/productService';
import { getTrendingCrops, getCropSuggestions } from '../../services/marketService';
import GlassCard from '../ui/GlassCard';

const DEMAND_BADGE = {
  Peak:      'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Very High': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  High:      'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Medium:    'bg-slate-500/20 text-slate-400 border-slate-500/30',
  Stable:    'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const BuyerRecommendations = () => {
  const { t } = useTranslation();
  const [farmers, setFarmers] = useState([]);
  const [trendingCrops, setTrendingCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('farmers');

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [farmersData, crops] = await Promise.all([
          getNearbyFarmers(),
          getTrendingCrops(),
        ]);
        setFarmers(farmersData || []);
        setTrendingCrops(crops.slice(0, 6));
      } catch (err) {
        console.error('Failed to load recommendations:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
      <p className="text-slate-500 font-black text-xs uppercase tracking-widest animate-pulse">Loading Market Intelligence...</p>
    </div>
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">

      {/* Header + Toggle */}
      <GlassCard className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6" delay={0}>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">{t('recommended_farmers')}</h2>
          <p className="text-slate-400 text-sm mt-1">{t('active_farmers')}</p>
        </div>
        <div className="flex gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-white/5">
          {[
            { id: 'farmers', label: 'Farmers', icon: Users },
            { id: 'market',  label: 'Market Intel', icon: Brain },
          ].map(sec => {
            const Icon = sec.icon;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeSection === sec.id
                    ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-900/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {sec.label}
              </button>
            );
          })}
        </div>
      </GlassCard>

      <AnimatePresence mode="wait">
        {activeSection === 'farmers' ? (
          /* --- Farmer Directory --- */
          farmers.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-slate-900 border border-slate-800 rounded-3xl">
              <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 font-semibold">No verified farmers found yet.</p>
            </motion.div>
          ) : (
            <motion.div key="farmers" variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {farmers.map((farmer, idx) => (
                <motion.div
                  variants={item}
                  key={farmer._id || idx}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex items-start gap-5 hover:border-emerald-500/30 transition-all cursor-pointer shadow-xl group"
                >
                  {/* Avatar */}
                  <div className="relative w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0">
                    {farmer.avatar ? (
                      <img src={farmer.avatar} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={farmer.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-black text-emerald-500 bg-emerald-600/10">
                        {farmer.name ? farmer.name.charAt(0).toUpperCase() : 'F'}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-tl-lg">
                      PRO
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-white tracking-tight truncate pr-2 group-hover:text-emerald-400 transition-colors">
                        {farmer.name || 'Anonymous Farmer'}
                      </h3>
                      <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-500/20 shrink-0">
                        <Star className="w-3 h-3 text-amber-400 fill-current" />
                        <span className="text-xs font-black text-amber-400">{(farmer.averageRating || 5.0).toFixed(1)}</span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-400 flex items-center mb-4">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-500 shrink-0" />
                      {farmer.location || 'Location not specified'}
                    </p>

                    {/* Rating bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-800/50 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(((farmer.averageRating || 5) / 5) * 100, 100)}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                        />
                      </div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {Math.round(((farmer.averageRating || 5) / 5) * 100)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )
        ) : (
          /* --- AI Market Intelligence --- */
          <motion.div key="market" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Trending Now banner */}
            <GlassCard className="border-amber-500/20 bg-amber-500/5 relative overflow-hidden" delay={0.1}>
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-amber-500/20 rounded-xl border border-amber-500/30">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">Trending in Market</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Seasonal demand + real-time orders</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                  <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Live</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingCrops.map((crop, i) => {
                  const badge = DEMAND_BADGE[crop.demand] || DEMAND_BADGE.Stable;
                  return (
                    <motion.div
                      key={crop.name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.07 }}
                      className="bg-slate-900/70 border border-white/5 hover:border-amber-500/20 rounded-2xl p-5 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-3xl">{crop.icon}</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border ${badge}`}>
                          {crop.demand}
                        </span>
                      </div>
                      <p className="font-black text-white text-sm group-hover:text-amber-400 transition-colors">{crop.name}</p>
                      <p className="text-[10px] text-slate-500 mt-1 mb-3 leading-relaxed">{crop.reason}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-emerald-400">×{crop.priceIndex} price index</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </GlassCard>

            {/* AI Buyer Tip */}
            <GlassCard className="border-cyan-500/20 bg-cyan-500/5" delay={0.2}>
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-black text-white uppercase tracking-tight">Buyer AI Tip</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: '💡', tip: 'Pre-order mangoes now before the seasonal peak doubles the price next month.' },
                  { icon: '⚡', tip: 'Flash Deals on tomatoes are 30% cheaper than catalog prices on average.' },
                  { icon: '📦', tip: 'Bulk-buy during harvest season (Oct–Dec) for maximum savings on grains.' },
                ].map((t, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-slate-900/70 border border-white/5 rounded-2xl p-4"
                  >
                    <span className="text-2xl block mb-2">{t.icon}</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{t.tip}</p>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BuyerRecommendations;
