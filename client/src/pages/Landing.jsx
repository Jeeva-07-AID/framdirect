import React, { useState, useEffect } from 'react';
import { useNavigate as useRouterNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Sprout, 
  ArrowRight, 
  Store, 
  Tractor, 
  ShieldCheck, 
  Truck, 
  Warehouse, 
  Layers, 
  CheckCircle2, 
  Cpu, 
  TrendingUp, 
  DollarSign, 
  MapPin, 
  Users,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import LanguageSelector from '../components/LanguageSelector';
import FarmBackground from '../components/ui/FarmBackground';
import AgriCard from '../components/ui/AgriCard';
import AgriPipelineModal from '../components/dashboard/AgriPipelineModal';

const SUPPLY_CHAIN_STAGES = [
  {
    step: '01',
    title: 'FARMERS',
    subtitle: 'Verified Smallholders',
    desc: 'Farmers in rural clusters register plots, crop varieties, and expected yields.',
    icon: Tractor,
    color: '#123C2A'
  },
  {
    step: '02',
    title: 'HARVEST',
    subtitle: 'Demand-Calibrated Yields',
    desc: 'AI regional demand forecasts advise farmers on planting and harvest timing.',
    icon: Sprout,
    color: '#2F7D4A'
  },
  {
    step: '03',
    title: 'SMART MATCHING',
    subtitle: 'Algorithmic Pairing',
    desc: 'Matching engine pairs buyer volume with certified local farm availability.',
    icon: Cpu,
    color: '#2F7D4A'
  },
  {
    step: '04',
    title: 'AGGREGATION',
    subtitle: 'Digital Supply Lots',
    desc: 'Fragmented farm lots pool into single commercial deliveries (e.g. 2,000 kg).',
    icon: Layers,
    color: '#D9A441'
  },
  {
    step: '05',
    title: 'LOGISTICS',
    subtitle: 'Cold-Chain Transit',
    desc: 'Consolidated multi-stop reefer fleet with real-time temperature telemetry.',
    icon: Truck,
    color: '#2F7D4A'
  },
  {
    step: '06',
    title: 'BUYER',
    subtitle: 'Verified Settlement',
    desc: 'Institutional fulfillment with OTP verification, QC score, and direct escrow payout.',
    icon: Store,
    color: '#123C2A'
  }
];

const Landing = () => {
  const [showSupplyIntelligence, setShowSupplyIntelligence] = useState(false);
  const [activePipelineTab, setActivePipelineTab] = useState(0);
  const navigate = useRouterNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const storedLang = localStorage.getItem('farmdirect_lang');
    if (storedLang) i18n.changeLanguage(storedLang);
  }, [i18n]);

  const handleRoleSelection = (role) => {
    navigate('/signup', { state: { defaultRole: role } });
  };

  const scrollToSupplyNetwork = () => {
    const el = document.getElementById('supply-network-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <FarmBackground>
      <div className="min-h-screen font-sans text-[#17201B] relative flex flex-col">
        
        {/* Commercial Navigation */}
        <nav className="fixed w-full z-50 bg-[#F5F3EA]/90 backdrop-blur-md border-b border-[#D8DFD5]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="flex justify-between items-center h-20">
              {/* Brand Logo */}
              <div 
                className="flex items-center space-x-3 cursor-pointer"
                onClick={() => navigate('/')}
              >
                <div className="w-10 h-10 rounded-xl bg-[#123C2A] flex items-center justify-center text-white shadow-sm">
                  <Sprout className="h-6 w-6 text-[#7DBA52]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black text-[#123C2A] tracking-tight leading-none">FarmDirect</span>
                  <span className="text-[10px] font-bold text-[#66736A] uppercase tracking-widest mt-0.5">Agricultural Digital Network</span>
                </div>
              </div>
              
              {/* Center Menu Links */}
              <div className="hidden lg:flex items-center space-x-8 text-xs font-bold text-[#66736A] tracking-wider uppercase">
                <button onClick={() => navigate('/buyer-dashboard')} className="hover:text-[#123C2A] transition-colors cursor-pointer">Marketplace</button>
                <button onClick={() => navigate('/farmer-dashboard')} className="hover:text-[#123C2A] transition-colors cursor-pointer">For Farmers</button>
                <button onClick={() => navigate('/buyer-dashboard')} className="hover:text-[#123C2A] transition-colors cursor-pointer">For Buyers</button>
                <button onClick={scrollToSupplyNetwork} className="hover:text-[#123C2A] transition-colors cursor-pointer">Supply Network</button>
                <button onClick={() => setShowSupplyIntelligence(true)} className="hover:text-[#123C2A] transition-colors cursor-pointer">How It Works</button>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center space-x-3 sm:space-x-4">
                <LanguageSelector />
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-xs font-bold text-[#123C2A] hover:bg-[#E8EFE4] rounded-xl transition-colors cursor-pointer"
                >
                  Login
                </button>
                <button
                  onClick={() => handleRoleSelection('Buyer')}
                  className="px-5 py-2.5 bg-[#123C2A] hover:bg-[#0B261A] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="flex-1 pt-32 pb-24 px-6 flex flex-col items-center">
          <div className="max-w-5xl mx-auto text-center space-y-8 mt-6">
            
            {/* Top Category Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8EFE4] border border-[#C5DBCC] text-[#1D4E2F] text-[11px] font-bold uppercase tracking-widest"
            >
              <span className="w-2 h-2 rounded-full bg-[#2F7D4A] animate-pulse" />
              Direct Agricultural Supply Network
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl sm:text-7xl lg:text-8xl font-black text-[#123C2A] tracking-tight leading-[0.98] font-sans"
            >
              From Farm to Buyer. <br />
              <span className="text-[#2F7D4A] font-serif italic font-normal">Without the unnecessary layers.</span>
            </motion.h1>

            {/* Supporting Text */}
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-[#66736A] max-w-2xl mx-auto leading-relaxed font-normal"
            >
              FarmDirect connects verified smallholder farmers and FPOs directly with commercial buyers. Intelligent multi-farmer aggregation, cold-chain routing, and 100% price transparency.
            </motion.p>
            
            {/* Primary Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4 pt-2"
            >
              <button
                onClick={() => navigate('/buyer-dashboard')}
                className="px-8 py-4 bg-[#123C2A] hover:bg-[#0B261A] text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer hover:shadow-lg hover:-translate-y-0.5"
              >
                Explore Marketplace <ArrowRight className="w-4 h-4 text-[#7DBA52]" />
              </button>

              <button
                onClick={scrollToSupplyNetwork}
                className="px-8 py-4 bg-white hover:bg-[#E8EFE4] text-[#123C2A] font-black text-xs uppercase tracking-widest rounded-xl border border-[#D8DFD5] transition-all cursor-pointer hover:-translate-y-0.5"
              >
                See How FarmDirect Works
              </button>
            </motion.div>

            {/* Core Proof Stats Strip */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto"
            >
              <div className="p-4 bg-white rounded-2xl border border-[#D8DFD5] text-center shadow-sm">
                <span className="text-[10px] font-bold text-[#66736A] uppercase tracking-wider block">Farmgate Volume</span>
                <span className="text-2xl font-black text-[#123C2A] font-mono mt-1 block">14,200 kg</span>
                <span className="text-[10px] text-[#2F7D4A] font-bold mt-0.5 block">Delivered This Cycle</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-[#D8DFD5] text-center shadow-sm">
                <span className="text-[10px] font-bold text-[#66736A] uppercase tracking-wider block">Middlemen Cut</span>
                <span className="text-2xl font-black text-[#123C2A] font-mono mt-1 block">0%</span>
                <span className="text-[10px] text-[#2F7D4A] font-bold mt-0.5 block">Direct Farm Settlement</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-[#D8DFD5] text-center shadow-sm">
                <span className="text-[10px] font-bold text-[#66736A] uppercase tracking-wider block">Farmer Income Boost</span>
                <span className="text-2xl font-black text-[#2F7D4A] font-mono mt-1 block">+72.7%</span>
                <span className="text-[10px] text-[#66736A] font-bold mt-0.5 block">vs Traditional Mandi</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-[#D8DFD5] text-center shadow-sm">
                <span className="text-[10px] font-bold text-[#66736A] uppercase tracking-wider block">Cold-Chain Loss</span>
                <span className="text-2xl font-black text-[#123C2A] font-mono mt-1 block">&lt; 2.5%</span>
                <span className="text-[10px] text-[#2F7D4A] font-bold mt-0.5 block">vs 25% Spoilage</span>
              </div>
            </motion.div>
          </div>

          {/* Supply Chain Horizontal Pipeline Visualization Section */}
          <div id="supply-network-section" className="w-full max-w-6xl mt-24 pt-10 border-t border-[#D8DFD5]">
            <div className="text-center space-y-3 mb-12">
              <span className="text-[11px] font-bold text-[#2F7D4A] uppercase tracking-[0.2em] block">
                The FarmDirect Digital Pipeline
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#123C2A] tracking-tight">
                How Fragmented Farms Form a Digital Supply Network
              </h2>
              <p className="text-sm text-[#66736A] max-w-xl mx-auto">
                Unlike ordinary vegetable retail portals, FarmDirect executes an end-to-end intelligent agricultural lifecycle:
              </p>
            </div>

            {/* Horizontal Supply Chain Nodes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
              {SUPPLY_CHAIN_STAGES.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.step}
                    className="p-5 bg-white rounded-2xl border border-[#D8DFD5] hover:border-[#2F7D4A] transition-all hover:shadow-md flex flex-col justify-between group relative overflow-hidden"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[11px] font-mono font-bold text-[#66736A]">{s.step}</span>
                        <div className="p-2 rounded-xl bg-[#E8EFE4] text-[#123C2A] group-hover:bg-[#123C2A] group-hover:text-white transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>
                      <h4 className="text-sm font-black text-[#123C2A] tracking-tight mb-1">{s.title}</h4>
                      <p className="text-[11px] font-bold text-[#2F7D4A] mb-2">{s.subtitle}</p>
                      <p className="text-xs text-[#66736A] leading-relaxed">{s.desc}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#E8EFE4] flex items-center justify-between text-[10px] font-bold text-[#66736A]">
                      <span>Stage {idx + 1} of 6</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#2F7D4A]" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Two Primary Role Portals: Farmer & Institutional Buyer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl mt-20">
            {/* Farmer Card */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#D8DFD5] shadow-sm hover:shadow-md transition-shadow text-left flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-[#E8EFE4] text-[#123C2A] rounded-2xl flex items-center justify-center mb-6 border border-[#C5DBCC]">
                  <Tractor className="h-7 w-7 text-[#2F7D4A]" />
                </div>
                <span className="text-[10px] font-bold text-[#2F7D4A] uppercase tracking-wider block mb-1">For Smallholders & FPO Collectives</span>
                <h3 className="text-2xl sm:text-3xl font-black text-[#123C2A] tracking-tight mb-3">Sell Yields Directly to Institutional Buyers</h3>
                <p className="text-sm text-[#66736A] leading-relaxed mb-6">
                  Publish future harvest plans, receive real-time regional demand intelligence, lock pre-order contracts with guaranteed escrow disbursements, and eliminate exploitative Mandi commission cuts.
                </p>
                <ul className="space-y-2.5 text-xs text-[#17201B] font-medium mb-8">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#2F7D4A]" /> Guaranteed farmgate pricing with zero intermediary brokerage</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#2F7D4A]" /> Regional demand forecasting for calibrated crop planting</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#2F7D4A]" /> Scheduled farmgate pickup integrated with cold-chain transit</li>
                </ul>
              </div>
              <button
                onClick={() => handleRoleSelection('Farmer')}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#123C2A] hover:bg-[#0B261A] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                Join as Producer <ArrowRight className="w-4 h-4 text-[#7DBA52]" />
              </button>
            </div>

            {/* Buyer Card */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#D8DFD5] shadow-sm hover:shadow-md transition-shadow text-left flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-[#FEF7E7] text-[#D9A441] rounded-2xl flex items-center justify-center mb-6 border border-[#F7DFA4]">
                  <Store className="h-7 w-7 text-[#946917]" />
                </div>
                <span className="text-[10px] font-bold text-[#946917] uppercase tracking-wider block mb-1">For Supermarkets, Exporters & Processors</span>
                <h3 className="text-2xl sm:text-3xl font-black text-[#123C2A] tracking-tight mb-3">Procure Commercial Bulk Volume Directly</h3>
                <p className="text-sm text-[#66736A] leading-relaxed mb-6">
                  Specify bulk crop requirements, let smart matching aggregate multiple verified farms into a single consolidated supply lot, and track cold-chain temperature telemetry until arrival.
                </p>
                <ul className="space-y-2.5 text-xs text-[#17201B] font-medium mb-8">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#2F7D4A]" /> Multi-farmer aggregation fulfilling up to 100% of volume needs</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#2F7D4A]" /> Reefer temperature tracking (&lt; 13°C) preserving Grade-A quality</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#2F7D4A]" /> 100% transparent audit ledger with OTP sign-off release</li>
                </ul>
              </div>
              <button
                onClick={() => handleRoleSelection('Buyer')}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#2F7D4A] hover:bg-[#24643B] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                Access Procurement Center <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Price Transparency Breakdown Teaser */}
          <div className="w-full max-w-6xl mt-20 p-8 sm:p-10 bg-white rounded-3xl border border-[#D8DFD5] shadow-sm text-left">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#E8EFE4]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#2F7D4A] block mb-1">
                  Economic Transparency
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-[#123C2A] tracking-tight">
                  The ₹40/kg Buyer Rupee: Audited and Direct
                </h3>
                <p className="text-xs text-[#66736A] mt-1 max-w-xl">
                  Traditional APMC Mandis lose 35-40% of capital to 4-5 intermediate commission brokers. On FarmDirect, 85%+ flows directly to the grower.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 shrink-0">
                <div className="p-3 bg-[#F5F3EA] rounded-xl text-center border border-[#D8DFD5]">
                  <span className="text-[10px] font-bold text-[#66736A] uppercase block">Farmer Share</span>
                  <span className="text-lg font-black text-[#2F7D4A] font-mono mt-0.5 block">85.0%</span>
                </div>
                <div className="p-3 bg-[#F5F3EA] rounded-xl text-center border border-[#D8DFD5]">
                  <span className="text-[10px] font-bold text-[#66736A] uppercase block">Logistics + Reefer</span>
                  <span className="text-lg font-black text-[#123C2A] font-mono mt-0.5 block">7.4%</span>
                </div>
                <div className="p-3 bg-[#F5F3EA] rounded-xl text-center border border-[#D8DFD5]">
                  <span className="text-[10px] font-bold text-[#66736A] uppercase block">Storage & QC</span>
                  <span className="text-lg font-black text-[#123C2A] font-mono mt-0.5 block">5.1%</span>
                </div>
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#66736A]">
              <span>Every transaction is escrow-protected and recorded in real-time.</span>
              <button
                onClick={() => navigate('/buyer-dashboard')}
                className="text-[#2F7D4A] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                View Full Economic Audit Model <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </main>

        {/* Enterprise Footer */}
        <footer className="py-12 bg-white border-t border-[#D8DFD5]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-[#123C2A] flex items-center justify-center text-white">
                <Sprout className="h-4 w-4 text-[#7DBA52]" />
              </div>
              <span className="text-lg font-black text-[#123C2A] tracking-tight">FarmDirect</span>
              <span className="text-xs text-[#66736A] pl-2 border-l border-[#D8DFD5]">Agricultural Digital Network</span>
            </div>

            <div className="flex items-center space-x-6 text-xs font-bold text-[#66736A] uppercase tracking-wider">
              <a href="#" className="hover:text-[#123C2A] transition-colors">Documentation</a>
              <a href="#" className="hover:text-[#123C2A] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#123C2A] transition-colors">Terms of Supply</a>
              <a href="#" className="hover:text-[#123C2A] transition-colors">Institutional Inquiries</a>
            </div>

            <div className="text-xs text-[#66736A]">
              &copy; {new Date().getFullYear()} FarmDirect. Smart India Hackathon Architecture.
            </div>
          </div>
        </footer>

        {/* Supply Intelligence Pipeline Modal */}
        <AgriPipelineModal
          isOpen={showSupplyIntelligence}
          onClose={() => setShowSupplyIntelligence(false)}
        />
      </div>
    </FarmBackground>
  );
};

export default Landing;
