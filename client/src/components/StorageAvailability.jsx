import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Snowflake, Wind, Package, MapPin, Phone, Filter,
  ChevronDown, Loader2, Warehouse, AlertTriangle, CheckCircle, Search, X, ArrowRight, Brain, Thermometer, Clock
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getStorageFacilities, filterStorage } from '../services/storageService';
import GlassCard from './ui/GlassCard';
import ProgressBar from './ui/ProgressBar';
import AnimatedButton from './ui/AnimatedButton';

// ── AI Storage Recommendation Panel ──────────────────────────────────────────
const CROP_RISK = [
  { crop: 'Tomatoes',  risk: 'High',   shelfLife: '5-7 days',  bestStorage: 'cold',    temp: '10-13°C', icon: '🍅' },
  { crop: 'Potatoes',  risk: 'Low',    shelfLife: '3-5 weeks', bestStorage: 'dry',     temp: '7-10°C',  icon: '🥔' },
  { crop: 'Mangoes',   risk: 'High',   shelfLife: '2-5 days',  bestStorage: 'cold',    temp: '13-15°C', icon: '🥭' },
  { crop: 'Rice',      risk: 'Low',    shelfLife: '6+ months', bestStorage: 'dry',     temp: 'Ambient', icon: '🌾' },
  { crop: 'Spinach',   risk: 'Critical', shelfLife: '2-3 days', bestStorage: 'freezer', temp: '0-2°C',  icon: '🥬' },
  { crop: 'Onions',    risk: 'Medium', shelfLife: '2-4 weeks', bestStorage: 'dry',     temp: '3-5°C',   icon: '🧅' },
];
const RISK_COLOR = {
  Critical: 'rose', High: 'amber', Medium: 'blue', Low: 'emerald',
};

