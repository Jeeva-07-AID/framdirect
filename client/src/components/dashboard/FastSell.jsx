import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Plus, Loader2, X, Mic, MicOff, Zap, MapPin, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { addFastSellItem, getActiveFastSellItems, subscribeToFastSell } from '../../services/fastSellService';
import { notifySuccess, notifyError, notify, NOTIF_TYPES } from '../../services/notificationService';

const USE_FAKE_DATA = true;

// Build dynamic fake products so timers are always valid within next 48h
const getFakeFastSells = () => {
  const now = new Date().getTime();
  return [
    { _id: 'f1', productName: "Flash Deal: Red Tomatoes", pricePerKg: 15, quantity: 100, location: "Trichy", expiryTime: new Date(now + 2 * 3600000).toISOString(), image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400" },
    { _id: 'f2', productName: "Clearance: White Onions", pricePerKg: 30, quantity: 250, location: "Salem", expiryTime: new Date(now + 5 * 3600000 + 1500000).toISOString(), image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8d1?w=400" },
    { _id: 'f3', productName: "Yellow Bananas Bundle", pricePerKg: 12, quantity: 80, location: "Coimbatore", expiryTime: new Date(now + 12 * 3600000).toISOString(), image: "https://images.unsplash.com/photo-1571501679680-de32f1e7aad4?w=400" },
    { _id: 'f4', productName: "Alphonso Mango Box", pricePerKg: 130, quantity: 40, location: "Krishnagiri", expiryTime: new Date(now + 1 * 3600000 + 300000).toISOString(), image: "https://images.unsplash.com/photo-1553279768-865429fd00dc?w=400" },
    { _id: 'f5', productName: "Spicy Green Chilli", pricePerKg: 45, quantity: 60, location: "Guntur", expiryTime: new Date(now + 8 * 3600000).toISOString(), image: "https://images.unsplash.com/photo-1525607317376-79013debd2ac?w=400" },
    { _id: 'f6', productName: "Fresh Ooty Carrots", pricePerKg: 35, quantity: 120, location: "Ooty", expiryTime: new Date(now + 24 * 3600000).toISOString(), image: "https://images.unsplash.com/photo-1590865101275-483624df511a?w=400" }
  ];
};

const FastSell = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().getTime());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().getTime()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  const [newItem, setNewItem] = useState({ 
    productName: '', 
    price: '', 
    quantity: '', 
    expiryHours: '2', 
    location: user?.location || '' 
  });

  useEffect(() => {
    fetchItems();

    // Subscribe to real-time changes
    const unsubscribe = subscribeToFastSell(() => {
      fetchItems();
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await getActiveFastSellItems();
      // Filter for this farmer's items or all if buyer (wait, this is Farmer view)
      const myItems = data.filter(item => 
        item.farmer?.id === user?.id || 
        item.farmer?._id === user?._id ||
        item.farmer_id === user?.id
      );
      setItems(myItems);
    } catch (err) {
      console.error('Failed to load fast sell items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (!newItem.productName || !newItem.price || !newItem.quantity || !newItem.location) {
        notifyError('Missing Fields', 'Please fill all required fields before posting.');
        return;
      }
      await addFastSellItem({
        productName: newItem.productName,
        price: newItem.price,
        quantity: newItem.quantity,
        location: newItem.location,
        expiryHours: parseInt(newItem.expiryHours)
      });
      setIsModalOpen(false);
      setNewItem({ productName: '', price: '', quantity: '', expiryHours: '2', location: user?.location || '' });
      fetchItems();
      notify(NOTIF_TYPES.PRICE_ALERT, 'Flash Deal Live!', `${newItem.productName} listed at ₹${newItem.price}/kg — expires in ${newItem.expiryHours}h`, { duration: 7000 });
    } catch (err) {
      console.error('Error adding fast sell item:', err);
      notifyError('Listing Failed', err.message || 'Could not post flash deal.');
    }
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      notifyError('Voice Input', t('voice_recognition_not_supported') || 'Voice recognition is not supported in this browser.');
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setNewItem(prev => ({ ...prev, productName: transcript }));
    };
    recognition.start();
  };

  // Helper to format remaining time dynamically
  const renderCountdown = (expiryString) => {
    const ms = new Date(expiryString).getTime() - currentTime;
    if (ms <= 0) return <span className="text-red-500 font-black tracking-widest uppercase">{t('expired') || 'EXPIRED'}</span>;
    
    const hrs = Math.floor(ms / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    
    return (
      <div className="flex items-center gap-1.5 font-mono">
        <span className="bg-amber-500/20 text-amber-500 px-2 py-1 rounded-md min-w-[32px] text-center">{hrs.toString().padStart(2, '0')}</span><span className="text-amber-500/50">:</span>
        <span className="bg-amber-500/20 text-amber-500 px-2 py-1 rounded-md min-w-[32px] text-center">{mins.toString().padStart(2, '0')}</span><span className="text-amber-500/50">:</span>
        <span className="bg-amber-500/20 text-amber-500 px-2 py-1 rounded-md min-w-[32px] text-center">{secs.toString().padStart(2, '0')}</span>
      </div>
    );
  };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemAnim = { hidden: { opacity: 0, y: 10, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1 } };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 border border-amber-500/30 p-6 sm:p-8 rounded-3xl shadow-[0_0_30px_rgba(245,158,11,0.1)] relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="z-10 mb-4 sm:mb-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-amber-500/20 p-2 rounded-xl text-amber-400">
               <Zap className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{t('tab_fast_sell')}</h2>
          </div>
          <p className="text-amber-200/60 text-sm mt-1 max-w-md">{t('fast_sell_desc_long')}</p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 py-3.5 rounded-xl font-bold flex items-center transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] z-10"
        >
          <Zap className="w-5 h-5 sm:mr-2 fill-slate-950" /> <span className="hidden sm:inline">{t('add_fast_sell')}</span>
        </button>
      </motion.div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>
      ) : (!USE_FAKE_DATA && items.length === 0) ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-slate-900/40 rounded-3xl border-2 border-dashed border-amber-500/20">
          <Zap className="w-12 h-12 text-amber-500/30 mx-auto mb-4" />
          <p className="text-amber-500/60 font-semibold text-lg">{t('no_active_fast_sells')}</p>
          <p className="text-slate-500 text-sm mt-2">{t('no_fast_sells_desc')}</p>
        </motion.div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(items.length > 0 ? items : getFakeFastSells()).filter(i => new Date(i.expiryTime).getTime() > currentTime).map(item => (
            <motion.div variants={itemAnim} whileHover={{ y: -5, scale: 1.02 }} className="bg-slate-900/60 backdrop-blur-md border border-amber-500/30 rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(245,158,11,0.1)] relative group" key={item._id || item.id}>
              
              {/* Highlight bar urgent glow */}
              <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 shadow-[0_0_15px_rgba(245,158,11,0.8)]"></div>
              
              {item.image && (
                <div className="h-40 w-full overflow-hidden relative">
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10" />
                   <img src={item.image} alt={item.productName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   <div className="absolute top-4 left-4 z-20 flex gap-2">
                      <span className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg flex items-center shadow-lg"><Zap className="w-3 h-3 mr-1" /> Fast Sell</span>
                      <span className="bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-lg flex items-center"><Clock className="w-3 h-3 mr-1" /> Ending Soon</span>
                   </div>
                </div>
              )}

              <div className="p-6 relative z-20 -mt-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-black text-white capitalize tracking-tighter italic drop-shadow-md pr-4">{item.productName}</h3>
                  <div className="bg-amber-500/10 text-amber-400 px-3 py-1.5 rounded-xl text-xl font-black border border-amber-500/30 whitespace-nowrap shadow-inner">
                    ₹{item.pricePerKg || item.price}
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-xs font-bold uppercase tracking-widest text-slate-400 bg-slate-800/80 p-3 rounded-xl border border-slate-700/50">
                    <MapPin className="w-4 h-4 mr-3 text-amber-500/70" />
                    <span className="truncate">{item.location}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-400 bg-slate-800/80 p-3 rounded-xl border border-slate-700/50">
                    <span>{t('stock_available') || 'Stock Cap'}</span>
                    <span className="text-emerald-400 font-black text-sm">{item.quantity} kg</span>
                  </div>
                </div>

                <div className="w-full flex flex-col items-center justify-center p-4 bg-slate-950 border border-amber-500/20 rounded-2xl relative overflow-hidden group-hover:border-amber-500/50 transition-colors">
                  <div className="absolute inset-0 bg-amber-500/5 pulse-bg pointer-events-none" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">{t('time_remaining') || 'Auction Ends In'}</span>
                  {renderCountdown(item.expiryTime)}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      )}

      {/* Add Fast Sell Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-slate-900 border border-amber-500/30 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.15)] p-8 w-full max-w-md relative overflow-hidden">
              
              {/* Modal Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

              <div className="flex justify-between items-center mb-6 relative z-10">
                <div className="flex items-center gap-2">
                  <Zap className="w-6 h-6 text-amber-500" />
                  <h3 className="text-2xl font-bold text-white tracking-tight">{t('new_fast_sell')}</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-500 hover:text-white bg-slate-800 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreate} className="space-y-5 relative z-10">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1.5 uppercase tracking-wider">{t('product_name')}</label>
                  <div className="relative">
                    <input required type="text" value={newItem.productName} onChange={e => setNewItem({ ...newItem, productName: e.target.value })} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-4 pr-12 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder-slate-500" placeholder={t('fast_sell_product_placeholder')} />
                    <button type="button" onClick={startVoiceInput} className={`absolute right-3 top-2.5 p-1.5 rounded-lg transition-colors ${isListening ? 'text-white bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'text-amber-500 hover:text-white bg-amber-500/10 hover:bg-amber-500/30'}`}>
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-1.5 uppercase tracking-wider">{t('price_per_kg_rupee')}</label>
                    <input required type="number" min="1" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder-slate-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-1.5 uppercase tracking-wider">{t('quantity_kg_label')}</label>
                    <input required type="number" min="1" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: e.target.value })} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder-slate-500" />
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-bold text-slate-400 mb-1.5 uppercase tracking-wider">{t('expires_in')}</label>
                   <select value={newItem.expiryHours} onChange={e => setNewItem({ ...newItem, expiryHours: e.target.value })} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none transition-all appearance-none cursor-pointer">
                     <option value="1">{t('1_hour')}</option>
                     <option value="2">{t('2_hours')}</option>
                     <option value="6">{t('6_hours')}</option>
                     <option value="12">{t('12_hours')}</option>
                     <option value="24">{t('24_hours')}</option>
                   </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1.5 uppercase tracking-wider">{t('pickup_location')}</label>
                  <input required type="text" value={newItem.location} onChange={e => setNewItem({ ...newItem, location: e.target.value })} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder-slate-500" placeholder={t('farm_address_placeholder')} />
                </div>
                
                <div className="pt-4">
                  <button type="submit" className="w-full py-4 bg-amber-500 text-slate-950 rounded-xl font-bold uppercase tracking-widest hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]">{t('post_live_deal')}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FastSell;
