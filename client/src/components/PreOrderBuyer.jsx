import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, MapPin, Calendar, CheckCircle2, IndianRupee, ShieldCheck, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MockRazorpay from './dashboard/MockRazorpay'; 
import { getPreOrders, placePreOrder } from '../services/preOrderService';
import { notifySuccess, notifyError } from '../services/notificationService';

const PreOrderBuyer = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchPreOrders();
  }, []);

  const fetchPreOrders = async () => {
    setLoading(true);
    try {
      const data = await getPreOrders();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch pre-orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAdvance = (product) => {
    const total = (product.expected_quantity || 0) * (product.price_per_kg || 40); // Default price if missing
    return total * 0.25; // 25% advance
  };

  const handlePreOrder = (product) => {
    setSelectedProduct(product);
  };

  const handlePaymentSuccess = async (paymentDetails) => {
    const advance = calculateAdvance(selectedProduct);
    try {
      await placePreOrder({
        preOrderProductId: selectedProduct.id,
        quantity: selectedProduct.expected_quantity,
        totalAmount: advance,
        paymentDetails: {
          paymentMethod: paymentDetails.paymentMethod,
          paymentStatus: paymentDetails.paymentStatus
        }
      });
      
      setSuccessMsg(t('pre_order_success') || 'Pre-order placed successfully! The farmer has been notified.');
      notifySuccess('Pre-Order Confirmed!', `Advance payment for ${selectedProduct.product_name} received.`);
      setSelectedProduct(null);
      fetchPreOrders();

      // clear message after few seconds
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      notifyError('Pre-Order Failed', err.message || 'Payment processed but record creation failed.');
    }
  };

  const handlePaymentCancel = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      <div className="flex items-center gap-4 bg-slate-900/40 p-6 rounded-3xl border border-slate-800/50 backdrop-blur-md">
        <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
          <Sprout className="w-8 h-8 text-emerald-400" />
        </div>
        <div>
           <h2 className="text-3xl font-bold text-white tracking-tight">{t('pre_booking_open')}</h2>
           <p className="text-slate-400 text-sm mt-1">{t('pre_order_subtitle')}</p>
        </div>
      </div>

      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl flex items-center gap-3 backdrop-blur-md shadow-lg shadow-emerald-900/10"
          >
            <CheckCircle2 className="w-6 h-6" />
            <p className="font-bold">{successMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="w-12 h-12 animate-spin text-emerald-500" /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-slate-800/50">
           <Sprout className="w-16 h-16 text-slate-700 mx-auto mb-4 opacity-20" />
           <p className="text-slate-500 font-bold uppercase tracking-widest">No future harvests listed yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, idx) => {
            const price = product.price_per_kg || 40;
            const totalAmount = product.expected_quantity * price;
            const advanceAmount = calculateAdvance(product);

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-slate-900/60 border border-slate-700/50 rounded-3xl p-6 hover:border-emerald-500/40 hover:shadow-[0_0_30px_-5px_var(--tw-shadow-color)] shadow-emerald-500/10 backdrop-blur-md transition-all flex flex-col relative overflow-hidden group"
              >
                {/* Badges */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                   <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm backdrop-blur-md">
                     🌱 {t('pre_booking_open')}
                   </span>
                   <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm backdrop-blur-md">
                     ⏳ {t('limited_slots')}
                   </span>
                </div>

                <div className="mt-2 mb-6">
                  <h3 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {product.product_name}
                  </h3>
                  <p className="text-slate-400 text-sm mt-1 font-medium text-emerald-100/50">{product.farmer?.name || 'Local Farmer'}</p>
                  <div className="flex items-center gap-2 mt-2 text-slate-400 text-sm">
                     <MapPin className="w-4 h-4 text-slate-500" />
                     {product.location}
                  </div>
                </div>

                <div className="space-y-4 mb-6 flex-1">
                  <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800/60 flex items-center justify-between">
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('expected_yield')}</p>
                        <p className="text-lg font-bold text-white mt-0.5">{product.expected_quantity} <span className="text-xs text-slate-400">kg</span></p>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('retail_rate')}</p>
                        <p className="text-lg font-bold text-white mt-0.5">₹{price}<span className="text-xs text-slate-400">/kg</span></p>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                     <div className="border border-slate-700/50 p-3 rounded-2xl bg-slate-800/30">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{t('cultivation_date')}</p>
                       <p className="text-sm font-bold text-slate-300 flex items-center gap-1.5">
                         <Calendar className="w-3.5 h-3.5 text-slate-400" />
                         {new Date(product.cultivation_date).toLocaleDateString()}
                       </p>
                     </div>
                     <div className="border border-emerald-500/20 p-3 rounded-2xl bg-emerald-500/5">
                       <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/70 mb-1">{t('harvest_date')}</p>
                       <p className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                         <Calendar className="w-3.5 h-3.5" />
                         {new Date(product.harvest_date).toLocaleDateString()}
                       </p>
                     </div>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">25% Advance</p>
                     <p className="text-xl font-bold text-white flex items-center mt-0.5">
                       <IndianRupee className="w-4 h-4 text-emerald-500 mr-0.5" />
                       {advanceAmount}
                       <span className="text-xs text-slate-500 font-normal ml-1 line-through opacity-70">₹{totalAmount}</span>
                     </p>
                  </div>
                  <button
                    onClick={() => handlePreOrder(product)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/40 active:scale-95 flex items-center gap-2 group/btn"
                  >
                     <ShieldCheck className="w-4 h-4 opacity-80" />
                     {t('pre_order_now')}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {selectedProduct && (
          <MockRazorpay
            amount={calculateAdvance(selectedProduct)}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentCancel={handlePaymentCancel}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PreOrderBuyer;
