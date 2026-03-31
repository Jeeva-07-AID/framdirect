import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Loader2, X, Mic, MicOff, AlertTriangle, Warehouse, Zap, Package, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFarmerProducts, addProduct, deleteProduct, subscribeToProducts } from '../../services/productService';
import { getSmartPriceSuggestion } from '../../services/marketService';
import { notifySuccess, notifyError, notifyLowStock, notifyAI } from '../../services/notificationService';
import useVoice from '../../hooks/useVoice';
import { getExpiringFastSells } from '../../services/demandService';

const PERISHABLE_CATEGORIES = ['Vegetables', 'Fruits', 'Leafy Greens', 'Leafy'];
const LOW_STOCK_THRESHOLD = 20;

const NEAR_STORAGES = [
  { name: 'Nellore Cold Storage', distance: '12 km', capacity: '85%', temp: '4°C', cost: '₹2/kg/day' },
  { name: 'TNAU Agri Hub Trichy', distance: '18 km', capacity: '60%', temp: '6°C', cost: '₹1.5/kg/day' },
];

const DEMO_PRODUCTS = [
  { name: 'Organic Carrots', category: 'Vegetables', pricePerKg: '45', quantity: '200', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800' },
  { name: 'Golden Wheat', category: 'Grains', pricePerKg: '28', quantity: '1000', image: 'https://images.unsplash.com/photo-1501250936900-d63b97b8096d?auto=format&fit=crop&w=800' },
  { name: 'Fresh Strawberries', category: 'Fruits', pricePerKg: '180', quantity: '50', image: 'https://images.unsplash.com/photo-1464960320293-d7aba55369e0?auto=format&fit=crop&w=800' },
  { name: 'Yellow Onions', category: 'Vegetables', pricePerKg: '32', quantity: '500', image: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=800' },
  { name: 'Red Chili', category: 'Spices', pricePerKg: '120', quantity: '100', image: 'https://images.unsplash.com/photo-1518935406392-49197c11f4cc?auto=format&fit=crop&w=800' },
];

const FarmerProducts = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Vegetables', pricePerKg: '', quantity: '', image: '' });
  const [priceSuggestion, setPriceSuggestion] = useState(null);
  const [storageModal, setStorageModal] = useState(null);
  const [voiceStatus, setVoiceStatus] = useState('');

  const handleVoiceResult = useCallback((parsed, raw) => {
    setVoiceStatus(`Heard: "${raw}"`);
    if (parsed.type === 'add_product') {
      setNewProduct(prev => ({
        ...prev,
        name: parsed.name ? parsed.name.charAt(0).toUpperCase() + parsed.name.slice(1) : prev.name,
        quantity: parsed.quantity?.toString() || prev.quantity,
        pricePerKg: parsed.price?.toString() || prev.pricePerKg,
      }));
      notifyAI('Voice Parsed', `Filled: ${parsed.name} – ${parsed.quantity}kg at ₹${parsed.price}`);
    }
  }, []);

  const { isListening, transcript, error: voiceError, isSupported, startListening, stopListening } = useVoice(handleVoiceResult);

  useEffect(() => {
    fetchProducts();
    const unsubscribe = subscribeToProducts(() => fetchProducts());
    return () => { if (unsubscribe) unsubscribe(); };
  }, [user]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getFarmerProducts();
      setProducts(data || []);
      // Check for low stock items
      (data || []).forEach(p => {
        if (parseFloat(p.quantity) < LOW_STOCK_THRESHOLD && parseFloat(p.quantity) > 0) {
          notifyLowStock('Low Stock Alert', `${p.name} — only ${p.quantity}kg remaining`, { duration: 7000 });
        }
      });
      
      // Check for expiring fast-sell items for storage recommendation
      const expiringItems = await getExpiringFastSells(48); // 48 hours = 2 days
      (expiringItems || []).forEach(item => {
        notifyAI(
          '⚠️ Storage Recommendation', 
          `${item.product_name} is expiring soon (<48 hrs). Consider moving to nearby cold storage.`,
          { duration: 10000, color: 'rose' }
        );
      });
    } catch (err) {
      console.error('Failed to load products:', err);
      notifyError('Load Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch smart price when name changes
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (newProduct.name.length > 3 && newProduct.pricePerKg) {
        const suggestion = await getSmartPriceSuggestion(newProduct.name, parseFloat(newProduct.pricePerKg));
        setPriceSuggestion(suggestion);
      } else {
        setPriceSuggestion(null);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [newProduct.name, newProduct.pricePerKg]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await addProduct({
        name: newProduct.name,
        category: newProduct.category,
        pricePerKg: newProduct.pricePerKg,
        quantity: newProduct.quantity,
        image: newProduct.image,
      });
      setIsModalOpen(false);
      setNewProduct({ name: '', category: 'Vegetables', pricePerKg: '', quantity: '', image: '' });
      setPriceSuggestion(null);
      fetchProducts();
      notifySuccess('Product Added', `${newProduct.name} added to your catalog!`);
    } catch (err) {
      notifyError('Add Failed', err.message);
    }
  };

  const handleFillDemoData = () => {
    const random = DEMO_PRODUCTS[Math.floor(Math.random() * DEMO_PRODUCTS.length)];
    setNewProduct({ ...random });
    notifyAI('Demo Mode', `Form filled with ${random.name}!`);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      await deleteProduct(id);
      fetchProducts();
      notifySuccess('Product Removed', `${name} has been removed.`);
    } catch (err) {
      notifyError('Delete Failed', err.message);
    }
  };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl"
      >
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{t('inventory_title')}</h2>
          <p className="text-slate-400 text-sm mt-1">{products.length} products · Real-time sync active</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/30 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">{t('btn_add_product')}</span>
        </button>
      </motion.div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center p-16"><Loader2 className="w-10 h-10 animate-spin text-emerald-500" /></div>
      ) : products.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-24 bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-800 space-y-4"
        >
          <Package className="w-16 h-16 text-slate-700 mx-auto" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">{t('no_products')}</p>
          <button onClick={() => setIsModalOpen(true)} className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors text-sm">
            + Add your first product
          </button>
        </motion.div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => {
            const isPerishable = PERISHABLE_CATEGORIES.includes(p.category);
            const isLowStock = parseFloat(p.quantity) < LOW_STOCK_THRESHOLD;
            return (
              <motion.div
                variants={item}
                key={p._id}
                className={`bg-slate-900 border rounded-3xl overflow-hidden shadow-xl transition-all group hover:shadow-emerald-900/20 ${
                  isLowStock ? 'border-rose-500/30' : 'border-slate-800 hover:border-emerald-500/30'
                }`}
              >
                <div className="h-44 overflow-hidden relative bg-slate-800">
                  {p.image ? (
                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={p.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700">
                      <Package className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-black text-white uppercase tracking-wider border border-white/10">
                      {p.category}
                    </span>
                    {isLowStock && (
                      <span className="bg-rose-500/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" /> Low
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-white tracking-tight">{p.name}</h3>
                    <div className="bg-emerald-600/20 text-emerald-400 px-3 py-1 rounded-lg font-black text-sm">₹{p.pricePerKg}/kg</div>
                  </div>

                  <div className="bg-slate-800/50 rounded-xl p-3 mb-4 border border-slate-800">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-semibold">Stock</span>
                      <span className={`font-bold ${isLowStock ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>{p.quantity} kg</span>
                    </div>
                  </div>

                  {/* Perishable storage warning */}
                  {isPerishable && (
                    <button
                      onClick={() => setStorageModal(p)}
                      className="w-full flex items-center justify-center gap-2 mb-3 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-xl text-xs font-bold transition-colors border border-amber-500/20"
                    >
                      <Warehouse className="w-3.5 h-3.5" />
                      Find Nearby Storage
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(p._id, p.name)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-sm font-bold transition-colors border border-rose-500/20"
                  >
                    <Trash2 className="w-4 h-4" /> Remove
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Storage Recommendation Modal */}
      <AnimatePresence>
        {storageModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setStorageModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 10 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl p-8 w-full max-w-md"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Warehouse className="w-5 h-5 text-amber-400" />
                    <h3 className="text-xl font-black text-white">Nearby Storage</h3>
                  </div>
                  <p className="text-sm text-slate-400">For: <span className="text-amber-400 font-bold">{storageModal.name}</span></p>
                </div>
                <button onClick={() => setStorageModal(null)} className="p-2 text-slate-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                {NEAR_STORAGES.map((s, i) => (
                  <div key={i} className="bg-slate-800 border border-slate-700 hover:border-amber-500/30 rounded-2xl p-4 transition-all">
                    <p className="font-bold text-white mb-2">{s.name}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <span className="text-slate-400">📍 {s.distance}</span>
                      <span className="text-slate-400">🌡 {s.temp}</span>
                      <span className="text-slate-400">📦 Capacity: {s.capacity}</span>
                      <span className="text-emerald-400 font-bold">{s.cost}</span>
                    </div>
                    <button className="mt-3 w-full py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-xl text-xs font-bold transition-colors border border-amber-500/20">
                      Book Storage
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                   <h3 className="text-2xl font-bold text-white tracking-tight">Add New Product</h3>
                   <button 
                     type="button" 
                     onClick={handleFillDemoData}
                     className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 mt-1 hover:bg-emerald-500/20 transition-all"
                   >
                     ⚡ Demo Fill
                   </button>
                </div>
                <button onClick={() => { setIsModalOpen(false); setPriceSuggestion(null); }} className="p-2 text-slate-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Voice status bar */}
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2"
                >
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-red-400">Listening... say "Add 50 kg tomatoes at 40 rupees"</span>
                </motion.div>
              )}
              {transcript && !isListening && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mb-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl"
                >
                  <p className="text-xs text-cyan-400 font-bold">🎤 "{transcript}"</p>
                </motion.div>
              )}
              {voiceError && <p className="mb-3 text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{voiceError}</p>}

              <form onSubmit={handleCreate} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Product Name
                    {isSupported && <span className="ml-2 text-cyan-500 text-[10px]">🎤 Voice Enabled</span>}
                  </label>
                  <div className="relative">
                    <input
                      required type="text" value={newProduct.name}
                      onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-4 pr-12 py-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all placeholder-slate-500"
                      placeholder="e.g. Fresh Tomatoes"
                    />
                    {isSupported && (
                      <button
                        type="button"
                        onClick={isListening ? stopListening : startListening}
                        className={`absolute right-3 top-2.5 p-1.5 rounded-lg transition-all ${isListening ? 'text-red-400 bg-red-400/10 animate-pulse scale-110' : 'text-slate-500 hover:text-emerald-400 bg-slate-700/50 hover:bg-emerald-500/10'}`}
                      >
                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all cursor-pointer"
                  >
                    {['Vegetables', 'Fruits', 'Grains', 'Pulses', 'Leafy Greens', 'Spices', 'Dairy', 'Other'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Price (₹/Kg)</label>
                    <input
                      required type="number" min="1" value={newProduct.pricePerKg}
                      onChange={e => setNewProduct({ ...newProduct, pricePerKg: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Stock (Kg)</label>
                    <input
                      required type="number" min="1" value={newProduct.quantity}
                      onChange={e => setNewProduct({ ...newProduct, quantity: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Smart Price Suggestion */}
                <AnimatePresence>
                  {priceSuggestion && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">AI Price Suggestion</span>
                      </div>
                      <p className="text-white font-black text-lg">₹{priceSuggestion.suggestedPrice}/kg
                        <span className={`ml-2 text-sm font-bold ${priceSuggestion.trend === 'up' ? 'text-emerald-400' : priceSuggestion.trend === 'down' ? 'text-rose-400' : 'text-blue-400'}`}>
                          ({priceSuggestion.trend === 'up' ? '↑' : priceSuggestion.trend === 'down' ? '↓' : '→'})
                        </span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{priceSuggestion.reason}</p>
                      <button
                        type="button"
                        onClick={() => setNewProduct(prev => ({ ...prev, pricePerKg: priceSuggestion.suggestedPrice.toString() }))}
                        className="mt-2 text-xs font-bold text-emerald-400 underline hover:text-emerald-300 transition-colors"
                      >
                        Apply Suggestion
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Image URL (Optional)</label>
                  <input
                    type="text" value={newProduct.image}
                    onChange={e => setNewProduct({ ...newProduct, image: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all placeholder-slate-500"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/30 active:scale-95"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FarmerProducts;
