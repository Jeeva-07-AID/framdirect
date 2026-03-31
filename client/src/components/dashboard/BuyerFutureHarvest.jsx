import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Sprout, 
  Loader2, 
  Clock, 
  Search,
  User,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { getPreOrders } from '../../services/preOrderService';

const BuyerFutureHarvest = () => {
  const [preOrders, setPreOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, near

  useEffect(() => {
    fetchPreOrders();
  }, []);

  const fetchPreOrders = async () => {
    try {
      setLoading(true);
      const data = await getPreOrders();
      setPreOrders(data);
    } catch (err) {
      console.error('Failed to fetch pre-orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = preOrders.filter(order => {
    const matchesSearch = order.product_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'near') {
      const daysLeft = Math.ceil((new Date(order.harvest_date) - new Date()) / (1000 * 60 * 60 * 24));
      return matchesSearch && daysLeft <= 14;
    }
    return matchesSearch;
  });

  const getDaysUntilHarvest = (date) => {
    const today = new Date();
    const harvest = new Date(date);
    const diffTime = harvest - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-900/40 p-6 rounded-3xl border border-slate-800/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
            <Sprout className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Pre Ordering</h2>
            <p className="text-slate-400 text-sm mt-1">See what's growing now and plan your future stock.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Search crops or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${filter === 'all' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-500 hover:text-white'}`}
            >
              All Crops
            </button>
            <button 
              onClick={() => setFilter('near')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${filter === 'near' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-500 hover:text-white'}`}
            >
              Near Harvest
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
          <p className="text-slate-400 font-medium">Scanning the fields for upcoming harvests...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <Search className="w-16 h-16 text-slate-800 mx-auto" />
          <h3 className="text-xl font-bold text-slate-300">No matching harvests found</h3>
          <p className="text-slate-500">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.map((item, idx) => {
            const daysLeft = getDaysUntilHarvest(item.harvest_date);
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-slate-900/50 border border-slate-800/50 rounded-3xl p-6 hover:border-emerald-500/30 transition-all group relative overflow-hidden flex flex-col h-full"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex justify-between items-start mb-6">
                  <div className="bg-emerald-500/10 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                    <Sprout className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${daysLeft <= 14 ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                    {daysLeft > 0 ? `${daysLeft} Days to Harvest` : 'Harvesting Now'}
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {item.product_name}
                    </h3>
                    <div className="flex items-center gap-4 mt-2">
                       <p className="text-slate-400 flex items-center gap-1.5 text-xs font-semibold">
                        <MapPin className="w-3.5 h-3.5" /> {item.location}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-950/50 border border-slate-800/50 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">Expected Supply</p>
                      <p className="text-xl font-black text-white">{item.expected_quantity} <span className="text-xs text-slate-400 uppercase">kg</span></p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800">
                      <TrendingUp className="w-6 h-6 text-emerald-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-black tracking-widest text-slate-600 italic">Target Date</p>
                      <p className="text-white font-bold flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-emerald-400" />
                        {new Date(item.harvest_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-black tracking-widest text-slate-600 italic">Farmer</p>
                      <div className="flex items-center gap-2">
                         <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
                            {item.farmer?.avatar ? <img src={item.farmer.avatar} className="w-full h-full object-cover" /> : <User className="w-3 h-3 text-slate-500" />}
                         </div>
                         <p className="text-slate-300 font-bold text-sm truncate">{item.farmer?.name || 'Local Farmer'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-800/60 flex items-center gap-3">
                  <button className="flex-1 bg-emerald-600/10 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white text-emerald-400 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group/btn">
                    Express Interest
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                  <button className="p-3 bg-slate-950 border border-slate-800 text-slate-500 hover:text-white hover:border-slate-700 rounded-xl transition-all">
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const TrendingUp = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

export default BuyerFutureHarvest;
