import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Truck, Clock, MapPin, Check, ArrowRight, Loader2 } from 'lucide-react';
import { getTransportRoutes, assignTransportToOrder } from '../services/transportService';
import { notifyError, notifySuccess } from '../services/notificationService';

const TransportSelection = ({ order, isOpen, onClose, onSuccess }) => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (isOpen && order) {
      fetchRoutes();
    }
  }, [isOpen, order]);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      // Use farmer and buyer locations for matching
      const source = order.farmer?.location?.split(',')[0] || '';
      const destination = order.buyer?.location?.split(',')[0] || '';
      const data = await getTransportRoutes(source, destination);
      setRoutes(data);
    } catch (err) {
      console.error('Failed to fetch routes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async () => {
    if (!selectedRoute) return;
    setAssigning(true);
    try {
      const orderId = order.id || order._id;
      await assignTransportToOrder(orderId, selectedRoute.id, selectedRoute.boarding_point);
      onSuccess();
      onClose();
    } catch (err) {
      notifyError('Transport Assignment Failed', err.message || 'Error assigning route');
    } finally {
      setAssigning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center tracking-tight">
              <Truck className="w-6 h-6 mr-3 text-primary-500" />
              Select Transport
            </h3>
            <p className="text-slate-400 text-sm mt-1">Choose a delivery route for this order</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-all border border-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-10 h-10 animate-spin text-primary-500 mb-4" />
              <p className="font-semibold">Searching available routes...</p>
            </div>
          ) : routes.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl">
              <Truck className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No direct routes found</p>
              <p className="text-slate-600 text-xs mt-2">Try contacting admin for custom pickup</p>
            </div>
          ) : (
            routes.map((route) => (
              <motion.div
                key={route.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedRoute(route)}
                className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden group ${
                  selectedRoute?.id === route.id
                    ? 'bg-primary-500/10 border-primary-500/50'
                    : 'bg-slate-800/30 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center text-white font-bold text-lg mb-4">
                      {route.source} 
                      <ArrowRight className="w-4 h-4 mx-3 text-slate-500" />
                      {route.destination}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Boarding</p>
                        <p className="text-sm text-slate-300 font-semibold flex items-center">
                          <MapPin className="w-3 h-3 mr-1.5 text-primary-400" /> {route.boarding_point}
                        </p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Delivery</p>
                        <p className="text-sm text-slate-300 font-semibold flex items-center justify-end">
                          <MapPin className="w-3 h-3 mr-1.5 text-emerald-400" /> {route.delivery_point}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Departure</p>
                        <p className="text-sm text-white font-bold flex items-center">
                          <Clock className="w-3 h-3 mr-1.5 text-amber-400" /> 
                          {new Date(`1970-01-01T${route.departure_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Arrival (EST)</p>
                        <p className="text-sm text-white font-bold flex items-center justify-end">
                          <Clock className="w-3 h-3 mr-1.5 text-emerald-400" /> 
                          {new Date(`1970-01-01T${route.arrival_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedRoute?.id === route.id && (
                    <div className="flex items-center justify-center bg-primary-500 text-slate-950 rounded-full w-10 h-10 shrink-0 shadow-lg shadow-primary-500/20">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>
                  )}
                </div>
                
                {/* Visual Highlight */}
                {selectedRoute?.id === route.id && (
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-[40px] -z-10 rounded-full" />
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-900 border-t border-slate-800 flex justify-end">
           <button
             disabled={!selectedRoute || assigning}
             onClick={handleSelect}
             className="px-10 py-4 bg-primary-600 hover:bg-primary-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-2xl transition-all shadow-xl shadow-primary-600/10 disabled:shadow-none flex items-center tracking-tight"
           >
             {assigning ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Truck className="w-5 h-5 mr-2" />}
             Confirm Transport
           </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TransportSelection;
