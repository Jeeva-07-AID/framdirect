import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hover = true, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { 
        y: -5, 
        backgroundColor: 'rgba(30, 41, 59, 0.6)',
        borderColor: 'rgba(34, 197, 94, 0.4)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)'
      } : {}}
      className={`
        bg-slate-900/40 
        backdrop-blur-xl 
        border border-slate-700/50 
        rounded-[2rem] 
        p-6 
        shadow-2xl 
        transition-colors 
        duration-300
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