const SmartStorageAdvisor = () => {
  const [expanded, setExpanded] = useState(false);
  return (
    <GlassCard className="border-cyan-500/20 bg-cyan-500/5 relative overflow-hidden" delay={0}>
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 blur-3xl rounded-full pointer-events-none" />
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="p-2.5 bg-cyan-500/20 rounded-xl border border-cyan-500/30">
          <Brain className="w-5 h-5 text-cyan-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-black text-white uppercase tracking-tight">AI Storage Advisor</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Crop-specific risk & temperature guidance</p>
        </div>
        <button
          onClick={() => setExpanded(e => !e)}
          className="px-4 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 text-xs font-black uppercase tracking-widest rounded-xl transition-all"
        >
          {expanded ? 'Collapse' : 'View Guide'}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative z-10 overflow-hidden"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
              {CROP_RISK.map((c, i) => {
                const rc = RISK_COLOR[c.risk] || 'slate';
                return (
                  <motion.div
                    key={c.crop}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={`bg-slate-900/80 border border-${rc}-500/20 rounded-2xl p-4 text-center hover:border-${rc}-500/40 transition-all`}
                  >
                    <span className="text-2xl block mb-2">{c.icon}</span>
                    <p className="text-xs font-black text-white mb-1">{c.crop}</p>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg bg-${rc}-500/20 text-${rc}-400 border border-${rc}-500/30`}>
                      {c.risk} Risk
                    </span>
                    <div className="mt-3 space-y-1">
                      <p className="text-[9px] text-slate-500 flex items-center gap-1 justify-center">
                        <Clock className="w-2.5 h-2.5" />{c.shelfLife}
                      </p>
                      <p className="text-[9px] text-slate-500 flex items-center gap-1 justify-center">
                        <Thermometer className="w-2.5 h-2.5" />{c.temp}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="mt-4 p-4 bg-slate-900/60 rounded-2xl border border-white/5 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400 leading-relaxed">
                <span className="font-black text-amber-400">Pro Tip: </span>
                Leafy vegetables lose 40% of their nutritional value within 24 hours at room temperature.
                Book a cold storage node immediately after harvest for maximum quality preservation.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};


// ── helpers ──────────────────────────────────────────────────────────────────
const useTypeConfig = () => {
  const { t } = useTranslation();
  return {
    cold: {
      label: t('cold_storage'),
      Icon: Snowflake,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
    },
    freezer: {
      label: t('freezer_room'),
      Icon: Wind,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    dry: {
      label: t('dry_warehouse'),
      Icon: Package,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
  };
};

const getPct = (avail, total) => Math.round((avail / total) * 100);

// ── sub-components ───────────────────────────────────────────────────────────
const StorageCard = ({ facility, index }) => {
  const { t } = useTranslation();
  const TYPE_CONFIG = useTypeConfig();
  const cfg = TYPE_CONFIG[facility.type] || TYPE_CONFIG.dry;
  const pct = getPct(facility.available_capacity, facility.capacity);
  const low = pct < 20;

  return (
    <GlassCard className="group p-0 overflow-hidden flex flex-col h-full border-none" delay={index * 0.05}>
      {/* Decorative header */}
      <div className={`h-2 w-full ${cfg.bg.replace('/10', '/40')}`} />
      
      <div className="p-8 space-y-8 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className={`w-14 h-14 rounded-2xl ${cfg.bg} border ${cfg.border} flex items-center justify-center shrink-0 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-500`}>
              <cfg.Icon className={`w-7 h-7 ${cfg.color}`} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter leading-none truncate mb-2">{facility.name}</h3>
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 ${cfg.color}`}>{cfg.label}</span>
            </div>
          </div>

          {low && (
            <motion.div 
               animate={{ opacity: [0.5, 1, 0.5] }} 
               transition={{ duration: 2, repeat: Infinity }}
               className="shrink-0 inline-flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-[0_0_15px_rgba(244,63,94,0.2)]"
            >
              <AlertTriangle className="w-3 h-3" />
              Critical
            </motion.div>
          )}
        </div>

        {/* Location */}
        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center space-x-3 group-hover:bg-white/10 transition-colors">
          <MapPin className="w-4 h-4 text-slate-500" />
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{facility.location}</p>
        </div>

        {/* Capacity */}
        <div className="px-2">
           <ProgressBar 
              progress={pct} 
              label="Operational Capacity" 
              color={pct < 20 ? '#f43f5e' : pct < 50 ? '#f59e0b' : '#10b981'} 
           />
           <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em] text-right mt-3">
              {facility.available_capacity} / {facility.capacity} Metric Tons
           </p>
        </div>

        {/* Rate Grid */}
        <div className="grid grid-cols-2 gap-4 mt-auto">
          <div className="bg-white/5 p-5 rounded-2xl border border-white/5 group-hover:border-white/10 transition-colors">
            <p className="text-[9px] uppercase tracking-widest text-slate-600 font-bold mb-2">Daily Rate</p>
            <p className="text-white font-black text-2xl italic tracking-tighter">₹{facility.price_per_day}</p>
          </div>
          <div className="bg-white/5 p-5 rounded-2xl border border-white/5 group-hover:border-white/10 transition-colors text-right capitalize">
            <p className="text-[9px] uppercase tracking-widest text-slate-600 font-bold mb-2">Total Node</p>
            <p className="text-white font-black text-2xl italic tracking-tighter">{facility.capacity}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-white/5 flex items-center justify-between gap-4">
          <a
            href={`tel:${facility.contact}`}
            className="flex items-center gap-3 text-slate-500 hover:text-white transition-all group/call"
          >
            <div className="p-2 bg-white/5 rounded-lg group-hover/call:bg-primary-500/20 transition-colors">
               <Phone className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">{facility.contact}</span>
          </a>
          <AnimatedButton
            variant="outline"
            className="px-6 py-3 rounded-xl border-none bg-white/5 text-[10px]"
            onClick={() => alert('Accessing facility reservation protocol...')}
            disabled={facility.available_capacity === 0}
            icon={ArrowRight}
          >
            Deploy
          </AnimatedButton>
        </div>
      </div>
    </GlassCard>
  );
};

// ── main component ────────────────────────────────────────────────────────────
const StorageAvailability = () => {
  const { t } = useTranslation();
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [locationSearch, setLocationSearch] = useState('');
  const [sortBy, setSortBy] = useState('available');

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const data = await getStorageFacilities();
      setFacilities(data || []);
    } catch (err) {
      console.warn('Storage data warning:', err.message);
      setFacilities([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = [...facilities];
    if (typeFilter !== 'all') list = list.filter(f => f.type === typeFilter);
    if (locationSearch.trim()) {
      list = list.filter(f =>
        f.location.toLowerCase().includes(locationSearch.toLowerCase()) ||
        f.name.toLowerCase().includes(locationSearch.toLowerCase())
      );
    }
    if (sortBy === 'price') list.sort((a, b) => a.price_per_day - b.price_per_day);
    else if (sortBy === 'capacity') list.sort((a, b) => b.available_capacity - a.available_capacity);
    else list.sort((a, b) => (b.available_capacity / b.capacity) - (a.available_capacity / a.capacity));
    return list;
  }, [facilities, typeFilter, locationSearch, sortBy]);

  const types = [
    { value: 'all', label: 'All Clusters', icon: Warehouse },
    { value: 'cold', label: 'Cold-Chain', icon: Snowflake },
    { value: 'freezer', label: 'Cryo-Freezer', icon: Wind },
    { value: 'dry', label: 'Structural-Dry', icon: Package },
  ];

  const stats = {
    total: facilities.length,
    totalCap: facilities.reduce((s, f) => s + Number(f.available_capacity), 0),
    avgPrice: facilities.length
      ? Math.round(facilities.reduce((s, f) => s + Number(f.price_per_day), 0) / facilities.length)
      : 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* AI Advisor Panel */}
      <SmartStorageAdvisor />

      {/* Dynamic Statistics Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <GlassCard className="lg:col-span-1 p-10 flex flex-col justify-center border-l-4 border-l-primary-500/50" delay={0}>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Storage Network Monitoring</p>
              <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Global Infrastructure</h2>
              <p className="text-slate-500 text-sm mt-4 font-medium leading-relaxed">
                 Accessing high-capacity decentralized storage nodes for agricultural optimization.
              </p>
         </GlassCard>

         <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 flex flex-col justify-center">
               <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Active Nodes</p>
               <p className="text-4xl font-black text-white italic tracking-tight">{stats.total}</p>
            </div>
            <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 flex flex-col justify-center">
               <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Net Capacity</p>
               <div className="flex items-baseline space-x-2">
                 <p className="text-4xl font-black text-primary-500 italic tracking-tight">{stats.totalCap}</p>
                 <span className="text-xs font-bold text-slate-600 uppercase">MT</span>
               </div>
            </div>
            <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 flex flex-col justify-center col-span-2 md:col-span-1">
               <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Market Index</p>
               <p className="text-4xl font-black text-amber-500 italic tracking-tight">₹{stats.avgPrice}</p>
            </div>
         </div>
      </div>

      {/* Control Panel */}
      <GlassCard className="p-6 border-none overflow-visible" delay={0.1}>
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          {/* Type Filters */}
          <div className="flex flex-wrap bg-slate-950/40 p-1.5 rounded-2xl border border-white/5 items-center gap-1.5">
            {types.map(t_item => {
              const Icon = t_item.icon;
              return (
                <button
                  key={t_item.value}
                  onClick={() => setTypeFilter(t_item.value)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                    typeFilter === t_item.value
                      ? 'bg-primary-500 text-slate-950 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                      : 'text-slate-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t_item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search & Sort Container */}
          <div className="flex flex-col sm:flex-row flex-1 gap-4 w-full">
            <div className="relative flex-1 group">
              <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-5 text-slate-600 group-focus-within:text-primary-500 transition-colors pointer-events-none" />
              <input
                type="text"
                placeholder="Query Terminal Node..."
                value={locationSearch}
                onChange={e => setLocationSearch(e.target.value)}
                className="w-full bg-slate-950/40 border border-white/5 text-white pl-12 pr-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest placeholder-slate-700 focus:outline-none focus:border-primary-500 transition-all"
              />
            </div>

            <div className="relative min-w-[220px]">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full appearance-none bg-slate-950/40 border border-white/5 text-slate-500 font-black text-[10px] uppercase tracking-widest px-6 py-3.5 rounded-2xl focus:outline-none focus:border-primary-500 cursor-pointer transition-all italic transition-all"
              >
                <option value="available">Optimize Availability</option>
                <option value="price">Sort by Valuation</option>
                <option value="capacity">Max Payload Capacity</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-600 absolute top-1/2 -translate-y-1/2 right-5 pointer-events-none" />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Network Results Grid */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-32 flex flex-col items-center justify-center text-slate-700"
          >
            <div className="relative mb-8">
               <div className="w-16 h-16 border-4 border-primary-500/10 border-t-primary-500 rounded-full animate-spin" />
               <Warehouse className="w-6 h-6 text-primary-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="font-black uppercase tracking-[0.5em] text-xs">Pinging Storage Nodes...</p>
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-40 text-center flex flex-col items-center justify-center"
          >
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/5">
               <Warehouse className="w-10 h-10 text-slate-800" />
            </div>
            <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-sm">Cluster Data Unavailable</p>
            <AnimatedButton 
               variant="outline" 
               className="mt-8 scale-75 opacity-50"
               onClick={() => { setTypeFilter('all'); setLocationSearch(''); }}
            >
               Reset Uplink
            </AnimatedButton>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filtered.map((facility, i) => (
              <StorageCard key={facility.id} facility={facility} index={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Meta */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-center space-x-4 pt-12 pb-20 opacity-20">
           <div className="h-px w-20 bg-gradient-to-r from-transparent to-slate-500" />
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.5em]">
              Network End-of-Stream / {filtered.length} Nodes Resolved
           </p>
           <div className="h-px w-20 bg-gradient-to-l from-transparent to-slate-500" />
        </div>
      )}
    </div>
  );
};

export default StorageAvailability;
