import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  Loader2, TrendingUp, RefreshCcw, Activity, Brain, 
  BarChart3, CheckCircle2, ShieldCheck, Sparkles, DollarSign, ArrowUpRight 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getFarmerMetrics } from '../../services/analyticsService';
import { getTrendingCrops, getAIInsights, getSmartPriceSuggestion, getCropSuggestions } from '../../services/marketService';
import { supplyChainService } from '../../services/supplyChainService';
import StatCard from '../ui/StatCard';

const FarmerAnalytics = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [data, setData] = useState({ metrics: {}, chartData: [] });
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState([]);
  const [activeTab, setActiveTab] = useState('earnings');
  const [farmerEarnings, setFarmerEarnings] = useState(() => supplyChainService.getFarmerEarnings('farmer-ravi-teja'));

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [metrics, insights] = await Promise.all([
          getFarmerMetrics(),
          getAIInsights(user?.id),
        ]);
        setData(metrics);
        setAiInsights(insights);
      } catch (err) {
        console.error('Analytics load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();

    const unsubscribe = supplyChainService.subscribe(() => {
      setFarmerEarnings(supplyChainService.getFarmerEarnings('farmer-ravi-teja'));
    });

    return () => unsubscribe();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#2F7D4A]" />
        <p className="text-xs font-bold text-[#66736A] uppercase tracking-wider">Loading Financial Ledger...</p>
      </div>
    );
  }

  const totalPayout = (farmerEarnings.totalEarned || 26600);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#D8DFD5] gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#2F7D4A]">Transparent Financial Ledger</span>
          <h2 className="text-2xl font-serif font-bold text-[#17201B]">Escrow Settlements & Realized Earnings</h2>
          <p className="text-xs text-[#66736A] mt-1">
            Automated direct-to-bank settlements released upon digital delivery sign-off and quality verification. Zero broker commissions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-[#E8EFE4] text-[#123C2A] text-xs font-bold rounded-lg border border-[#D8DFD5] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#2F7D4A]" />
            100% Escrow Protected
          </span>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Realized" 
          value={(data.metrics.totalEarnings || 0) + totalPayout} 
          prefix="₹" 
          icon={DollarSign} 
          trend={18} 
        />
        <StatCard 
          label="Today's Direct Sales" 
          value={data.metrics.todayEarnings || 14200} 
          prefix="₹" 
          icon={Activity} 
          trend={5} 
        />
        <StatCard 
          label="Weekly Contracts" 
          value={data.metrics.weeklyEarnings || 42800} 
          prefix="₹" 
          icon={TrendingUp} 
          trend={8} 
        />
        <StatCard 
          label="Cleared Escrow" 
          value={(data.metrics.monthlyEarnings || 0) + totalPayout} 
          prefix="₹" 
          icon={BarChart3} 
          trend={24} 
        />
      </div>

      {/* Transparent Escrow Settlement & Payout Ledger Card */}
      <div className="bg-white rounded-xl border border-[#D8DFD5] shadow-sm overflow-hidden">
        <div className="p-6 bg-[#123C2A] text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#7DBA52]/20 text-[#7DBA52] text-[10px] font-bold uppercase tracking-wider mb-2 border border-[#7DBA52]/30">
              <Sparkles className="w-3 h-3" /> Direct Escrow Disbursal
            </div>
            <h3 className="text-xl font-serif font-bold text-white">
              Middleman Elimination & Net Farmer Income
            </h3>
            <p className="text-xs text-[#E8EFE4]/80 mt-1 max-w-xl">
              Automatic payment credit into verified farmer bank account upon buyer digital OTP sign-off and QC score confirmation.
            </p>
          </div>

          <div className="text-left md:text-right">
            <span className="text-[10px] font-bold text-[#E8EFE4]/80 uppercase tracking-wider block">Total B2B Contract Disbursed</span>
            <span className="text-2xl font-bold text-[#7DBA52] font-mono block">
              ₹{totalPayout.toLocaleString()}
            </span>
            <span className="text-[11px] text-[#E8EFE4] font-medium block mt-0.5">
              ✓ Direct to Farmer Account (Zero Broker Cut)
            </span>
          </div>
        </div>

        {/* Mandi vs FarmDirect Net Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-[#F5F3EA]/30 border-b border-[#D8DFD5]">
          <div className="p-4 rounded-lg bg-white border border-[#D8DFD5]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Traditional Mandi Payout</span>
            <span className="text-xl font-bold text-rose-700 font-mono mt-1 block">₹15,400</span>
            <span className="text-xs text-[#66736A] mt-1 block">₹22/kg after 4 intermediate commission cuts</span>
          </div>

          <div className="p-4 rounded-lg bg-[#E8EFE4] border border-[#7DBA52]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#123C2A] block">FarmDirect Payout</span>
            <span className="text-xl font-bold text-[#123C2A] font-mono mt-1 block">₹26,600</span>
            <span className="text-xs text-[#2F7D4A] font-medium mt-1 block">₹38/kg guaranteed institutional farmgate rate</span>
          </div>

          <div className="p-4 rounded-lg bg-[#E8EFE4] border border-[#2F7D4A]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2F7D4A] block">Net Income Boost</span>
            <span className="text-xl font-bold text-[#2F7D4A] font-mono mt-1 block">+₹11,200 (+72.7%)</span>
            <span className="text-xs text-[#123C2A] mt-1 block">Retained directly by farmer household</span>
          </div>
        </div>

        {/* Settled Lots List */}
        <div className="p-6">
          <span className="text-xs font-bold uppercase tracking-wider text-[#123C2A] block mb-3">
            Audited Disbursed Lot Breakdown:
          </span>
          <div className="space-y-2">
            {(farmerEarnings.allocatedLots || [
              { orderId: 'LOT-FD-TOM-1026-A', crop: 'Hybrid Tomato', quantityKg: 700, unitPrice: 38, payout: 26600 }
            ]).map((lot, idx) => (
              <div key={idx} className="p-3.5 rounded-lg bg-white border border-[#D8DFD5] flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2F7D4A]" />
                  <span className="font-bold text-[#17201B] font-mono">{lot.orderId}</span>
                  <span className="text-[#66736A]">• {lot.crop} ({lot.quantityKg} kg @ ₹{lot.unitPrice}/kg)</span>
                </div>
                <div className="font-mono font-bold text-[#123C2A]">
                  ₹{lot.payout?.toLocaleString() || '26,600'} Cleared to Ledger
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Stream Chart */}
      <div className="bg-white rounded-xl border border-[#D8DFD5] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-serif font-bold text-[#17201B]">Revenue Realization Stream</h3>
            <p className="text-xs text-[#66736A] mt-0.5">Direct sales and institutional fulfillment receipts</p>
          </div>
          <div className="flex gap-2">
            {['earnings', 'sales'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border ${
                  activeTab === tab
                    ? 'bg-[#123C2A] text-white border-[#123C2A]'
                    : 'bg-white text-[#66736A] border-[#D8DFD5] hover:bg-[#F5F3EA]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.chartData?.length ? data.chartData : [
              { _id: 'Mon', total: 4200 },
              { _id: 'Tue', total: 6800 },
              { _id: 'Wed', total: 9400 },
              { _id: 'Thu', total: 14200 },
              { _id: 'Fri', total: 26600 },
              { _id: 'Sat', total: 31000 },
              { _id: 'Sun', total: 38200 },
            ]}>
              <defs>
                <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2F7D4A" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2F7D4A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E8EFE4" />
              <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fill: '#66736A', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#66736A', fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  borderColor: '#D8DFD5', 
                  borderRadius: '8px', 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  color: '#17201B' 
                }} 
              />
              <Area type="monotone" dataKey="total" stroke="#2F7D4A" strokeWidth={2.5} fill="url(#earningsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default FarmerAnalytics;
