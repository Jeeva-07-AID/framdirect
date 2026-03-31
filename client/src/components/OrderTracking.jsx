import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, MapPin, CheckCircle, Clock, X, Loader2, Navigation, ShieldCheck } from 'lucide-react';
import { subscribeOrderTracking } from '../services/transportService';
import { notifySuccess, notify, NOTIF_TYPES } from '../services/notificationService';
import GlassCard from './ui/GlassCard';
import ProgressBar from './ui/ProgressBar';

const USE_FAKE_DATA = false;

const OrderTracking = ({ order, isOpen, onClose }) => {
  const [currentOrder, setCurrentOrder] = useState(order);
  const [status, setStatus] = useState(order.delivery_status || 'pending');
  const [location, setLocation] = useState(order.current_location || 'Initializing Origin...');

  useEffect(() => {
    if (!isOpen || !order.id && !order._id) return;
    const orderId = order.id || order._id;

    // Real-time tracking subscription
    const unsubscribe = subscribeOrderTracking(orderId, (updatedOrder) => {
      console.log('Order tracking update:', updatedOrder);
      setCurrentOrder(prev => ({ ...prev, ...updatedOrder }));
      if (updatedOrder.delivery_status) setStatus(updatedOrder.delivery_status);
      if (updatedOrder.current_location) setLocation(updatedOrder.current_location);
    });

    return () => unsubscribe();
  }, [isOpen, order.id, order._id]);

  if (!isOpen) return null;

  const steps = [
    { key: 'pending', label: 'Ordered', icon: Clock },
    { key: 'picked', label: 'Picked Up', icon: CheckCircle },
    { key: 'in_transit', label: 'In Transit', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: MapPin },
  ];

  const currentIdx = steps.findIndex(s => s.key === status);
  const progress = (currentIdx / (steps.length - 1)) * 100;

  // Fake Auto-Simulation Logic
  useEffect(() => {
    if (!isOpen || !USE_FAKE_DATA) return;
    
    // Check if we are already delivered
    if (status === 'delivered') return;

    const timer = setInterval(() => {
      setStatus(prev => {
        const idx = steps.findIndex(s => s.key === prev);
        if (idx < steps.length - 1) {
          const nextStep = steps[idx + 1];
          // Trigger a fake notification for the status bump
          if (nextStep.key === 'picked') {
            notifySuccess('Order Picked Up! 📦', 'The farmer has dispatched your items.');
          } else if (nextStep.key === 'in_transit') {
            notify(NOTIF_TYPES.ORDER_UPDATED, 'Out for Delivery 🚚', 'Your package is on its final route.', { duration: 5000 });
          } else if (nextStep.key === 'delivered') {
            notifySuccess('Delivered Successfully! 🎉', 'Your items have safely arrived.');
          }
          return nextStep.key;
        }
        clearInterval(timer);
        return prev;
      });
    }, 7000); // 7 seconds per status tick

    return () => clearInterval(timer);
  }, [isOpen, status]);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="w-full max-w-4xl relative"
      >
        <GlassCard className="p-0 overflow-hidden border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]" delay={0}>
          {/* Futuristic Header */}
          <div className="p-10 border-b border-white/5 flex justify-between items-start bg-slate-900/40">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center border border-primary-500/30 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                <Navigation className="w-8 h-8 text-primary-500 animate-pulse" />
              </div>
              <div>
                <div className="inline-flex items-center px-3 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full text-[10px] font-black text-primary-500 uppercase tracking-[0.3em] mb-2">Live Telemetry Link</div>
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Quantum Track</h3>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2 font-mono">Payload #{(order.id || order._id || '').slice(-8).toUpperCase()}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white rounded-2xl transition-all border border-white/10">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-10 lg:p-16 space-y-16">
            {/* Advanced Timeline */}
            <div className="relative pt-12 pb-8">
              <div className="absolute top-[48px] left-0 w-full h-1 bg-white/5 rounded-full" />
              <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${progress}%` }}
                 className="absolute top-[48px] left-0 h-1 bg-primary-500 rounded-full shadow-[0_0_20px_#22c55e]" 
              />
              
              <div className="relative flex justify-between">
                {steps.map((step, idx) => {
                  const Icon = step.icon;
                  const isCompleted = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;
                  
                  return (
                    <div key={step.key} className="flex flex-col items-center relative z-10">
                      <motion.div 
                        initial={false}
                        animate={{ 
                          scale: isCurrent ? 1.4 : 1,
                          backgroundColor: isCompleted ? '#22c55e' : '#0f172a',
                          borderColor: isCompleted ? '#22c55e' : 'rgba(255,255,255,0.1)'
                        }}
                        className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 shadow-2xl ${isCurrent ? 'ring-4 ring-primary-500/20 shadow-primary-500/40' : ''}`}
                      >
                        <Icon className={`w-5 h-5 transition-colors duration-500 ${isCompleted ? 'text-slate-950 stroke-[3]' : 'text-slate-600'}`} />
                      </motion.div>
                      <p className={`text-[10px] font-black mt-6 uppercase tracking-[0.2em] transition-colors duration-500 ${isCompleted ? 'text-white italic' : 'text-slate-600'}`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Truck Animation Overly */}
              {status !== 'delivered' && (
                 <motion.div 
                   animate={{ 
                     left: `${progress}%`,
                     x: '-50%'
                   }}
                   transition={{ type: "spring", damping: 15, stiffness: 60 }}
                   className="absolute top-[48px] z-20 -translate-y-full mb-10 text-center"
                 >
                   <div className="relative mb-4">
                      <div className="bg-primary-500 p-3 rounded-2xl shadow-[0_10px_20px_rgba(34,197,94,0.4)]">
                         <Truck className="w-6 h-6 text-slate-950 animate-bounce" />
                      </div>
                      {/* Down arrow marker */}
                      <div className="w-0.5 h-6 bg-primary-500 mx-auto mt-0.5 shadow-[0_0_10px_#22c55e]" />
                   </div>
                 </motion.div>
              )}
            </div>

            {/* Grid Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="p-8 bg-white/5 border border-white/5 rounded-[2rem] relative overflow-hidden group">
                  <div className="absolute top-6 right-6 text-primary-500/10 group-hover:text-primary-500/30 transition-colors duration-500">
                     <MapPin className="w-24 h-24" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono mb-4">Current Sector</p>
                    <h4 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">{location}</h4>
                    <div className="flex items-center space-x-3 text-xs font-bold text-emerald-500">
                       <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                       <span className="uppercase tracking-widest font-black italic">Live Feed Active</span>
                    </div>
                  </div>
               </div>

               <div className="p-8 bg-white/5 border border-white/5 rounded-[2rem]">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono mb-6">Logistics Manifest</p>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center group">
                       <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Origin Point</span>
                       <span className="text-white font-black italic uppercase text-sm tracking-tight">{order.farmer?.name || 'Authorized Producer'}</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-y border-white/5 group">
                       <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Destination</span>
                       <span className="text-white font-black italic uppercase text-sm tracking-tight">{order.buyer?.name || 'Supply Node'}</span>
                    </div>
                    <div className="flex justify-between items-center group">
                       <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">ETA Projection</span>
                       <span className="text-primary-500 font-black italic uppercase text-lg tracking-tighter">
                          {status === 'delivered' ? 'ACQUIRED' : '05:00 AM ZULU'}
                       </span>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Secure Footer */}
          <div className="p-10 bg-slate-950/40 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-8">
             <div className="flex items-center space-x-6">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group">
                   <ShieldCheck className="w-7 h-7 text-slate-400 group-hover:text-primary-500 transition-colors" />
                </div>
                <div>
                   <p className="text-xs font-black text-white uppercase tracking-widest">Verified Logistics</p>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Encrypted Chain-of-Custody Stream</p>
                </div>
             </div>
             {status !== 'delivered' && (
                <div className="px-6 py-3 bg-primary-500 text-slate-900 rounded-2xl flex items-center shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                  <div className="flex space-x-1 mr-4">
                     {[1, 2, 3].map(i => (
                        <motion.div
                           key={i}
                           animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                           transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                           className="w-1 h-1 bg-slate-950 rounded-full"
                        />
                     ))}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Signal Sync Active</span>
                </div>
             )}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default OrderTracking;
