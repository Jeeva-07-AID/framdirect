import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Sprout, ShoppingCart, Cpu, Users, Route, Warehouse,
  Truck, CheckCircle, Receipt, ArrowRight, ArrowLeft, Play, Pause, RotateCcw,
  X, MapPin, ShieldCheck, Thermometer, Clock, Phone, Sparkles, AlertTriangle,
  Flame, Award, Layers
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { INITIAL_PIPELINE_STATE } from '../../services/pipelineService';
import { supplyChainService } from '../../services/supplyChainService';
import { notifySuccess } from '../../services/notificationService';
import GlassCard from '../ui/GlassCard';
import AnimatedButton from '../ui/AnimatedButton';

const STAGES = [
  { id: 1, label: 'Demand Forecast', icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/20' },
  { id: 2, label: 'Harvest Planning', icon: Sprout, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  { id: 3, label: 'Buyer Requirement', icon: ShoppingCart, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  { id: 4, label: 'Smart Matching', icon: Cpu, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  { id: 5, label: 'Multi-Farmer Fulfillment', icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/20' },
  { id: 6, label: 'Route Optimization', icon: Route, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  { id: 7, label: 'Cold Storage', icon: Warehouse, color: 'text-teal-400', bg: 'bg-teal-500/20' },
  { id: 8, label: 'Live Telemetry', icon: Truck, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  { id: 9, label: 'Delivery Sign-off', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20' },
  { id: 10, label: 'Transparent Pricing', icon: Receipt, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
];

const AgriPipelineModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [pipelineState, setPipelineState] = useState(INITIAL_PIPELINE_STATE);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(3500); // 3.5s per step
  const autoPlayTimerRef = useRef(null);

  // Auto-play timer
  useEffect(() => {
    if (isPlaying && isOpen) {
      autoPlayTimerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= 10) {
            setIsPlaying(false);
            return 10;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    } else {
      clearInterval(autoPlayTimerRef.current);
    }
    return () => clearInterval(autoPlayTimerRef.current);
  }, [isPlaying, isOpen, playbackSpeed]);

  if (!isOpen) return null;

  const currentStageInfo = STAGES.find(s => s.id === currentStep);

  const handleNext = () => {
    if (currentStep < 10) setCurrentStep(s => s + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(s => s - 1);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(1);
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-2 sm:p-6 bg-slate-950/90 backdrop-blur-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-6xl h-[92vh] flex flex-col bg-slate-950 border border-emerald-500/30 rounded-3xl shadow-[0_30px_100px_rgba(16,185,129,0.25)] overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 bg-slate-900/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-2xl text-slate-950 shadow-lg shadow-emerald-500/20">
              <Layers className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[9px] font-black uppercase tracking-widest text-emerald-400">
                  SIH Demo Scenario Engine
                </span>
                <span className="text-[10px] text-slate-400 font-bold">Stage {currentStep} of 10</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white italic uppercase tracking-tight">
                FarmDirect End-to-End Pipeline
              </h2>
            </div>
          </div>

          {/* Simulation Controls */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              onClick={() => setIsPlaying(p => !p)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                isPlaying ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              {isPlaying ? 'Pause Auto-Run' : 'Run Auto Demo'}
            </button>
            <button
              onClick={handleReset}
              className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
              title="Reset to Step 1"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 10-Stage Breadcrumbs Ribbon */}
        <div className="bg-slate-900/90 border-b border-white/5 px-4 py-3 overflow-x-auto scrollbar-none flex items-center gap-2 shrink-0">
          {STAGES.map((st) => {
            const isCurrent = st.id === currentStep;
            const isCompleted = st.id < currentStep;
            const Icon = st.icon;
            return (
              <button
                key={st.id}
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStep(st.id);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : isCompleted
                    ? 'bg-white/5 text-emerald-400 hover:bg-white/10'
                    : 'bg-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black ${isCurrent ? 'bg-slate-950 text-emerald-400' : isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                  {st.id}
                </div>
                <span className="hidden md:inline">{st.label}</span>
              </button>
            );
          })}
        </div>

        {/* Stage Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="max-w-5xl mx-auto space-y-6"
            >
              {/* Stage Headline Banner */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 p-5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${currentStageInfo.bg} ${currentStageInfo.color}`}>
                    <currentStageInfo.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">Stage {currentStep} of 10</span>
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">{currentStageInfo.label}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest rounded-xl">
                    Live Verified State
                  </span>
                </div>
              </div>

              {/* ──────── STAGE 1: DEMAND FORECAST ──────── */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
                      <p className="text-[10px] font-black uppercase text-amber-400 tracking-widest mb-1">Target Crop</p>
                      <h4 className="text-2xl font-black text-white">{pipelineState.forecast.crop}</h4>
                      <p className="text-xs text-slate-400 mt-1">{pipelineState.forecast.category} • Grade A</p>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
                      <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest mb-1">Projected Demand Spike</p>
                      <h4 className="text-3xl font-black text-emerald-400 italic">{pipelineState.forecast.projectedDemandSpike}</h4>
                      <p className="text-xs text-slate-400 mt-1">{pipelineState.forecast.demandConfidence}</p>
                    </div>
                    <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-5">
                      <p className="text-[10px] font-black uppercase text-cyan-400 tracking-widest mb-1">Current Farmgate Index</p>
                      <h4 className="text-3xl font-black text-white italic">₹{pipelineState.forecast.currentMarketPrice}/kg</h4>
                      <p className="text-xs text-slate-400 mt-1">Expected Peak: ₹40/kg in 4-6 weeks</p>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="p-6 bg-slate-900/60 rounded-3xl border border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-black uppercase tracking-wider text-white">Historical & Projected Demand Matrix</h4>
                        <p className="text-[10px] text-slate-400">Weekly order volume vs projected market price (₹/kg)</p>
                      </div>
                      <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
                        Peak Approaching
                      </span>
                    </div>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={pipelineState.forecast.historicalWeeklyTrend}>
                          <defs>
                            <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#ffffff08" />
                          <XAxis dataKey="week" stroke="#64748b" tick={{ fontSize: 10, fontWeight: 700 }} />
                          <YAxis stroke="#64748b" tick={{ fontSize: 10, fontWeight: 700 }} />
                          <Tooltip contentStyle={{ background: '#020617', border: '1px solid #334155', borderRadius: '12px' }} />
                          <Area type="monotone" dataKey="demand" stroke="#f59e0b" strokeWidth={3} fill="url(#demandGrad)" name="Demand Volume Index" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Deficit Alert */}
                  <div className="p-4 bg-slate-900 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-white">High Regional Deficit Identified</p>
                        <p className="text-[10px] text-slate-400">{pipelineState.forecast.deficitRegions.join(' • ')} are reporting 35-50% inventory shortages.</p>
                      </div>
                    </div>
                    <button
                      onClick={handleNext}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      Plan Harvest From Forecast →
                    </button>
                  </div>
                </div>
              )}

              {/* ──────── STAGE 2: HARVEST PLANNING ──────── */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="p-6 bg-slate-900/60 rounded-3xl border border-emerald-500/20 space-y-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Registered Cultivation Plan</span>
                        <h4 className="text-2xl font-black text-white italic">{pipelineState.harvestPlan?.farmerName || 'Ravi Teja Farms (Farmer A)'}</h4>
                        <p className="text-xs text-slate-400">{pipelineState.harvestPlan?.location || 'Trichy Rural Cluster'}</p>
                      </div>
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-black uppercase">
                        {pipelineState.harvestPlan?.status || 'Scheduled & Verified'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block mb-1">Acreage</span>
                        <span className="text-xl font-black text-white">{pipelineState.harvestPlan?.plannedAcreage || 3.5} Acres</span>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block mb-1">Expected Yield</span>
                        <span className="text-xl font-black text-emerald-400">{pipelineState.harvestPlan?.expectedYieldKg || pipelineState.harvestPlan?.upcomingHarvestKg || 500} kg</span>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block mb-1">Harvest Window</span>
                        <span className="text-xs font-black text-white">{pipelineState.harvestPlan?.harvestDate || '2026-09-24'}</span>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block mb-1">Storage Requirement</span>
                        <span className="text-xs font-black text-cyan-400">{pipelineState.harvestPlan?.storageRequirement || 'Cold Chain (10-13°C)'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Warehouse className="w-5 h-5 text-cyan-400" />
                      <div>
                        <p className="text-xs font-bold text-white">Cold Chain Node Auto-Linked</p>
                        <p className="text-[10px] text-slate-400">Pre-allocated cold storage to avoid post-harvest heat degradation.</p>
                      </div>
                    </div>
                    <button
                      onClick={handleNext}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      Receive Buyer Requirement →
                    </button>
                  </div>
                </div>
              )}

              {/* ──────── STAGE 3: BUYER REQUIREMENT ──────── */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="p-6 bg-slate-900/60 rounded-3xl border border-blue-500/20 space-y-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Procurement Order Requisition</span>
                        <h4 className="text-2xl font-black text-white italic">{pipelineState.buyerRequirement?.buyerName || 'FreshBasket Supermarkets Ltd.'}</h4>
                        <p className="text-xs text-slate-400">Manager: {pipelineState.buyerRequirement?.procurementManager || 'Anita Desai'} • Destination: {pipelineState.buyerRequirement?.deliveryHub || 'Chennai Central Terminal'}</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-black uppercase">
                        Bulk Contract
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Required Quantity</span>
                        <span className="text-3xl font-black text-white italic">{pipelineState.buyerRequirement?.requiredQuantityKg || 2000} kg</span>
                        <p className="text-[10px] text-amber-400 mt-2 font-bold">⚠️ Exceeds single farm yield (700kg)</p>
                      </div>
                      <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Max Budget Valuation</span>
                        <span className="text-3xl font-black text-emerald-400 italic">₹{pipelineState.buyerRequirement?.maxBudgetPerKg || 40}/kg</span>
                        <p className="text-[10px] text-slate-400 mt-2">Total Ceiling: ₹{((pipelineState.buyerRequirement?.requiredQuantityKg || 2000) * (pipelineState.buyerRequirement?.maxBudgetPerKg || 40)).toLocaleString()}</p>
                      </div>
                      <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Quality Benchmark</span>
                        <span className="text-base font-black text-white block mt-1">{pipelineState.buyerRequirement?.qualityGrade || 'Grade A'}</span>
                        <p className="text-[10px] text-slate-400 mt-2">Required by: {pipelineState.buyerRequirement?.requiredByDate || '2026-09-25'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Consolidation Triggered</p>
                      <p className="text-[10px] text-slate-400">Buyer needs {pipelineState.buyerRequirement?.requiredQuantityKg || 2000} kg. Initiating Smart Matching to pool high-grade farmers along the transit corridor.</p>
                    </div>
                    <button
                      onClick={handleNext}
                      className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      Run Smart Matching Engine →
                    </button>
                  </div>
                </div>
              )}

              {/* ──────── STAGE 4: SMART MATCHING ──────── */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-1 p-6 bg-slate-900/60 rounded-3xl border border-purple-500/30 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">AI Compatibility Radar</span>
                        <h4 className="text-5xl font-black text-white italic mt-2">{pipelineState.smartMatching?.overallCompatibilityScore || 94.8}%</h4>
                        <p className="text-xs text-emerald-400 font-bold mt-1">High Confidence Multi-Source Match</p>
                      </div>
                      <div className="space-y-2 mt-6">
                        {(pipelineState.smartMatching?.matchingCriteria || [
                          { name: 'Crop & Grade Compatibility (Grade A)', score: 100 },
                          { name: 'Combined Quantity Match (2,000 kg)', score: 100 },
                          { name: 'Price Budget Feasibility (<= ₹40/kg)', score: 96 },
                          { name: 'Proximity & Route Coherence', score: 92 },
                          { name: 'Farmer & FPO Reliability Index', score: 98 }
                        ]).map(c => (
                          <div key={c.name} className="flex justify-between text-xs">
                            <span className="text-slate-400">{c.name}</span>
                            <span className="font-bold text-white">{c.score}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="sm:col-span-2 p-6 bg-slate-900/60 rounded-3xl border border-white/5 space-y-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Candidate Farmers Evaluated</span>
                      <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                        {(pipelineState.smartMatching?.candidatePool || []).map(farm => (
                          <div
                            key={farm.id}
                            className={`p-3.5 rounded-2xl border transition-all ${
                              farm.selected
                                ? 'bg-purple-500/10 border-purple-500/40'
                                : 'bg-white/5 border-white/5 opacity-60'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${farm.selected ? 'bg-purple-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                                  {farm.selected ? '✓' : '•'}
                                </div>
                                <div>
                                  <h5 className="text-sm font-bold text-white">{farm.name} ({farm.location})</h5>
                                  <p className="text-[10px] text-slate-400">Capacity: {farm.capacity} kg • Match: {farm.matchScore || 90}% • {farm.organic ? 'Certified Organic' : 'Conventional'}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-black text-emerald-400">₹{farm.pricePerKg}/kg</span>
                                <span className={`block text-[9px] font-bold uppercase ${farm.selected ? 'text-purple-400' : 'text-slate-500'}`}>
                                  {farm.selected ? 'Selected for Pool' : 'Standby Pool'}
                                </span>
                              </div>
                            </div>

                            {/* Reasons checkmarks if available */}
                            {farm.reasons && farm.reasons.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-300">
                                {farm.reasons.map((r, rIdx) => (
                                  <div key={rIdx} className="flex items-center gap-1.5">
                                    <span className="text-emerald-400 font-bold">✓</span>
                                    <span className="text-slate-400">{typeof r === 'string' ? r : r.text}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleNext}
                      className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      Aggregate Multi-Farmer Pool →
                    </button>
                  </div>
                </div>
              )}

              {/* ──────── STAGE 5: MULTI-FARMER FULFILLMENT ──────── */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="p-6 bg-slate-900/60 rounded-3xl border border-indigo-500/20 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Batch Aggregation Protocol</span>
                        <h4 className="text-2xl font-black text-white italic">Consolidated Fulfillment: {pipelineState.fulfillment?.totalTargetKg || 2000} kg</h4>
                      </div>
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-black uppercase">
                        100% Target Fulfilled
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      {(pipelineState.fulfillment?.contributions || []).map((c, i) => (
                        <div key={c.farmerId} className="p-5 bg-white/5 border border-white/5 rounded-2xl flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-mono font-black text-indigo-400">SUPPLIER {i + 1}</span>
                              <span className="text-[10px] font-bold text-slate-400">{c.share}% share</span>
                            </div>
                            <h5 className="text-base font-black text-white">{c.farmerName}</h5>
                            <p className="text-[11px] text-slate-400">{c.location}</p>
                          </div>
                          <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-end">
                            <div>
                              <span className="text-[9px] text-slate-500 uppercase font-bold block">Volume</span>
                              <span className="text-xl font-black text-white">{c.allocatedKg} kg</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] text-slate-500 uppercase font-bold block">Farmgate Payout</span>
                              <span className="text-xl font-black text-emerald-400">₹{(c.totalPayout || 0).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Consolidated Farmgate Payout</span>
                        <p className="text-2xl font-black text-white italic">₹{(pipelineState.fulfillment?.totalFarmerFarmgatePayout || 75700).toLocaleString()} (Avg: ₹{pipelineState.fulfillment?.averageFarmgatePricePerKg || '37.85'}/kg)</p>
                      </div>
                      <button
                        onClick={handleNext}
                        className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                      >
                        Compute Optimized Pickup Route →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ──────── STAGE 6: ROUTE OPTIMIZATION ──────── */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 p-6 bg-slate-900/60 rounded-3xl border border-cyan-500/20 space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Corridor Routing</span>
                          <h4 className="text-xl font-black text-white italic">Multi-Stop Dynamic Waypoint Plan</h4>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-400">{pipelineState.routeOptimization.carrierName}</span>
                      </div>

                      {/* Visual Stopover Path */}
                      <div className="space-y-3">
                        {pipelineState.routeOptimization.waypoints.map((wp, idx) => (
                          <div key={wp.order} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-xs shrink-0">
                              {wp.order}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-white truncate">{wp.name} — <span className="text-slate-400">{wp.location}</span></p>
                              <p className="text-[10px] text-slate-500">{wp.action}</p>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-emerald-400">{wp.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-slate-900/60 rounded-3xl border border-cyan-500/20 flex flex-col justify-between space-y-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Efficiency Gains</span>
                        <h4 className="text-3xl font-black text-white italic mt-1">{pipelineState.routeOptimization.efficiencyGainPercent}% More Efficient</h4>
                        <p className="text-xs text-slate-400 mt-1">Multi-stop consolidation algorithm</p>
                      </div>

                      <div className="space-y-3">
                        <div className="p-3.5 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Distance Saved</span>
                          <span className="text-2xl font-black text-emerald-400">{pipelineState.routeOptimization.distanceSavedKm} km</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">342 km vs 480 km unoptimized</span>
                        </div>
                        <div className="p-3.5 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Diesel Saved</span>
                          <span className="text-xl font-black text-cyan-400">{pipelineState.routeOptimization.fuelSavedLitres} Litres</span>
                        </div>
                        <div className="p-3.5 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">CO2 Reduction</span>
                          <span className="text-xl font-black text-emerald-400">-{pipelineState.routeOptimization.co2ReducedKg} kg CO₂</span>
                        </div>
                      </div>

                      <button
                        onClick={handleNext}
                        className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                      >
                        Allocate Storage Node →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ──────── STAGE 7: STORAGE ALLOCATION ──────── */}
              {currentStep === 7 && (
                <div className="space-y-6">
                  <div className="p-6 bg-slate-900/60 rounded-3xl border border-teal-500/20 space-y-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-teal-400">Pre-Cooling & Buffer Allocation</span>
                        <h4 className="text-2xl font-black text-white italic">{pipelineState.storage.facilityName}</h4>
                        <p className="text-xs text-slate-400">{pipelineState.storage.facilityType} • {pipelineState.storage.allocatedBays}</p>
                      </div>
                      <span className="px-3 py-1 bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-xl text-xs font-black uppercase">
                        {pipelineState.storage.reservationStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Set Temperature</span>
                        <span className="text-2xl font-black text-cyan-400 italic">{pipelineState.storage.temperatureSetPoint}</span>
                        <span className="text-[10px] text-slate-400 block mt-1">{pipelineState.storage.humidityLevel}</span>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Reserved Capacity</span>
                        <span className="text-2xl font-black text-white italic">{pipelineState.storage.storageCapacityTons} Tons</span>
                        <span className="text-[10px] text-slate-400 block mt-1">1,500 kg batch</span>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Shelf-Life Extended</span>
                        <span className="text-2xl font-black text-emerald-400 italic">{pipelineState.storage.shelfLifeExtendedDays}</span>
                        <span className="text-[10px] text-slate-400 block mt-1">Zero heat degradation</span>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Spoilage Loss</span>
                        <span className="text-2xl font-black text-emerald-400 italic">1.2%</span>
                        <span className="text-[10px] text-slate-400 block mt-1">vs 22% traditional loss</span>
                      </div>
                    </div>

                    <div className="p-4 bg-teal-500/10 rounded-2xl border border-teal-500/20 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Total Pre-cooling Node Storage Fee</span>
                        <p className="text-xl font-black text-white">₹{pipelineState.storage.totalStorageCost} (₹150/day)</p>
                      </div>
                      <button
                        onClick={handleNext}
                        className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                      >
                        Start Live Telemetry Dispatch →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ──────── STAGE 8: LIVE TRACKING & TELEMETRY ──────── */}
              {currentStep === 8 && (
                <div className="space-y-6">
                  <div className="p-6 bg-slate-900/60 rounded-3xl border border-emerald-500/20 space-y-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Active Satellite Telemetry</span>
                        <h4 className="text-2xl font-black text-white italic">{pipelineState.tracking.currentLocation}</h4>
                        <p className="text-xs text-slate-400">Vehicle #TN-45-7821 • Driver: {pipelineState.routeOptimization.driver}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Live GPS Active</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Reefer Temp</span>
                        <span className="text-2xl font-black text-cyan-400">{pipelineState.tracking.cargoTemp}</span>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Ground Speed</span>
                        <span className="text-2xl font-black text-white">{pipelineState.tracking.currentSpeedKmH} km/h</span>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Next Waypoint ETA</span>
                        <span className="text-sm font-black text-white">{pipelineState.tracking.etaToNextStop}</span>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Buyer Arrival ETA</span>
                        <span className="text-sm font-black text-emerald-400">{pipelineState.tracking.etaToBuyer}</span>
                      </div>
                    </div>

                    {/* Telemetry Log */}
                    <div className="space-y-2 pt-2">
                      {pipelineState.tracking.telemetryHistory.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl text-xs">
                          <div className="flex items-center gap-3">
                            <span className={`w-2 h-2 rounded-full ${item.status === 'done' ? 'bg-emerald-400' : item.status === 'active' ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
                            <span className="text-white font-bold">{item.event}</span>
                          </div>
                          <span className="text-slate-400 font-mono text-[10px]">{item.time}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleNext}
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                      >
                        Simulate Delivery Arrival & Sign-off →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ──────── STAGE 9: DELIVERY & DIGITAL SIGN-OFF ──────── */}
              {currentStep === 9 && (
                <div className="space-y-6">
                  <div className="p-6 bg-slate-900/60 rounded-3xl border border-green-500/30 space-y-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-green-400">Custody Handshake Protocol</span>
                        <h4 className="text-2xl font-black text-white italic">Consignment Handover Confirmed</h4>
                        <p className="text-xs text-slate-400">Signed by: {pipelineState.delivery.signedBy} • Destination: Bangalore Central Fulfillment Center</p>
                      </div>
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl text-xs font-black uppercase">
                        {pipelineState.delivery.deliveryStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Quality Inspection Score</span>
                        <span className="text-3xl font-black text-emerald-400 italic">{pipelineState.delivery.qcScore}</span>
                        <p className="text-[10px] text-slate-400 mt-2">Zero spoilage detected across 1,500 kg batch.</p>
                      </div>
                      <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Buyer Verification OTP</span>
                        <span className="text-3xl font-mono font-black text-cyan-400 tracking-widest">{pipelineState.delivery.otpCode}</span>
                        <p className="text-[10px] text-emerald-400 mt-2">✓ Verified via Encrypted SMS/App</p>
                      </div>
                      <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Ledger Transaction Hash</span>
                        <span className="text-xs font-mono text-slate-300 break-all">{pipelineState.delivery.digitalSignatureHash}</span>
                        <p className="text-[10px] text-slate-400 mt-2">Immutable custody transfer timestamped.</p>
                      </div>
                    </div>

                    <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20 flex justify-between items-center">
                      <p className="text-xs font-bold text-white">Custody transferred successfully with 100% QA audit pass.</p>
                      <button
                        onClick={handleNext}
                        className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                      >
                        Inspect Transparent Pricing Audit Sheet →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ──────── STAGE 10: TRANSPARENT PRICING BREAKDOWN ──────── */}
              {currentStep === 10 && (
                <div className="space-y-6">
                  <div className="p-6 bg-slate-900/60 rounded-3xl border border-yellow-500/30 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400">100% Cost Transparency Ledger</span>
                        <h4 className="text-2xl font-black text-white italic">Zero Middlemen. Direct Farmgate Valuation.</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 font-bold">Total Landed Price:</span>
                        <p className="text-3xl font-black text-white italic">₹{pipelineState.transparentPricing.totalLandedBuyerCost.toLocaleString()}</p>
                        <span className="text-xs font-black text-emerald-400">₹{pipelineState.transparentPricing.landedPricePerKg}/kg landed</span>
                      </div>
                    </div>

                    {/* Cost Line Items */}
                    <div className="space-y-2">
                      {pipelineState.transparentPricing.lineItems.map((li, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3.5 bg-white/5 rounded-2xl border border-white/5 text-xs">
                          <div className="flex items-center gap-3">
                            <span className={`w-2.5 h-2.5 rounded-full ${li.category === 'farmer' ? 'bg-emerald-400' : li.category === 'logistics' ? 'bg-cyan-400' : li.category === 'storage' ? 'bg-teal-400' : 'bg-slate-400'}`} />
                            <span className="font-bold text-white">{li.label}</span>
                          </div>
                          <div className="text-right flex items-center gap-4">
                            <span className="text-slate-400 text-[10px]">{li.pct}%</span>
                            <span className="font-black text-white text-sm">₹{li.amount.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Mandi vs FarmDirect Comparison */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">Traditional Mandi System</span>
                        <h5 className="text-2xl font-black text-white mt-1">₹{pipelineState.transparentPricing.traditionalMandiTotalCost.toLocaleString()} (₹{pipelineState.transparentPricing.traditionalMandiCostPerKg}/kg)</h5>
                        <ul className="text-[11px] text-slate-400 mt-3 space-y-1.5">
                          <li>• Middlemen cut: 30-40% taken by Mandi commission agents</li>
                          <li>• Farmer only receives: ₹18-20/kg</li>
                          <li>• High transit spoilage (20-25%) due to broken ambient logistics</li>
                        </ul>
                      </div>
                      <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">FarmDirect Direct Route</span>
                        <h5 className="text-2xl font-black text-emerald-400 mt-1">₹{pipelineState.transparentPricing.totalLandedBuyerCost.toLocaleString()} (₹{pipelineState.transparentPricing.landedPricePerKg}/kg)</h5>
                        <ul className="text-[11px] text-slate-300 mt-3 space-y-1.5 font-bold">
                          <li className="text-emerald-400">✓ Buyer Saves: ₹{pipelineState.transparentPricing.buyerSavingsAmount.toLocaleString()} ({pipelineState.transparentPricing.buyerSavingsPercent}%)</li>
                          <li className="text-emerald-400">✓ Farmers Earn: +{pipelineState.transparentPricing.farmerEarningsIncreasePercent}% direct income</li>
                          <li className="text-cyan-400">✓ Middlemen Extortion: {pipelineState.transparentPricing.middlemenCutEliminated}</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-white/10">
                      <button
                        onClick={handleReset}
                        className="w-full sm:w-auto px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Restart Complete Demo
                      </button>
                      <button
                        onClick={() => {
                          try {
                            supplyChainService.acceptFulfillmentPlan('req-freshbasket-01');
                            supplyChainService.completeDeliverySignoff('SHP-9842');
                          } catch (e) {
                            console.warn('Sync on demo completion:', e);
                          }
                          notifySuccess('Supply Chain Contract Committed to Live Network!', '2,000kg multi-farmer tomato fulfillment verified & settled.');
                          onClose();
                        }}
                        className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                      >
                        Commit to Application & Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-slate-900/60 flex justify-between items-center shrink-0">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Previous Stage
          </button>

          <span className="text-xs text-slate-500 font-bold uppercase tracking-widest hidden sm:inline">
            Stage {currentStep}: {currentStageInfo.label}
          </span>

          <button
            onClick={handleNext}
            disabled={currentStep === 10}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            Next Stage <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AgriPipelineModal;
