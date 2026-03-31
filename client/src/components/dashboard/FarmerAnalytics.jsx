import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Loader2, TrendingUp, DollarSign, RefreshCcw, Activity, Brain, Zap, BarChart3, ArrowUpRight, ArrowDownRight, Lightbulb } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { getFarmerMetrics } from '../../services/analyticsService';
import { getTrendingCrops, getAIInsights, getSmartPriceSuggestion, getCropSuggestions } from '../../services/marketService';
import StatCard from '../ui/StatCard';
import GlassCard from '../ui/GlassCard';
import AnimatedButton from '../ui/AnimatedButton';

const DEMAND_COLOR = { High: 'emerald', 'Very High': 'blue', Peak: 'amber', Medium: 'slate', Stable: 'slate' };
const PRIORITY_COLOR = { high: 'rose', medium: 'amber', low: 'cyan' };

const FarmerAnalytics = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [data, setData] = useState({ metrics: {}, chartData: [] });
  const [loading, setLoading] = useState(true);
  const [trendingCrops, setTrendingCrops] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [cropSuggestions, setCropSuggestions] = useState([]);
  const [priceQuery, setPriceQuery] = useState('');
  const [priceResult, setPriceResult] = useState(null);
  const [priceFetching, setPriceFetching] = useState(false);
  const [activeTab, setActiveTab] = useState('earnings');

  const [marketPrices, setMarketPrices] = useState([
    { item: 'Tomato', curr: 40, trend: 5 },
    { item: 'Onion',  curr: 30, trend: -2 },
    { item: 'Potato', curr: 25, trend: 1 },
    { item: 'Wheat',  curr: 45, trend: 0 },
  ]);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [metrics, crops, insights, suggestions] = await Promise.all([
          getFarmerMetrics(),
          getTrendingCrops(),
          getAIInsights(user?.id),
          getCropSuggestions(),
        ]);
        setData(metrics);
        setTrendingCrops(crops.slice(0, 4));
        setAiInsights(insights);
        setCropSuggestions(suggestions.slice(0, 3));
      } catch (err) {
        console.error('Analytics load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();

    const priceInterval = setInterval(() => {
      setMarketPrices(prev => prev.map(p => ({
        ...p,
        curr: Math.max(10, p.curr + (Math.random() - 0.5) * 4),
        trend: parseFloat((Math.random() * 10 - 5).toFixed(1)),
      })));
    }, 8000);
    return () => clearInterval(priceInterval);
  }, [user?.id]);

  const handlePriceAnalysis = async () => {
    if (!priceQuery.trim()) return;
    setPriceFetching(true);
    setPriceResult(null);
    try {
      const result = await getSmartPriceSuggestion(priceQuery, 40);
      setPriceResult(result);
    } catch {
      setPriceResult({ error: 'Analysis failed. Try again.' });
    } finally {
      setPriceFetching(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
      <p className="text-slate-500 font-black uppercase tracking-widest text-xs animate-pulse">Initializing AI Engine...</p>
    </div>
  );

  return (
    <div className="space-y-8">

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Earnings"   value={data.metrics.totalEarnings || 0}   prefix="₹" icon={DollarSign}  trend={12}  delay={0}   />
        <StatCard label="Today's Earnings" value={data.metrics.todayEarnings || 0}   prefix="₹" icon={Activity}    trend={-5}  delay={0.1} />
        <StatCard label="Weekly Sales"     value={data.metrics.weeklyEarnings || 0}  prefix="₹" icon={TrendingUp}  trend={8}   delay={0.2} />
        <StatCard label="Monthly Revenue"  value={data.metrics.monthlyEarnings || 0} prefix="₹" icon={BarChart3}   trend={3}   delay={0.3} />
      </div>

      {/* AI Insights Banner */}
      <GlassCard className="relative overflow-hidden border-cyan-500/20 bg-cyan-500/5" delay={0.35}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="p-2.5 bg-cyan-500/20 rounded-xl border border-cyan-500/30">
            <Brain className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">AI Market Intelligence</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Powered by seasonal demand analysis</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Live</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          {aiInsights.map((insight, i) => {
            const pc = PRIORITY_COLOR[insight.priority] || 'slate';
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`bg-white/5 border border-${pc}-500/20 rounded-2xl p-5 hover:bg-white/10 transition-all`}
              >
                <div className="text-2xl mb-3">{insight.icon}</div>
                <p className={`text-[10px] font-black text-${pc}-400 uppercase tracking-widest mb-1`}>{insight.title}</p>
                <p className="text-sm text-slate-300 leading-relaxed">{insight.message}</p>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>

      {/* Charts + Market Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart tabs */}
        <div className="lg:col-span-2">
          <GlassCard className="h-full" delay={0.4}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Revenue Stream</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Daily earnings from all sources</p>
              </div>
              <div className="flex gap-2">
                {['earnings', 'sales'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      activeTab === tab ? 'bg-emerald-500 text-slate-900' : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                {activeTab === 'earnings' ? (
                  <AreaChart data={data.chartData}>
                    <defs>
                      <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#ffffff05" />
                    <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} dx={-10} />
                    <Tooltip contentStyle={{ background: 'rgba(2,6,23,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, color: '#fff' }} itemStyle={{ color: '#10b981', fontWeight: 900, fontSize: 10 }} />
                    <Area type="monotone" dataKey="dailyEarnings" stroke="#10b981" strokeWidth={3} fill="url(#earningsGrad)" animationDuration={1500} />
                  </AreaChart>
                ) : (
                  <BarChart data={data.chartData}>
                    <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#ffffff05" />
                    <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} dx={-10} />
                    <Tooltip contentStyle={{ background: 'rgba(2,6,23,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, color: '#fff' }} itemStyle={{ color: '#6366f1', fontWeight: 900, fontSize: 10 }} />
                    <Bar dataKey="sales" fill="#6366f1" radius={[6, 6, 0, 0]} animationDuration={1500} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Live Market Pulse */}
        <GlassCard className="flex flex-col" delay={0.5}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Live Pulse</h3>
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping shadow-[0_0_12px_#10b981]" />
          </div>
          <ul className="space-y-3 flex-1">
            <AnimatePresence>
              {marketPrices.map(mp => (
                <motion.li layout key={mp.item} className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{mp.item}</p>
                    <p className="text-lg font-black text-white">₹{mp.curr.toFixed(0)}/kg</p>
                  </div>
                  <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-black ${mp.trend >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                    {mp.trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {mp.trend >= 0 ? '+' : ''}{mp.trend.toFixed(1)}%
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </GlassCard>
      </div>

      {/* Trending Crops + Crop Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trending Crops */}
        <GlassCard delay={0.6}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-amber-500/20 rounded-xl border border-amber-500/30">
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Trending Crops</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Market demand index</p>
            </div>
          </div>
          <div className="space-y-3">
            {trendingCrops.map((crop, i) => {
              const dc = DEMAND_COLOR[crop.demand] || 'slate';
              return (
                <motion.div
                  key={crop.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-amber-500/20 transition-all group"
                >
                  <span className="text-2xl">{crop.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-white truncate">{crop.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{crop.reason}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase bg-${dc}-500/20 text-${dc}-400 border border-${dc}-500/30`}>
                      {crop.demand}
                    </span>
                    <span className="text-[10px] font-black text-emerald-400">×{crop.priceIndex}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </GlassCard>

        {/* Crop Suggestions + Smart Price */}
        <div className="space-y-4">
          <GlassCard delay={0.65}>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-purple-500/20 rounded-xl border border-purple-500/30">
                <Lightbulb className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-tight">AI Crop Suggestions</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">High-return opportunities</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {cropSuggestions.map((s, i) => (
                <motion.div
                  key={s.crop}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start justify-between gap-3 bg-white/5 p-3.5 rounded-xl border border-white/5 hover:border-purple-500/20 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-white">{s.crop}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{s.reason}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-black text-emerald-400">{s.expectedReturn}</p>
                    <p className={`text-[9px] font-bold ${s.riskLevel === 'Low' ? 'text-emerald-500' : 'text-amber-500'}`}>{s.riskLevel} Risk</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          {/* Smart Price Widget */}
          <GlassCard delay={0.7} className="border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-tight">Smart Price Advisor</h3>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={priceQuery}
                onChange={e => setPriceQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePriceAnalysis()}
                placeholder="Enter crop name..."
                className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-emerald-500 transition-all"
              />
              <AnimatedButton
                className="px-4 py-2 rounded-xl text-xs"
                onClick={handlePriceAnalysis}
              >
                {priceFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyze'}
              </AnimatedButton>
            </div>
            <AnimatePresence>
              {priceResult && !priceResult.error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 bg-slate-900/80 rounded-xl border border-emerald-500/20"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Suggested Price</span>
                    <span className={`text-[10px] font-black uppercase ${priceResult.trend === 'up' ? 'text-emerald-400' : priceResult.trend === 'down' ? 'text-rose-400' : 'text-blue-400'}`}>
                      {priceResult.trend === 'up' ? '📈 Rising' : priceResult.trend === 'down' ? '📉 Falling' : '➡️ Stable'}
                    </span>
                  </div>
                  <p className="text-2xl font-black text-white">₹{priceResult.suggestedPrice}/kg</p>
                  <p className="text-[11px] text-slate-400 mt-1">{priceResult.reason}</p>
                  <p className="text-[9px] text-slate-600 mt-1 uppercase tracking-widest">Confidence: {priceResult.confidence}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default FarmerAnalytics;
