import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Package, 
  Plus, 
  Trash2, 
  Loader2, 
  Sprout, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { getFarmerPreOrders, addPreOrder, deletePreOrder } from '../../services/preOrderService';

const FarmerFutureHarvest = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [preOrders, setPreOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newHarvest, setNewHarvest] = useState({
    product_name: '',
    expected_quantity: '',
    cultivation_date: '',
    harvest_date: '',
    location: user?.location || ''
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchPreOrders();
    }
  }, [user?.id]);

  const fetchPreOrders = async () => {
    try {
      setLoading(true);
      const data = await getFarmerPreOrders(user.id);
      setPreOrders(data);
    } catch (err) {
      console.error('Failed to fetch pre-orders:', err);
      setError(t('error_fetch_inventory') || 'Failed to load future harvests.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddHarvest = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const data = await addPreOrder({
        ...newHarvest,
        farmer_id: user.id
      });
      setPreOrders([data, ...preOrders]);
      setIsAdding(false);
      setNewHarvest({
        product_name: '',
        expected_quantity: '',
        cultivation_date: '',
        harvest_date: '',
        location: user?.location || ''
      });
    } catch (err) {
      setError(t('error_add_product') || 'Failed to add harvest entry.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('confirm_delete_product') || 'Are you sure you want to remove this harvest entry?')) {
      try {
        await deletePreOrder(id);
        setPreOrders(preOrders.filter(p => p.id !== id));
      } catch (err) {
        setError(t('error_delete_product') || 'Failed to delete entry.');
      }
    }
  };

  const getDaysUntilHarvest = (date) => {
    const today = new Date();
    const harvest = new Date(date);
    const diffTime = harvest - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Sprout className="w-8 h-8 text-emerald-400" />
            {t('future_harvests')}
          </h2>
          <p className="text-slate-400 mt-1">{t('my_shop_subtitle')}</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
        >
          {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isAdding ? t('btn_cancel') : t('add_new_harvest')}
        </button>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5" />
          {error}
        </motion.div>
      )}

      {/* Add Harvest Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form 
              onSubmit={handleAddHarvest}
              className="bg-slate-800/50 border border-slate-700/50 p-8 rounded-3xl backdrop-blur-xl space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 ml-1">{t('product_name')}</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Alphonso Mangoes"
                    value={newHarvest.product_name}
                    onChange={(e) => setNewHarvest({ ...newHarvest, product_name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 ml-1">{t('total_qty_kg')}</label>
                  <input
                    required
                    type="number"
                    placeholder="e.g. 500"
                    value={newHarvest.expected_quantity}
                    onChange={(e) => setNewHarvest({ ...newHarvest, expected_quantity: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 ml-1">{t('location')}</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Trichy"
                    value={newHarvest.location}
                    onChange={(e) => setNewHarvest({ ...newHarvest, location: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 ml-1">{t('cultivation_start')}</label>
                  <input
                    required
                    type="date"
                    value={newHarvest.cultivation_date}
                    onChange={(e) => setNewHarvest({ ...newHarvest, cultivation_date: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 ml-1">{t('harvest_date')}</label>
                  <input
                    required
                    type="date"
                    value={newHarvest.harvest_date}
                    onChange={(e) => setNewHarvest({ ...newHarvest, harvest_date: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95"
                  >
                    {t('add_harvest_entry')}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Harvest List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
          <p className="font-medium">{t('loading')}</p>
        </div>
      ) : preOrders.length === 0 ? (
        <div className="bg-slate-800/30 border-2 border-dashed border-slate-700/50 rounded-3xl p-16 text-center space-y-4">
          <div className="bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sprout className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-white">{t('no_products')}</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            {t('pre_order_subtitle')}
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors"
          >
            {t('add_new_harvest')}
          </button>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {preOrders.map((item) => {
            const daysLeft = getDaysUntilHarvest(item.harvest_date);
            const isNearHarvest = daysLeft <= 7 && daysLeft > 0;
            
            return (
              <motion.div
                key={item.id}
                variants={itemVariants}
                className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-6 group hover:border-emerald-500/30 transition-all backdrop-blur-sm relative overflow-hidden"
              >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -mr-10 -mt-10 group-hover:bg-emerald-500/10 transition-colors" />

                <div className="flex justify-between items-start mb-6">
                  <div className="bg-emerald-500/10 p-3 rounded-2xl">
                    <Sprout className="w-6 h-6 text-emerald-400" />
                  </div>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-slate-500 hover:text-red-400 transition-colors bg-slate-900/50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {item.product_name}
                    </h3>
                    <p className="text-slate-400 flex items-center gap-1 text-sm mt-1">
                      <MapPin className="w-3 h-3" /> {item.location}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-700/50">
                      <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">{t('expected')}</p>
                      <p className="text-white font-bold flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        {item.expected_quantity} <span className="text-xs text-slate-400">kg</span>
                      </p>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-700/50">
                      <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">{t('time_left')}</p>
                      <p className={`font-bold flex items-center gap-2 ${daysLeft > 0 ? 'text-white' : 'text-emerald-400'}`}>
                        <Clock className={`w-4 h-4 ${daysLeft > 0 ? 'text-amber-400' : 'text-emerald-400'}`} />
                        {daysLeft > 0 ? `${daysLeft}d` : t('ready_market')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-slate-700/50 pt-4 mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-bold uppercase tracking-widest">{t('cultivation_date')}</span>
                      <span className="text-slate-300 font-mono">{new Date(item.cultivation_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-bold uppercase tracking-widest">{t('harvest_date')}</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.harvest_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {isNearHarvest && (
                  <div className="mt-6 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-amber-500">{t('near_harvest_msg')}</span>
                  </div>
                )}
                
                {daysLeft <= 0 && (
                  <div className="mt-6 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-emerald-400">{t('ready_market')}</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default FarmerFutureHarvest;
