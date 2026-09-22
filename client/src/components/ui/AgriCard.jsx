import React from 'react';
import { motion } from 'framer-motion';

export const AgriCard = ({ children, className = '', hover = true, delay = 0, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={hover ? { 
        y: -2, 
        boxShadow: '0 10px 25px -5px rgba(18, 60, 42, 0.08), 0 8px 10px -6px rgba(18, 60, 42, 0.04)'
      } : {}}
      className={`
        bg-white 
        border border-[#D8DFD5] 
        rounded-2xl 
        p-6 
        shadow-[0_2px_8px_rgba(18,60,42,0.04)]
        transition-all 
        duration-200
        text-[#17201B]
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AgriCard;
