import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Loader2, Search, Filter, ShoppingBag, Star, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MockRazorpay from './MockRazorpay';
import { getAllProducts } from '../../services/productService';
import { createOrder } from '../../services/orderService';
import { notifyOrder, notifyError } from '../../services/notificationService';
import GlassCard from '../ui/GlassCard';
import AnimatedButton from '../ui/AnimatedButton';

const BuyerExplore = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Order modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [ordering, setOrdering] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getAllProducts();
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
      setFetchError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const initiateCheckout = (e) => {
    e.preventDefault();
    setShowPayment(true);
  };

  const handleOrder = async (paymentDetails) => {
    setShowPayment(false);
    setOrdering(true);
    try {
      await createOrder({
        productId: selectedProduct.id || selectedProduct._id,
        quantity: orderQuantity,
        paymentMethod: paymentDetails.paymentMethod || 'COD',
        paymentStatus: paymentDetails.paymentStatus || 'Paid',
      });
      notifyOrder('Order Placed! 📦', `${orderQuantity}kg of ${selectedProduct.name} confirmed. Farmer has been notified.`, { duration: 7000 });
      setSelectedProduct(null);
      fetchProducts();
    } catch (err) {
      notifyError('Order Failed', err.message || 'Could not place order. Please try again.');
    } finally {
      setOrdering(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <GlassCard className="flex flex-col md:flex-row justify-between items-center p-8 gap-6 border-none" delay={0}>
        <div className="flex-1">
          <h2 className="text-3xl font-black text-white tracking-tight uppercase italic underline decoration-emerald-500 decoration-4 underline-offset-8 mb-4">Direct Market</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">{t('explore_desc') || 'Live inventory from verified local producers'}</p>
        </div>
        <div className="flex items-center space-x-4 w-full md:w-auto p-2 bg-white/5 rounded-[2rem] border border-white/5">
          <div className="relative w-full md:w-96">
            <Search className="w-5 h-5 absolute top-4 left-6 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder={t('search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-white pl-14 pr-6 py-4 rounded-2xl text-xs outline-none transition-all font-black uppercase tracking-widest placeholder-slate-600"
            />
          </div>
          <button className="bg-white/5 border border-white/5 p-4 rounded-2xl text-slate-400 hover:text-emerald-500 hover:bg-white/10 transition-all shadow-sm">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </GlassCard>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="w-16 h-16 animate-spin text-emerald-500/50" /></div>
      ) : fetchError ? (
        <GlassCard className="text-center py-20 bg-rose-500/5 border-rose-500/20" delay={0.1}>
          <X className="w-16 h-16 text-rose-500 mx-auto mb-6 opacity-30" />
          <p className="text-rose-400 font-black uppercase tracking-widest mb-4">{t('conn_error')}</p>
          <p className="text-slate-500 text-xs font-bold mb-8 max-w-md mx-auto leading-relaxed">{fetchError}</p>
          <AnimatedButton variant="outline" onClick={fetchProducts}>{t('retry_fetch')}</AnimatedButton>
        </GlassCard>
      ) : filteredProducts.length === 0 ? (
        <GlassCard className="text-center py-20" delay={0.1}>
          <ShoppingBag className="w-16 h-16 text-slate-700 mx-auto mb-6 opacity-30" />
          <p className="text-slate-500 font-black uppercase tracking-[0.3em]">{t('no_products')}</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((p, idx) => (
            <GlassCard key={p.id || p._id} className="overflow-hidden p-0 group flex flex-col h-full border-none" delay={0.1 * idx}>
              <div className="h-64 overflow-hidden relative">
                {p.image ? (
                  <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={p.name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-700 font-black uppercase tracking-widest text-[10px] italic">Binary Data Stream Missing</div>
                )}
                <div className="absolute top-6 left-6 p-2 bg-slate-950/60 backdrop-blur-md rounded-xl border border-white/10">
                   <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] px-2">{p.category}</span>
                </div>
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
              </div>
              
              <div className="p-8 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-black text-white tracking-tight uppercase italic leading-none truncate group-hover:text-emerald-400 transition-colors">{p.name}</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 flex items-center">
                       <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_#10b981]" />
                       {p.farmer?.name || t('local_farm')}
                    </p>
                  </div>
                  <div className="flex items-center bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 shadow-inner">
                    <Star className="w-3.5 h-3.5 text-emerald-500 fill-current mr-2" />
                    <span className="text-xs font-black text-emerald-400">{p.farmer?.averageRating?.toFixed(1) || '5.0'}</span>
                  </div>
                </div>

                <div className="flex items-end justify-between mb-8 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Unit Valuation</span>
                    <p className="text-3xl font-black text-white tracking-tighter italic">₹{p.pricePerKg}<span className="text-sm font-bold text-slate-600 ml-1">/kg</span></p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Stock Cap</span>
                    <p className={`text-xs font-black uppercase tracking-widest ${p.quantity < 10 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`}>{p.quantity} kg</p>
                  </div>
                </div>

                <AnimatedButton
                  className="w-full py-5 rounded-[1.5rem]"
                  onClick={() => { setSelectedProduct(p); setOrderQuantity(1); }}
                  disabled={p.quantity <= 0}
                  icon={ArrowRight}
                >
                  {p.quantity <= 0 ? t('out_of_stock') : 'Acquire Batch'}
                </AnimatedButton>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Order Confirm Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4">
            <GlassCard className="max-w-xl w-full p-0 overflow-hidden border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]" delay={0}>
              <div className="h-48 relative bg-slate-800">
                <img src={selectedProduct.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200'} className="w-full h-full object-cover opacity-60" alt={selectedProduct.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                <button onClick={() => { setSelectedProduct(null); setShowPayment(false); }} className="absolute top-8 right-8 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-all backdrop-blur-md border border-white/10">
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-8 left-8">
                   <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-2 font-mono">Initiating Transaction</p>
                   <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">{selectedProduct.name}</h3>
                </div>
              </div>

              <div className="p-10 space-y-10">
                <div className="grid grid-cols-2 gap-6">
                   <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Unit Price</p>
                      <p className="text-2xl font-black text-white tracking-tight italic">₹{selectedProduct.pricePerKg}</p>
                   </div>
                   <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Availability</p>
                      <p className="text-2xl font-black text-emerald-500 tracking-tight italic">{selectedProduct.quantity} kg</p>
                   </div>
                </div>

                <form onSubmit={initiateCheckout} className="space-y-10">
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono pl-2">{t('total_qty_kg')}</label>
                    <div className="relative">
                       <input
                         type="number"
                         min="1"
                         max={selectedProduct.quantity}
                         value={orderQuantity}
                         onChange={(e) => setOrderQuantity(Number(e.target.value))}
                         className="w-full bg-white/5 border-2 border-white/5 hover:border-emerald-500/30 focus:border-emerald-500 text-white rounded-3xl px-8 py-6 text-4xl font-black tracking-tighter transition-all outline-none"
                         required
                       />
                       <span className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-600 font-black text-xl italic uppercase">KG</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-6 border-t border-white/5">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] font-mono italic">Total Valuation</span>
                    <span className="text-5xl font-black text-white tracking-tighter italic">₹{(selectedProduct.pricePerKg * orderQuantity).toFixed(0)}</span>
                  </div>

                  <AnimatedButton
                    type="submit"
                    disabled={ordering || orderQuantity > selectedProduct.quantity}
                    className="w-full py-6 rounded-[2rem] text-xl"
                  >
                    {ordering ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-900" /> : 'Confirm Acquisition'}
                  </AnimatedButton>
                </form>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Gateway Overlay */}
      {showPayment && selectedProduct && (
        <MockRazorpay
          amount={(selectedProduct.pricePerKg * orderQuantity).toFixed(0)}
          onPaymentSuccess={handleOrder}
          onPaymentCancel={() => setShowPayment(false)}
        />
      )}
    </div>
  );
};

export default BuyerExplore;
