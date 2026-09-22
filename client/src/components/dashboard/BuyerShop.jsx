import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, MapPin, Calendar, IndianRupee, ShoppingBag, Loader2, AlertCircle, ShieldCheck, Truck, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { getShopProducts, purchaseProduct } from '../../services/shopService';
import { supabase } from '../../lib/supabaseClient';
import { notifyError, notifySuccess } from '../../services/notificationService';
import MockRazorpay from './MockRazorpay';

const BuyerShop = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Purchase state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState('');
  const [orderSuccessDetails, setOrderSuccessDetails] = useState(null);

  useEffect(() => {
    fetchProducts();

    // Real-time updates for available_quantity
    const channel = supabase
      .channel('buyer-shop-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'farmer_shop_products' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setProducts(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p));
          } else if (payload.eventType === 'INSERT') {
            fetchProducts(); // simplest way to grab farmer relations for new rows
          } else if (payload.eventType === 'DELETE') {
            setProducts(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getShopProducts(); // buyer sees all
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch shop products:', err);
      setError(t('error_fetch_inventory') || 'Failed to load farmer shop inventory.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCheckout = (product) => {
    setPurchaseQuantity(''); // reset quantity on click
    setSelectedProduct(product);
  };

  const calculateTotal = () => {
    if (!selectedProduct || !purchaseQuantity) return 0;
    return Number(purchaseQuantity) * selectedProduct.price_per_kg;
  };

  const handlePaymentSuccess = async (paymentDetails) => {
    const qty = Number(purchaseQuantity);
    try {
      // 1. the service handles decrementing `available_quantity` & logging order to `orders`
      await purchaseProduct(selectedProduct, qty, user.id, paymentDetails);
      
      // 2. Mock delivery timeline
      const today = new Date();
      const shipment = new Date(today); shipment.setDate(shipment.getDate() + 1);
      const arrival = new Date(today); arrival.setDate(arrival.getDate() + 3);

      setOrderSuccessDetails({
         productName: selectedProduct.product_name,
         quantity: qty,
         total: calculateTotal(),
         shipmentDate: shipment,
         arrivalDate: arrival,
         expiryDate: new Date(selectedProduct.expiry_date)
      });
      
      setSelectedProduct(null);
      
      // auto-clear after 10s
      setTimeout(() => setOrderSuccessDetails(null), 10000);
    } catch (err) {
      console.error(err);
      notifyError('Purchase Failed', 'Error completing purchase: ' + err.message);
      setSelectedProduct(null);
    }
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
            <h2 className="text-3xl font-bold text-white tracking-tight">{t('shop_title')}</h2>
            <p className="text-slate-400 text-sm mt-1">{t('shop_subtitle')}</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
         {orderSuccessDetails && (
            <motion.div 
               initial={{ opacity: 0, y: -20, scale: 0.95 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="bg-emerald-900/40 border border-emerald-500/30 p-6 rounded-3xl backdrop-blur-md shadow-2xl shadow-emerald-500/10 relative overflow-hidden"
            >
               <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/20 blur-3xl rounded-full" />
               <h3 className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
                 <ShieldCheck className="w-7 h-7 text-emerald-400" />
                 {t('order_confirmation')}
               </h3>
               <p className="text-slate-300 font-medium mb-6">
                 {t('sec_quantity_msg', { 
                   quantity: orderSuccessDetails.quantity, 
                   product: orderSuccessDetails.productName, 
                   total: orderSuccessDetails.total 
                 })}
               </p>
               
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/60">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 mb-1"><Truck className="w-3 h-3 text-blue-400"/> {t('est_dispatch')}</p>
                     <p className="text-white font-bold">{orderSuccessDetails.shipmentDate.toLocaleDateString()}</p>
                  </div>
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/60">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 mb-1"><MapPin className="w-3 h-3 text-emerald-400"/> {t('est_arrival')}</p>
                     <p className="text-white font-bold">{orderSuccessDetails.arrivalDate.toLocaleDateString()}</p>
                  </div>
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/60">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 mb-1"><Clock className="w-3 h-3 text-amber-400"/> {t('spoilage_target')}</p>
                     <p className="text-white font-bold">{orderSuccessDetails.expiryDate.toLocaleDateString()}</p>
                  </div>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Checkout Sidebar/Overlay Modal */}
      <AnimatePresence>
        {selectedProduct && calculateTotal() > 0 && purchaseQuantity <= selectedProduct.available_quantity ? (
          <MockRazorpay
            amount={calculateTotal()}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentCancel={() => setSelectedProduct(null)}
          />
        ) : null}
      </AnimatePresence>

      {/* Inventory List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
          <p className="font-medium">{t('loading')}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <ShoppingBag className="w-16 h-16 text-slate-800 mx-auto" />
          <h3 className="text-xl font-bold text-slate-300">{t('no_products')}</h3>
          <p className="text-slate-500">{t('no_products_desc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {products.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-slate-900/60 border border-slate-700/50 rounded-3xl p-6 hover:border-emerald-500/40 transition-all backdrop-blur-md relative overflow-hidden flex flex-col group h-full"
            >
              {/* Card visual effects */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -mr-10 -mt-10 group-hover:bg-emerald-500/15 group-hover:blur-[60px] transition-all duration-700" />
              
              {/* Product Info */}
              <div className="flex-1">
                 <div className="flex justify-between items-start mb-6">
                   <div className="bg-emerald-500/10 p-3 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform">
                     <ShoppingBag className="w-6 h-6 text-emerald-400" />
                   </div>
                   <div className="text-right">
                     <p className="text-2xl font-black text-white group-hover:text-emerald-400 transition-colors">₹{item.price_per_kg}</p>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('price_per_kg')}</p>
                   </div>
                 </div>

                 <h3 className="text-xl font-bold text-white mb-1">
                   {item.product_name}
                 </h3>
                 <p className="text-slate-400 text-sm font-medium">{item.farmer?.name}</p>

                 <div className="mt-4 space-y-2 mb-6 text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                       <MapPin className="w-4 h-4 text-slate-500" />
                       {item.location}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                       <Calendar className="w-4 h-4 text-emerald-500/70" />
                       {t('expiry_date')} {new Date(item.expiry_date).toLocaleDateString('en-GB')}
                    </div>
                 </div>

                 {/* Available Badge */}
                 <div className="bg-slate-950/50 border border-slate-800 p-3 rounded-xl flex items-center justify-between mb-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('available_stock')}</span>
                    <span className="text-emerald-400 font-bold">{item.available_quantity} kg</span>
                 </div>
              </div>

              {/* Action Area */}
              <div className="pt-4 border-t border-slate-800/80">
                 {item.available_quantity > 0 ? (
                    <div className="space-y-3">
                       <div className="relative">
                          <input 
                            type="number"
                            min="1"
                            max={item.available_quantity}
                            placeholder={t('enter_quantity')}
                            value={selectedProduct?.id === item.id ? purchaseQuantity : ''}
                            onChange={(e) => {
                               setSelectedProduct(item);
                               setPurchaseQuantity(e.target.value);
                            }}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">kg</span>
                       </div>
                       
                       <AnimatePresence>
                          {selectedProduct?.id === item.id && purchaseQuantity && (
                             <motion.div 
                               initial={{ opacity: 0, height: 0 }}
                               animate={{ opacity: 1, height: 'auto' }}
                               exit={{ opacity: 0, height: 0 }}
                               className="overflow-hidden"
                             >
                                {Number(purchaseQuantity) <= item.available_quantity && Number(purchaseQuantity) > 0 ? (
                                   <div className="flex items-center justify-between mt-2 mb-3 px-2">
                                      <span className="text-slate-400 text-sm font-medium">{t('total_price')}</span>
                                      <span className="text-emerald-400 font-bold flex items-center">
                                         <IndianRupee className="w-4 h-4 mr-0.5" />
                                         {Number(purchaseQuantity) * item.price_per_kg}
                                      </span>
                                   </div>
                                ) : (
                                   <div className="text-red-400 text-xs font-bold mt-2 flex items-center gap-1.5 px-1 bg-red-500/10 p-2 rounded-lg">
                                      <AlertCircle className="w-3.5 h-3.5" /> 
                                      Quantity exceeds available stock ({item.available_quantity}kg limits)
                                   </div>
                                )}
                             </motion.div>
                          )}
                       </AnimatePresence>

                       <button
                         onClick={() => handleOpenCheckout(item)}
                         disabled={!purchaseQuantity || selectedProduct?.id !== item.id || Number(purchaseQuantity) > item.available_quantity || Number(purchaseQuantity) <= 0}
                         className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/40 active:scale-95 flex items-center justify-center gap-2"
                       >
                         {t('buy_now')}
                       </button>
                    </div>
                 ) : (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold text-center py-4 rounded-xl">
                       {t('out_of_stock')}
                    </div>
                 )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuyerShop;
