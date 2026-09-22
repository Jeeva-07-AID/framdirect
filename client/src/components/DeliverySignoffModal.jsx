import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ShieldCheck, Star, X, Truck, Package, Award, Sparkles, KeyRound } from 'lucide-react';
import { supplyChainService } from '../services/supplyChainService';
import { notifySuccess } from '../services/notificationService';

export const DeliverySignoffModal = ({ isOpen, onClose, shipment, onSignedOff }) => {
  const [otpInput, setOtpInput] = useState('849201');
  const [rating, setRating] = useState(5);
  const [qcConfirmed, setQcConfirmed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentShipment = shipment || supplyChainService.getActiveShipment();
  const totalQty = currentShipment?.totalQuantityKg || 2000;

  const handleConfirmSignoff = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      supplyChainService.completeDeliverySignoff(currentShipment?.id, {
        otpCode: otpInput,
        qcScore: '98.6% Grade A Acceptance',
        buyerRating: rating
      });
      setIsSubmitting(false);
      notifySuccess('Delivery Digitally Signed & Accepted! Escrow Farmgate Payments Released to Farmers.');
      if (onSignedOff) onSignedOff();
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl bg-slate-950 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_20px_80px_rgba(16,185,129,0.3)] relative overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/40 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-wider">
                  Custody Handshake
                </span>
                <span className="text-xs font-mono text-slate-400">{currentShipment?.id || 'SHP-9842'}</span>
              </div>
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tight mt-0.5">
                Delivery Sign-Off & Acceptance
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Consignment Overview */}
        <div className="my-5 p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold uppercase tracking-wider">Product & Total Quantity:</span>
            <span className="text-white font-black font-mono">{currentShipment?.crop || 'Tomato'} • {totalQty.toLocaleString()} kg Grade A</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold uppercase tracking-wider">Receiving Hub:</span>
            <span className="text-emerald-400 font-bold">Chennai Central Fulfillment Terminal</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold uppercase tracking-wider">Multi-Supplier Pool:</span>
            <span className="text-slate-200">Farmer A (700kg), Farmer B (500kg), FPO C (800kg)</span>
          </div>
        </div>

        {/* Inspection & OTP Checklist */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <KeyRound className="w-4 h-4 text-cyan-400" />
              Delivery Verification OTP
            </label>
            <input
              type="text"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-lg font-mono font-black text-cyan-400 tracking-widest text-center focus:border-cyan-500 outline-none"
            />
            <p className="text-[10px] text-slate-400 mt-1 text-center">Simulated OTP provided to driver by Buyer at dockside</p>
          </div>

          {/* Optical QC Checklist */}
          <div 
            onClick={() => setQcConfirmed(!qcConfirmed)}
            className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 cursor-pointer hover:bg-emerald-500/15 transition-all"
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${qcConfirmed ? 'bg-emerald-500 text-slate-950' : 'border border-slate-600'}`}>
              {qcConfirmed && '✓'}
            </div>
            <div>
              <p className="text-xs font-bold text-white">Quality Inspection Clearance (98.6% Grade A Pass)</p>
              <p className="text-[10px] text-slate-400">Zero transit spoilage. Temperature held at 11.4°C optimal throughout transit.</p>
            </div>
          </div>

          {/* 5-Star Rating */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Supplier & Fleet Rating:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  onClick={() => setRating(star)}
                  className={`w-5 h-5 cursor-pointer transition-colors ${
                    star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmSignoff}
            disabled={isSubmitting}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/30 hover:opacity-95 transition-all cursor-pointer flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isSubmitting ? 'Finalizing Handshake...' : 'Confirm Delivery & Release Payouts'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default DeliverySignoffModal;
