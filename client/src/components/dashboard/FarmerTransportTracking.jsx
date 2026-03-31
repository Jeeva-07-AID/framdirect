import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, PackageCheck, MapPin, Clock, ArrowRight, User, Package, Navigation, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GlassCard from '../ui/GlassCard';

/**
 * FARMER TRANSPORT & TRACKING (DEMO)
 * Simulates real-time logistics for producers.
 */

const STATUS_STEPS = ['Ordered', 'Picked', 'In Transit', 'Delivered'];

const MOCK_ORDERS = [
  {
    id: 'ORD-7742',
    product_name: 'Organic Tomatoes',
    quantity: 150,
    buyer_name: 'Elite Supermarket',
    from_location: 'Green Valley Farm',
    to_location: 'Central Distribution Hub',
    status: 'In Transit',
    transport_name: 'FastLane Logistics',
    boarding_time: '10:30 PM',
    delivery_time: '04:00 AM',
    progress: 65,
  },
  {
    id: 'ORD-8119',
    product_name: 'Premium Basmati Rice',
    quantity: 500,
    buyer_name: 'Heritage Foods Co.',
    from_location: 'Sun-Kissed Fields',
    to_location: 'South Port Warehouse',
    status: 'Picked',
    transport_name: 'MegaCargo Heavy',
    boarding_time: '11:15 PM',
    delivery_time: '06:30 AM',
    progress: 35,
  },
  {
    id: 'ORD-9003',
    product_name: 'Alphonso Mangoes',
    quantity: 80,
    buyer_name: 'Fresh Basket Retail',
    from_location: 'Ratnagiri Orchards',
    to_location: 'Mumbai Terminal 2',
    status: 'Ordered',
    transport_name: 'Swift-Air Fleet',
    boarding_time: '09:00 PM',
    delivery_time: '11:30 PM',
    progress: 5,
  }
];

