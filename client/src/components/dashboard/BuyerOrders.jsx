import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Loader2, PackageCheck, Truck, Map as MapIcon, Calendar, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import OrderTracking from '../OrderTracking';
import ReviewModal from './ReviewModal';
import { getBuyerOrders, subscribeToOrders } from '../../services/orderService';
import { notifySuccess, notify, NOTIF_TYPES } from '../../services/notificationService';

const USE_FAKE_DATA = true;

const fakeBuyerOrders = [
  { id: 'o1', product: { name: 'Fresh Tomatoes', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200' }, farmer: { name: 'Demo Farmer', location: 'Trichy' }, quantity: 50, totalPrice: 1000, status: 'Ordered', createdAt: Date.now() - 3600000, transport: { name: 'TN Logistics', boarding: '11:00 PM', delivery: '05:00 AM' } },
  { id: 'o2', product: { name: 'Organic Potatoes', image: 'https://images.unsplash.com/photo-1518977676601-b53f02bad675?w=200' }, farmer: { name: 'Green Valley Farm', location: 'Madurai' }, quantity: 100, totalPrice: 3200, status: 'Picked Up', createdAt: Date.now() - 86400000, transport: { name: 'Speed Cargo', boarding: '08:00 PM', delivery: '04:00 AM' } },
  { id: 'o3', product: { name: 'Red Onions', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8d1?w=200' }, farmer: { name: 'Salem Agri Hub', location: 'Salem' }, quantity: 200, totalPrice: 9000, status: 'Delivered', createdAt: Date.now() - 172800000, transport: { name: 'Local Freight', boarding: '05:00 PM', delivery: '09:00 PM' } },
  { id: 'o4', product: { name: 'Ooty Carrots', image: 'https://images.unsplash.com/photo-1590865101275-483624df511a?w=200' }, farmer: { name: 'Hilltop Veggies', location: 'Ooty' }, quantity: 25, totalPrice: 1000, status: 'In Transit', createdAt: Date.now() - 43200000, transport: { name: 'Cool Chain Logistics', boarding: '06:00 AM', delivery: '02:00 PM' } }
];

const BuyerOrders = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [reviewOrder, setReviewOrder] = useState(null);

  useEffect(() => {
    fetchOrders();

    // Real-time subscription for order status updates
    if (user?.id) {
      const unsubscribe = subscribeToOrders(user.id, 'Buyer', (payload) => {
        fetchOrders();
        // Show notification for status updates
        if (payload.eventType === 'UPDATE') {
          const newStatus = payload.new?.status;
          if (newStatus === 'Picked Up') {
            notifySuccess('Order Shipped! 🚚', 'Your order is on the way. Track it in real-time.');
          } else if (newStatus === 'Delivered') {
            notifySuccess('Delivered! ✅', 'Your order has arrived. Please leave a review.');
          } else {
            notify(NOTIF_TYPES.ORDER_UPDATED, 'Order Updated', `Status: ${newStatus}`);
          }
        }
      });
      return unsubscribe;
    }
  }, [user?.id, t]);

  const fetchOrders = async () => {
    try {
      const data = await getBuyerOrders();
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 max-w-4xl mx-auto shadow-2xl relative overflow-hidden">

      <div className="mb-10 border-b border-slate-800 pb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">{t('your_orders_title')}</h2>
          <p className="text-slate-400 text-sm mt-1">{t('orders_desc')}</p>
        </div>
        <div className="p-4 bg-slate-800 rounded-3xl hidden md:block border border-slate-700">
          <PackageCheck className="w-8 h-8 text-primary-500" />
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
          </div>
        ) : (!USE_FAKE_DATA && orders.length === 0) ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 border-2 border-dashed border-slate-800 bg-slate-900/50 rounded-3xl">
            <PackageCheck className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest">{t('no_orders')}</p>
          </motion.div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
            {(USE_FAKE_DATA || orders.length === 0 ? fakeBuyerOrders : orders).map(order => (
              <motion.div variants={item} key={order.id || order._id} className="bg-slate-800/50 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-center hover:border-slate-700 transition-colors group relative overflow-hidden">
                {/* Subtle Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-3xl rounded-full transition-opacity opacity-0 group-hover:opacity-100"></div>
                {/* Product Info */}
                <div className="flex-1 w-full flex items-center mb-6 md:mb-0">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 shrink-0">
                    <img
                      src={order.product?.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt={order.product?.name}
                    />
                  </div>
                  <div className="ml-5">
                    <h4 className="text-xl font-bold text-white capitalize leading-none tracking-tight mb-2 group-hover:text-primary-400 transition-colors">
                       {order.product?.name || t('unknown_product')}
                    </h4>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center mb-2">
                       {t('role_farmer')}: <span className="text-primary-500 ml-1">{order.farmer?.name || t('local_farm')}</span>
                    </p>
                    <div className="flex items-center space-x-3 mt-3">
                      <span className="bg-slate-900 text-slate-300 font-bold text-xs px-3 py-1 rounded-lg border border-slate-700">{order.quantity} kg</span>
                      <span className="bg-primary-500/10 text-primary-400 font-bold text-xs px-3 py-1 rounded-lg border border-primary-500/20">₹{order.totalPrice}</span>
                      
                      {/* Fake Transport Route Data from Prompt */}
                      {order.transport && (
                        <span className="hidden lg:flex items-center bg-indigo-500/10 text-indigo-400 font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg border border-indigo-500/20">
                          🚚 {order.transport.name} • {order.transport.boarding} — {order.transport.delivery}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="w-full md:w-auto text-right border-t md:border-t-0 md:border-l border-slate-800 pt-6 md:pt-0 md:pl-8 flex flex-col md:items-end relative z-10">
                  <div className={`inline-flex items-center px-5 py-2.5 rounded-xl text-[10px] uppercase font-black w-full md:w-auto justify-center tracking-widest border mb-3 ${
                    order.status === 'Ordered'    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                    order.status === 'Picked Up'  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]'   :
                    order.status === 'In Transit' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]'   :
                    'bg-primary-500/10 text-primary-400 border-primary-500/20 shadow-[0_0_15px_rgba(34,197,94,0.15)]'
                  }`}>
                    <Truck className={`w-4 h-4 mr-2 ${order.status !== 'Ordered' && order.status !== 'Delivered' ? 'animate-pulse' : ''}`} />
                    {order.status}
                  </div>

                  {(order.status === 'Picked Up' || order.status === 'In Transit' || order.status === 'Ordered') && (
                    <button
                      onClick={() => setTrackingOrder(order)}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center justify-center transition-all shadow-lg uppercase tracking-wider"
                    >
                      <MapIcon className="w-4 h-4 mr-2" /> {t('track_delivery')}
                    </button>
                  )}

                  {order.status === 'Delivered' && (
                    <button
                      onClick={() => setReviewOrder(order)}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center justify-center transition-all shadow-lg uppercase tracking-wider"
                    >
                      <Star className="w-4 h-4 mr-2 fill-current" /> {t('btn_rate')}
                    </button>
                  )}

                  <p className="text-[10px] font-bold text-slate-500 mt-4 flex items-center justify-end uppercase tracking-widest">
                    <Calendar className="w-3 h-3 mr-1" /> {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Live Tracking Overlay */}
      <AnimatePresence>
        {trackingOrder && (
          <OrderTracking 
            isOpen={!!trackingOrder} 
            order={trackingOrder} 
            onClose={() => setTrackingOrder(null)} 
          />
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {reviewOrder && (
          <ReviewModal
            order={reviewOrder}
            onClose={() => setReviewOrder(null)}
            onSuccess={fetchOrders}
          />
        )}
      </AnimatePresence>

    </div>
  );
};

export default BuyerOrders;
