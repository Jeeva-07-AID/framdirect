import React from 'react';
import { motion } from 'framer-motion';

const AnimatedButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '', 
  disabled = false,
  icon: Icon
}) => {
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-600/20 border-primary-500/50',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700',
    outline: 'bg-transparent border-slate-700 text-slate-300 hover:border-primary-500 hover:text-primary-400',
    danger: 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-500 border-rose-500/30',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-8 py-4 
        rounded-2xl 
        font-bold 
        text-sm 
        tracking-widest 
        uppercase 
        border 
        transition-all 
        duration-300 
        flex items-center 
        justify-center
        disabled:opacity-50 
        disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
    >
      {Icon && <Icon className="w-5 h-5 mr-3 shrink-0" />}
      {children}
    </motion.button>
  );
};

export default AnimatedButton;
