import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { MapPin, Clock, Zap, Loader2, ArrowRightLeft, User, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getActiveFastSellItems, subscribeToFastSell, purchaseFastSellItem } from '../../services/fastSellService';
import PaymentModal from '../PaymentModal'; // Simulated Razorpay

const FastBuy = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentModalData, setPaymentModalData] = useState(null); // { item, amount }
  const [sortBy, setSortBy] = useState('expiring'); // expiring, price, nearest

  useEffect(() => {
    fetchItems();
    
    // Realtime subscription
    const unsubscribe = subscribeToFastSell(() => {
       // Refresh list on ANY fast_sell change
       fetchItems();
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const fetchItems = async () => {
    try {
      const data = await getActiveFastSellItems();
      setItems(data);
    } catch (err) {
      console.error('Failed to load fast sell items:', err);
    } finally {
      setLoading(false);
    }
  };

  const sortItems = (items) => {
    return [...items].sort((a, b) => {
      if (sortBy === 'price') return a.pricePerKg - b.pricePerKg;
      if (sortBy === 'nearest') {
         // Simulated nearest logic based on string match with buyer location
         const buyerLoc = user?.location?.toLowerCase() || '';
         const aMatch = a.location?.toLowerCase().includes(buyerLoc) ? 1 : 0;
         const bMatch = b.location?.toLowerCase().includes(buyerLoc) ? 1 : 0;
         return bMatch - aMatch;
      }
      // default: expiring (closest to now)
      return new Date(a.expiryTime) - new Date(b.expiryTime);
    });
  };

  const handleBuyClick = (item) => {
    // For fast sell, we assume purchasing the entire listed quantity
    const totalAmount = item.pricePerKg * item.quantity;
    setPaymentModalData({ item, amount: totalAmount });
  };

  const handlePaymentSuccess = async (method, status) => {
    const { item } = paymentModalData;
    setPaymentModalData(null); // close modal
    setLoading(true);

    try {
       await purchaseFastSellItem({
          fastSellId: item._id,
          quantity: item.quantity,
          paymentMethod: method,
          paymentStatus: status
       });
       alert(t('fast_buy_success', { quantity: item.quantity, product: item.productName }));
       fetchItems(); // refresh list manually in case realtime delays
    } catch (err) {
      alert(t('fast_buy_failed') + err.message);
    } finally {
      setLoading(false);
    }
  };

  const sortedItems = sortItems(items).filter(item => new Date(item.expiryTime) > new Date());

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const cardAnim = { hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      
      {/* Header Banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 border border-amber-500/30 p-6 sm:p-8 rounded-3xl shadow-[0_0_40px_rgba(245,158,11,0.1)] relative overflow-hidden gap-6">
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -ml-20 -mt-20 pointer-events-none"></div>
        
        <div className="z-10 relative">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-amber-500 rounded-xl p-2 text-slate-950 animate-pulse">
               <Zap className="w-6 h-6 fill-slate-950 stroke-slate-950" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">{t('fast_buy_title')} <span className="text-amber-500 font-normal">Live Feed</span></h2>
          </div>
          <p className="text-amber-200/60 text-sm mt-2 max-w-lg font-medium leading-relaxed">{t('fast_buy_live_desc')}</p>
        </div>

        {/* Sorting controls */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-800/80 p-1.5 rounded-2xl relative z-10 border border-slate-700 w-full sm:w-auto">
          <button onClick={() => setSortBy('expiring')} className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${sortBy === 'expiring' ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}>{t('sort_expiring')}</button>
          <button onClick={() => setSortBy('price')} className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${sortBy === 'price' ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}>{t('sort_lowest_price')}</button>
          <button onClick={() => setSortBy('nearest')} className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${sortBy === 'nearest' ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}>{t('sort_nearest')}</button>
        </div>
      </motion.div>

      {/* Main Content */}
      {loading ? (
        <div className="flex justify-center items-center p-20"><Loader2 className="w-10 h-10 animate-spin text-amber-500" /></div>
      ) : sortedItems.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center p-16 sm:p-24 bg-slate-900/30 rounded-3xl border border-slate-800/50 text-center">
            <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
               <Zap className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{t('no_deals_title')}</h3>
            <p className="text-slate-400 max-w-md">{t('no_deals_desc')}</p>
        </motion.div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {sortedItems.map(item => (
              <FastBuyCard key={item._id} item={item} onBuy={handleBuyClick} onExpire={fetchItems} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Payment Gateway Mock */}
      {paymentModalData && (
        <PaymentModal 
           isOpen={true} 
           amount={paymentModalData.amount}
           onClose={() => setPaymentModalData(null)}
           onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

// Extracted Card component to handle individual ticker independently without re-rendering parent
const FastBuyCard = ({ item, onBuy, onExpire }) => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState('');
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const ms = new Date(item.expiryTime) - new Date();
      if (ms <= 0) {
        setTimeLeft('Expired');
        onExpire(); // notify parent to remove
        return;
      }
      
      const hrs = Math.floor(ms / 3600000);
      const mins = Math.floor((ms % 3600000) / 60000);
      const secs = Math.floor((ms % 60000) / 1000);
      
      // If under 30 minutes, go into red alert mode
      if (hrs === 0 && mins < 30) setIsAlert(true);
      else setIsAlert(false);

      setTimeLeft(`${hrs}h ${mins}m ${secs}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [item.expiryTime, onExpire]);

  if (timeLeft === 'Expired') return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      layout
      className={`group bg-slate-900 rounded-3xl overflow-hidden shadow-2xl relative transition-all border ${isAlert ? 'border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 'border-slate-800 hover:border-amber-500/30'}`}
    >
      {/* Top Countdown Banner */}
      <div className={`flex items-center justify-between px-5 py-3 ${isAlert ? 'bg-red-500' : 'bg-slate-800'}`}>
         <div className="flex items-center text-white font-bold tracking-widest uppercase text-xs">
            <Clock className={`w-4 h-4 mr-2 ${isAlert ? 'animate-pulse' : ''}`} />
            {isAlert ? t('ending_soon') : t('time_left_label')}
         </div>
         <div className="flex items-center gap-2">
            {isAlert && (
              <span className="bg-white/20 text-[10px] font-black px-1.5 py-0.5 rounded-md text-white animate-pulse">{t('urgent_sale')}</span>
            )}
            <div className={`font-black tracking-widest text-sm ${isAlert ? 'text-white' : 'text-amber-400'}`}>
               {timeLeft}
            </div>
         </div>
      </div>

      <div className="p-6">
        <h3 className="text-2xl font-black text-white capitalize mb-1 truncate">{item.productName}</h3>
        
        <div className="flex items-center mt-3 mb-6 bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
           {item.farmer?.avatar ? (
              <img src={item.farmer.avatar} alt="Farmer" className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-slate-700" />
           ) : (
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center mr-3 border-2 border-slate-600 text-slate-400">
                <User className="w-5 h-5" />
              </div>
           )}
           <div className="flex-1 truncate">
             <p className="text-slate-300 text-sm font-bold truncate">{item.farmer?.name || t('local_farmer')}</p>
             <p className="text-slate-500 text-xs flex items-center mt-0.5"><MapPin className="w-3 h-3 mr-1" />{item.location}</p>
           </div>
        </div>

        <div className="flex justify-between items-end mb-6">
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{t('price_per_kg_label')}</p>
            <div className="text-3xl font-black text-white">₹{item.pricePerKg}</div>
          </div>
          <div className="text-right">
             <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{t('available_lot')}</p>
             <div className="text-xl font-bold text-amber-400">{item.quantity} kg</div>
          </div>
        </div>

        <button 
          onClick={() => onBuy(item)}
          className={`w-full flex items-center justify-center py-4 rounded-xl font-black tracking-widest uppercase transition-all shadow-xl group-hover:scale-[1.02] ${isAlert ? 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/20' : 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-amber-500/20'}`}
        >
          <Zap className={`w-5 h-5 mr-2 ${isAlert ? 'fill-white stroke-white' : 'fill-slate-900 stroke-slate-900'}`} />
          {t('buy_instantly')}
        </button>
      </div>
    </motion.div>
  );
};

export default FastBuy;
