import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ProgressBar = ({ progress, label, color = '#22c55e', height = 'h-3', showValue = true }) => {
  return (
    <div className="w-full space-y-3">
      {label && (
        <div className="flex justify-between items-end px-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
          {showValue && <p className="text-sm font-black text-white">{Math.round(progress)}%</p>}
        </div>
      )}
      <div className={`w-full ${height} bg-slate-800/50 rounded-full border border-white/5 overflow-hidden p-0.5`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.5, ease: "circOut" }}
          style={{ backgroundColor: color }}
          className="h-full rounded-full shadow-[0_0_15px_rgba(34,197,94,0.3)] relative"
        >
          {/* Shimmer effect */}
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressBar;
