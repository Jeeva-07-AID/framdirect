import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Plus, MapPin, Calendar, Trash2, Loader2, AlertCircle, ShoppingBag, Pickaxe, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { addShopProduct, getShopProducts, deleteShopProduct } from '../../services/shopService';
import { supabase } from '../../lib/supabaseClient';

import { DEMO_MODE } from '../../services/authService';

const USE_FAKE_DATA = DEMO_MODE;

const fakeProducts = [
  { id: 'f1', product_name: "Fresh Tomatoes", total_quantity: 200, available_quantity: 150, price_per_kg: 20, expiry_date: "2026-04-05", location: "Trichy", product_image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400" },
  { id: 'f2', product_name: "Organic Potatoes", total_quantity: 500, available_quantity: 45, price_per_kg: 32, expiry_date: "2026-05-10", location: "Madurai", product_image: "https://images.unsplash.com/photo-1518977676601-b53f02bad675?w=400" },
  { id: 'f3', product_name: "Red Onions", total_quantity: 800, available_quantity: 750, price_per_kg: 45, expiry_date: "2026-06-20", location: "Salem", product_image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8d1?w=400" },
  { id: 'f4', product_name: "Yellow Bananas", total_quantity: 300, available_quantity: 10, price_per_kg: 15, expiry_date: "2026-04-02", location: "Coimbatore", product_image: "https://images.unsplash.com/photo-1571501679680-de32f1e7aad4?w=400" },
  { id: 'f5', product_name: "Alphonso Mango", total_quantity: 120, available_quantity: 120, price_per_kg: 150, expiry_date: "2026-05-25", location: "Krishnagiri", product_image: "https://images.unsplash.com/photo-1553279768-865429fd00dc?w=400" },
  { id: 'f6', product_name: "Ooty Carrots", total_quantity: 250, available_quantity: 200, price_per_kg: 40, expiry_date: "2026-04-15", location: "Ooty", product_image: "https://images.unsplash.com/photo-1590865101275-483624df511a?w=400" },
  { id: 'f7', product_name: "Green Cabbage", total_quantity: 150, available_quantity: 30, price_per_kg: 25, expiry_date: "2026-04-08", location: "Dindigul", product_image: "https://images.unsplash.com/photo-1532454522928-8547248ddb80?w=400" },
  { id: 'f8', product_name: "Spicy Chilli", total_quantity: 100, available_quantity: 90, price_per_kg: 60, expiry_date: "2026-07-01", location: "Guntur", product_image: "https://images.unsplash.com/photo-1525607317376-79013debd2ac?w=400" }
];

const FarmerShop = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [products, setProducts] = useState(USE_FAKE_DATA ? fakeProducts : []);
  const [loading, setLoading] = useState(!USE_FAKE_DATA);
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState({
    product_name: '',
    total_quantity: '',
    price_per_kg: '',
    expiry_date: '',
    product_image: '',
    location: user?.location || ''
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (USE_FAKE_DATA) return; // skip Supabase in demo mode
    if (user?.id) {
      fetchProducts();
      const channel = supabase
        .channel('farmer-shop-updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'farmer_shop_products', filter: `farmer_id=eq.${user.id}` },
          (payload) => {
            if (payload.eventType === 'INSERT') setProducts(prev => [payload.new, ...prev]);
            else if (payload.eventType === 'UPDATE') setProducts(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
            else if (payload.eventType === 'DELETE') setProducts(prev => prev.filter(p => p.id !== payload.old.id));
          }
        )
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [user?.id]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getShopProducts(user.id);
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch shop products:', err);
      setError(t('error_fetch_inventory') || 'Failed to load your shop inventory.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      if (USE_FAKE_DATA) {
        // Demo Mode: add locally
        const demoItem = {
          id: 'demo-' + Date.now(),
          ...newProduct,
          total_quantity: parseFloat(newProduct.total_quantity),
          available_quantity: parseFloat(newProduct.total_quantity),
          price_per_kg: parseFloat(newProduct.price_per_kg),
          farmer_id: 'demo-farmer',
        };
        setProducts(prev => [demoItem, ...prev]);
      } else {
        await addShopProduct({ ...newProduct, farmer_id: user.id });
        // real-time subscription handles the update
      }
      setIsAdding(false);
      setNewProduct({ product_name: '', total_quantity: '', price_per_kg: '', expiry_date: '', product_image: '', location: user?.location || '' });
    } catch (err) {
      console.error(err);
      setError(t('error_add_product') || 'Failed to add product.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('confirm_delete_product') || 'Remove this product?')) {
      try {
        if (USE_FAKE_DATA) {
          setProducts(prev => prev.filter(p => p.id !== id));
        } else {
          await deleteShopProduct(id);
          // real-time handles the list update
        }
      } catch (err) {
        setError(t('error_delete_product') || 'Failed to delete product.');
      }
    }
  };

  const handleFillDemo = () => {
    const sample = fakeProducts[Math.floor(Math.random() * fakeProducts.length)];
    const nextYear = new Date();
    nextYear.setMonth(nextYear.getMonth() + 3);
    setNewProduct({
      product_name: sample.product_name,
      total_quantity: String(sample.total_quantity),
      price_per_kg: String(sample.price_per_kg),
      expiry_date: nextYear.toISOString().split('T')[0],
      product_image: sample.product_image,
      location: sample.location,
    });
    setIsAdding(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-6 rounded-3xl border border-slate-800/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
            <Store className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">{t('my_shop_title')}</h2>
            <p className="text-slate-400 text-sm mt-1">{t('my_shop_subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {USE_FAKE_DATA && (
            <button
              onClick={handleFillDemo}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-2xl font-bold transition-all border border-emerald-500/20 active:scale-95 text-sm"
            >
              ⚡ Demo Fill
            </button>
          )}
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
          >
            {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {isAdding ? t('btn_cancel') : t('add_new_product')}
          </button>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-center gap-3 shadow-lg shadow-red-900/10"
        >
          <AlertCircle className="w-5 h-5" />
          {error}
        </motion.div>
      )}

      {/* Add Product Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form 
              onSubmit={handleAddProduct}
              className="bg-slate-800/50 border border-slate-700/50 p-8 rounded-3xl backdrop-blur-xl space-y-6"
            >
              {USE_FAKE_DATA && (
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Fill in product details</p>
                  <button
                    type="button"
                    onClick={handleFillDemo}
                    className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                  >
                    ⚡ Demo Fill
                  </button>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 ml-1">{t('product_name')}</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Organic Tomatoes"
                    value={newProduct.product_name}
                    onChange={(e) => setNewProduct({ ...newProduct, product_name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 ml-1">{t('total_qty_kg') || 'Total Quantity (kg)'}</label>
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="e.g. 500"
                    value={newProduct.total_quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, total_quantity: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 ml-1">{t('price_per_kg_rupee') || 'Price Per Kg (₹)'}</label>
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="e.g. 40"
                    value={newProduct.price_per_kg}
                    onChange={(e) => setNewProduct({ ...newProduct, price_per_kg: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 ml-1">{t('location')}</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Trichy"
                    value={newProduct.location}
                    onChange={(e) => setNewProduct({ ...newProduct, location: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 ml-1">{t('expiry_date')}</label>
                  <input
                    required
                    type="date"
                    value={newProduct.expiry_date}
                    onChange={(e) => setNewProduct({ ...newProduct, expiry_date: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 ml-1">{t('product_image_url') || 'Product Image URL'}</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com..."
                    value={newProduct.product_image}
                    onChange={(e) => setNewProduct({ ...newProduct, product_image: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    {t('btn_add_product')}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inventory List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
          <p className="font-medium">{t('loading')}</p>
        </div>
      ) : (!USE_FAKE_DATA && products.length === 0) ? (
        <div className="bg-slate-800/30 border-2 border-dashed border-slate-700/50 rounded-3xl p-16 text-center space-y-4">
          <div className="bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-white">{t('no_products')}</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            {t('inventory_desc')}
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors"
          >
            {t('add_new_product')}
          </button>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {products.map((item) => {
            const percentageLeft = (item.available_quantity / item.total_quantity) * 100;
            const isLowStock = percentageLeft <= 20;

            return (
              <motion.div
                key={item.id}
                variants={itemVariants}
                className="bg-slate-900/60 border border-slate-700/50 rounded-3xl p-6 hover:border-emerald-500/40 transition-all backdrop-blur-md relative overflow-hidden group"
              >
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -mr-10 -mt-10 group-hover:bg-emerald-500/10 transition-colors" />

                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="flex items-center gap-4">
                    {item.product_image ? (
                      <img src={item.product_image} className="w-16 h-16 rounded-2xl object-cover border border-slate-700 shadow-lg group-hover:scale-110 transition-transform duration-500" alt={item.product_name} />
                    ) : (
                      <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl group-hover:scale-110 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/30 transition-all shadow-lg">
                        <Pickaxe className="w-8 h-8 text-emerald-400" />
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors bg-slate-900/50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative z-10">
                  <h3 className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors uppercase italic tracking-tight">
                    {item.product_name}
                  </h3>
                  <p className="text-slate-400 flex items-center gap-1.5 text-xs font-medium mt-2 mb-6">
                    <MapPin className="w-3.5 h-3.5" /> {item.location}
                  </p>
                  
                  <div className="space-y-4">
                     <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800/80">
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('retail_rate')}</p>
                           <p className="text-2xl font-black text-white mt-0.5">₹{item.price_per_kg} <span className="text-xs text-slate-500 font-medium">/kg</span></p>
                        </div>
                        <div className="flex flex-col items-end">
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('expiry_date')}</p>
                           <p className="text-sm font-bold text-slate-300 mt-1 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-emerald-500/70" />
                              {new Date(item.expiry_date).toLocaleDateString('en-GB')}
                           </p>
                        </div>
                     </div>

                     {/* Custom Progress Bar for Stock */}
                     <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                        <div className="flex justify-between items-center mb-3">
                           <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${isLowStock ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                              {isLowStock ? t('low_stock') : 'In Stock'}
                           </span>
                           <span className="text-[10px] font-bold text-slate-500 uppercase">
                              {item.available_quantity} / {item.total_quantity} kg
                           </span>
                        </div>
                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
                           <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.max(0, percentageLeft)}%` }}
                              className={`h-full rounded-full ${isLowStock ? 'bg-amber-500 shadow-[0_0_10px_var(--tw-shadow-color)] shadow-amber-500/50' : 'bg-emerald-500 shadow-[0_0_10px_var(--tw-shadow-color)] shadow-emerald-500/50'}`}
                           />
                        </div>
                        {isLowStock && item.available_quantity > 0 && (
                          <p className="text-xs text-amber-500 mt-2 font-bold flex items-center gap-1">
                             <AlertCircle className="w-3 h-3" /> {t('low_stock')}
                          </p>
                        )}
                        {item.available_quantity <= 0 && (
                          <p className="text-xs text-red-400 mt-2 font-bold flex items-center gap-1">
                             <AlertCircle className="w-3 h-3" /> {t('out_of_stock')}
                          </p>
                        )}
                     </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default FarmerShop;