const OrderTrackingCard = ({ order, index }) => {
  const { t } = useTranslation();
  const currentStep = STATUS_STEPS.indexOf(order.status);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="mb-8"
    >
      <GlassCard className="p-0 overflow-hidden border-white/5 bg-slate-900/40 relative group">
        {/* Progress Background */}
        <div className="absolute top-0 left-0 w-full h-1 bg-white/5 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${order.progress}%` }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400"
          />
        </div>

        <div className="p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
            {/* Header Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-500/20">
                  {order.id}
                </span>
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest flex items-center">
                  <Package className="w-3 h-3 mr-1.5" /> {order.product_name}
                </span>
              </div>
              <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center">
                {order.quantity}kg for {order.buyer_name}
              </h3>
            </div>

            {/* Transport Fleet Info */}
            <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 flex items-center gap-4 lg:min-w-[280px]">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-emerald-500/30 transition-colors">
                <Truck className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Carrier Fleet</p>
                <p className="text-sm font-black text-white uppercase italic tracking-tighter">{order.transport_name}</p>
                <div className="flex items-center gap-3 mt-1.5">
                   <span className="text-[9px] font-bold text-slate-400 flex items-center"><Clock className="w-2.5 h-2.5 mr-1" /> {order.boarding_time}</span>
                   <Navigation className="w-2.5 h-2.5 text-slate-600" />
                   <span className="text-[9px] font-bold text-emerald-400 flex items-center"><MapPin className="w-2.5 h-2.5 mr-1 text-emerald-400" /> {order.delivery_time}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tracking Timeline */}
          <div className="relative pt-12 pb-6 px-4 md:px-12">
            {/* Base Line */}
            <div className="absolute top-[68px] left-4 md:left-12 right-4 md:right-12 h-0.5 bg-white/5 rounded-full" />
            
            {/* Filled Progress Line */}
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `calc(${Math.max(0, (currentStep / (STATUS_STEPS.length - 1)) * 100)}% - 0px)` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute top-[68px] left-4 md:left-12 h-0.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400 rounded-full"
            />

            {/* Steps */}
            <div className="relative flex justify-between">
              {STATUS_STEPS.map((step, i) => {
                const isActive = i <= currentStep;
                const isCurrent = i === currentStep;
                return (
                  <div key={step} className="flex flex-col items-center relative z-10">
                    <motion.div 
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                        isCurrent 
                          ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] ring-4 ring-emerald-500/10' 
                          : isActive 
                            ? 'bg-slate-800 border-emerald-500/50 text-emerald-400' 
                            : 'bg-slate-900 border-white/5 text-slate-700'
                      }`}
                    >
                      {isActive ? (
                        <PackageCheck className={`w-5 h-5 ${isCurrent ? 'text-slate-950 font-bold' : ''}`} />
                      ) : (
                        <span className="text-xs font-black">{i + 1}</span>
                      )}
                    </motion.div>
                    <p className={`mt-4 text-[10px] font-black uppercase tracking-widest ${isCurrent ? 'text-white' : isActive ? 'text-emerald-400' : 'text-slate-600'}`}>
                      {step}
                    </p>
                  </div>
                );
              })}

              {/* Animated Truck Icon */}
              <AnimatePresence>
                {currentStep < 3 && (
                  <motion.div
                    className="absolute top-[38px] z-20 pointer-events-none"
                    initial={{ left: `${(currentStep / 3) * 100}%` }}
                    animate={{ left: `calc(${(currentStep / 3) * 100}% + 20px)` }}
                    transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                  >
                    <Truck className="w-4 h-4 text-emerald-400 fill-emerald-500 drop-shadow-lg" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Location Info */}
          <div className="flex items-center justify-between mt-12 pt-6 border-t border-white/5">
             <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-slate-500" />
                <p className="text-xs font-bold text-slate-300 uppercase italic tracking-widest">{order.from_location}</p>
             </div>
             <ArrowRight className="w-4 h-4 text-slate-700" />
             <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <p className="text-xs font-bold text-emerald-200 uppercase italic tracking-widest">{order.to_location}</p>
             </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

const FarmerTransportTracking = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [notifications, setNotifications] = useState([]);

  // Auto-Update Simulator
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prevOrders => {
        const indexToUpdate = Math.floor(Math.random() * prevOrders.length);
        const order = prevOrders[indexToUpdate];
        
        let newStatus = order.status;
        let newProgress = order.progress + 5;
        
        if (newProgress >= 100) {
          newProgress = 100;
          newStatus = 'Delivered';
        } else if (newProgress > 66) {
          newStatus = 'In Transit';
        } else if (newProgress > 33) {
          newStatus = 'Picked';
        } else {
          newStatus = 'Ordered';
        }

        // Add a notification if status changed
        if (newStatus !== order.status) {
          const newNotif = { 
            id: Date.now(), 
            msg: `Order ${order.id}: ${newStatus.toUpperCase()}`,
            type: newStatus === 'Delivered' ? 'success' : 'info'
          };
          setNotifications(prev => [newNotif, ...prev.slice(0, 2)]);
        }

        return prevOrders.map((o, idx) => 
          idx === indexToUpdate ? { ...o, status: newStatus, progress: newProgress } : o
        );
      });
    }, 6000); // Update every 6 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-12">
      {/* Notifications overlay/feed */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">{t('active_orders_transport') || 'Active Orders & Transport'}</h2>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Real-time status updates from carrier fleets</p>
        </div>
        
        <div className="flex items-center gap-4">
           <AnimatePresence>
             {notifications.map(n => (
               <motion.div
                 key={n.id}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, scale: 0.9 }}
                 className={`p-3 rounded-xl border flex items-center gap-3 backdrop-blur-xl ${
                   n.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-400'
                 }`}
               >
                 <Bell className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-widest">{n.msg}</span>
               </motion.div>
             ))}
           </AnimatePresence>
        </div>
      </div>

      <div className="space-y-6">
        {orders.map((order, i) => (
          <OrderTrackingCard key={order.id} order={order} index={i} />
        ))}
      </div>
    </div>
  );
};

export default FarmerTransportTracking;
