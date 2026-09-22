import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import AgriCard from './AgriCard';

const StatCard = ({ label, value, icon: Icon, trend, prefix = '', suffix = '', delay = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(value);
    }, 400 + (delay * 800));
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <AgriCard className="relative overflow-hidden group border-[#D8DFD5] bg-white p-5" delay={delay}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold text-[#66736A] uppercase tracking-wider mb-1.5">{label}</p>
          <div className="flex items-baseline space-x-1">
            {prefix && <span className="text-xl font-bold text-[#66736A]">{prefix}</span>}
            <motion.h3 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-3xl font-black text-[#17201B] font-mono tracking-tight"
            >
              {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
            </motion.h3>
            {suffix && <span className="text-sm font-bold text-[#66736A]">{suffix}</span>}
          </div>
        </div>

        <div className="p-2.5 bg-[#E8EFE4] text-[#123C2A] rounded-xl border border-[#C5DBCC] shrink-0">
          {Icon ? <Icon className="w-5 h-5 text-[#2F7D4A]" /> : <TrendingUp className="w-5 h-5 text-[#2F7D4A]" />}
        </div>
      </div>

      {trend !== undefined && (
        <div className="mt-3 pt-3 border-t border-[#E8EFE4] flex items-center justify-between text-xs font-semibold">
          <div className={`flex items-center space-x-1 ${trend >= 0 ? 'text-[#2F7D4A]' : 'text-rose-600'}`}>
            {trend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{Math.abs(trend)}% {trend >= 0 ? 'growth' : 'variance'}</span>
          </div>
          <span className="text-[10px] text-[#66736A] uppercase tracking-wider">vs last cycle</span>
        </div>
      )}
    </AgriCard>
  );
};

export default StatCard;
