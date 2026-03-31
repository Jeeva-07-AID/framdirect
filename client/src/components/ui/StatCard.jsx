import React, { useState, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import GlassCard from './GlassCard';

const StatCard = ({ label, value, icon: Icon, trend, prefix = '', suffix = '', delay = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(value);
    }, 500 + (delay * 1000));
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <GlassCard className="relative overflow-hidden group" delay={delay}>
      <div className="absolute top-4 right-4 p-3 bg-slate-800/50 rounded-2xl border border-white/5 group-hover:scale-110 group-hover:bg-primary-500/10 group-hover:border-primary-500/30 transition-all duration-500">
        {Icon ? <Icon className="w-6 h-6 text-primary-500" /> : <TrendingUp className="w-6 h-6 text-primary-500" />}
      </div>

      <div className="flex flex-col space-y-2">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] leading-none mb-1">{label}</p>
        
        <div className="flex items-baseline space-x-1">
          {prefix && <span className="text-xl font-bold text-slate-400">{prefix}</span>}
          <motion.h3 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl font-black text-white tracking-tight"
          >
            {displayValue.toLocaleString()}
          </motion.h3>
          {suffix && <span className="text-lg font-bold text-slate-500">{suffix}</span>}
        </div>

        {trend !== undefined && (
          <div className={`flex items-center space-x-1.5 text-xs font-bold ${trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{Math.abs(trend)}% {trend >= 0 ? 'up from last month' : 'down from yesterday'}</span>
          </div>
        )}
      </div>

      {/* Decorative gradient */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary-500/5 blur-[50px] group-hover:bg-primary-500/10 transition-colors duration-500" />
    </GlassCard>
  );
};

export default StatCard;
