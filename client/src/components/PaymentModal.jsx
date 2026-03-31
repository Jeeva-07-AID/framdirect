import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Building, Truck, ShieldCheck, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PaymentModal = ({ isOpen, onClose, amount, onSuccess }) => {
  const [method, setMethod] = useState('UPI');
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePay = () => {
    setProcessing(true);
    // Simulate API call to Razorpay
    setTimeout(() => {
      setProcessing(false);
      onSuccess(method, 'Paid');
    }, 2000);
  };

  const methods = [
    { id: 'UPI', icon: Smartphone, label: 'UPI / QR' },
    { id: 'Card', icon: CreditCard, label: 'Card' },
    { id: 'NetBanking', icon: Building, label: 'Net Banking' },
    { id: 'COD', icon: Truck, label: 'Cash on Delivery' },
  ];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans"
      >
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }} 
          animate={{ opacity: 1, y: 0, scale: 1 }} 
          exit={{ opacity: 0, y: 10, scale: 0.95 }} 
          className="bg-white text-slate-900 rounded-3xl overflow-hidden w-full max-w-[400px] shadow-2xl relative"
        >
          {/* Header */}
          <div className="bg-slate-900 text-white p-5 flex justify-between items-start border-b border-slate-800">
             <div>
                <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-semibold">Razorpay Test Environment</p>
                <h2 className="text-2xl font-bold">FarmDirect</h2>
             </div>
             <button onClick={onClose} disabled={processing} className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-1.5 rounded-full">
               <X className="w-5 h-5" />
             </button>
          </div>

          <div className="flex flex-col h-[400px]">
            {/* Amount display */}
            <div className="bg-slate-50 border-b border-slate-200 p-6 text-center">
              <p className="text-slate-500 text-sm font-medium mb-1">Amount to pay</p>
              <h3 className="text-4xl font-black text-slate-800 tracking-tight">₹{amount}</h3>
            </div>

            {/* Methods */}
            <div className="p-4 space-y-2 flex-1 overflow-y-auto">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Select Payment Method</p>
              {methods.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`w-full flex items-center p-4 rounded-2xl border-2 transition-all ${
                      method === m.id 
                        ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm' 
                        : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mr-3 ${method === m.id ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="font-semibold">{m.label}</span>
                    <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === m.id ? 'border-blue-600' : 'border-slate-300'}`}>
                      {method === m.id && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer / Pay button */}
            <div className="p-5 bg-white border-t border-slate-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
               <button 
                 onClick={handlePay}
                 disabled={processing}
                 className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center relative overflow-hidden"
               >
                 {processing ? (
                   <>
                     <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...
                   </>
                 ) : (
                   `Pay ₹${amount}`
                 )}
               </button>
               
               <div className="flex items-center justify-center mt-4 text-xs font-bold text-slate-400">
                  <ShieldCheck className="w-4 h-4 mr-1" /> SECURED BY RAZORPAY (MOCK)
               </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentModal;
