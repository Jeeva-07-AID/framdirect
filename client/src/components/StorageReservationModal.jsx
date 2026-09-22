import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Warehouse, Calendar, Clock, Package, X, CheckCircle, ShieldCheck, Thermometer } from 'lucide-react';
import { saveStorageReservation } from '../services/pipelineService';
import { notifySuccess } from '../services/notificationService';
import AnimatedButton from './ui/AnimatedButton';
import GlassCard from './ui/GlassCard';

const StorageReservationModal = ({ facility, isOpen, onClose, onReserved }) => {
  const [crop, setCrop] = useState('Fresh Tomatoes');
  const [quantityTons, setQuantityTons] = useState(2);
  const [durationDays, setDurationDays] = useState(7);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !facility) return null;

  const dailyRate = facility.price_per_day || 120;
  const estimatedCost = dailyRate * quantityTons * durationDays;

  const handleConfirm = (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const reservation = saveStorageReservation({
        facilityId: facility.id,
        facilityName: facility.name,
        facilityLocation: facility.location,
        facilityType: facility.type,
        crop,
        quantityTons: Number(quantityTons),
        durationDays: Number(durationDays),
        startDate,
        totalCost: estimatedCost,
        allocatedBay: `Bay #${String.fromCharCode(65 + Math.floor(Math.random() * 6))}-${Math.floor(Math.random() * 20 + 1)}`
      });

      notifySuccess('Storage Reserved! ❄️', `Allocated ${quantityTons} Tons at ${facility.name}. Safety protocol active.`);
      if (onReserved) onReserved(reservation);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg"
      >
        <GlassCard className="p-0 overflow-hidden border border-cyan-500/30 shadow-[0_25px_60px_-15px_rgba(6,182,212,0.3)]" delay={0}>
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex justify-between items-start bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-500/20 rounded-xl border border-cyan-500/30">
                <Warehouse className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Storage Deployment</span>
                <h3 className="text-xl font-black text-white italic uppercase tracking-tight">{facility.name}</h3>
                <p className="text-[10px] text-slate-400">{facility.location} • {facility.type?.toUpperCase()} NODE</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleConfirm} className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Crop Type</label>
                <select
                  value={crop}
                  onChange={e => setCrop(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition-colors"
                >
                  <option value="Fresh Tomatoes">🍅 Tomatoes (Cold Chain 10-13°C)</option>
                  <option value="Organic Potatoes">🥔 Potatoes (Dry Storage 7-10°C)</option>
                  <option value="Alphonso Mangoes">🥭 Mangoes (Refrigerated 13-15°C)</option>
                  <option value="Red Onions">🧅 Onions (Ventilated Dry 3-5°C)</option>
                  <option value="Leafy Spinach">🥬 Spinach (Cryo / Freezer 0-2°C)</option>
                  <option value="Basmati Rice">🌾 Basmati Rice (Ambient Silo)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Quantity (Tons)</label>
                  <input
                    type="number"
                    min="0.5"
                    max={facility.available_capacity || 100}
                    step="0.5"
                    value={quantityTons}
                    onChange={e => setQuantityTons(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition-colors font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={durationDays}
                    onChange={e => setDurationDays(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition-colors font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Expected Entry Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition-colors font-bold"
                  required
                />
              </div>
            </div>

            {/* Cost breakdown summary */}
            <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Daily Rate per Ton:</span>
                <span className="font-bold text-white">₹{dailyRate}/day</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Calculated Volume:</span>
                <span className="font-bold text-white">{quantityTons} Tons × {durationDays} Days</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-cyan-500/20">
                <span className="text-xs font-black uppercase text-cyan-400 tracking-wider">Estimated Fee:</span>
                <span className="text-2xl font-black text-white italic">₹{estimatedCost.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
              <AnimatedButton
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 rounded-xl text-xs"
              >
                Confirm Allocation
              </AnimatedButton>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default StorageReservationModal;
