import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  LogOut, User, PackageOpen, ClipboardList, LineChart, MessageSquare, 
  Menu, X, Zap, Warehouse, Sprout, Store, Bell, Truck, Sparkles, 
  TrendingUp, ArrowRight, Layers, MapPin, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from '../components/NotificationBell';

import FarmerProfile from '../components/dashboard/FarmerProfile';
import FarmerProducts from '../components/dashboard/FarmerProducts';
import FarmerOrders from '../components/dashboard/FarmerOrders';
import FarmerAnalytics from '../components/dashboard/FarmerAnalytics';
import FarmerReviews from '../components/dashboard/FarmerReviews';
import FastSell from '../components/dashboard/FastSell';
import StorageAvailability from '../components/StorageAvailability';
import FarmerFutureHarvest from '../components/dashboard/FarmerFutureHarvest';
import FarmerTransportTracking from '../components/dashboard/FarmerTransportTracking';
import FarmerShop from '../components/dashboard/FarmerShop';
import MarketIntelligenceMap from '../components/dashboard/MarketIntelligenceMap';
import DemoRoleSwitcher from '../components/DemoRoleSwitcher';
import FarmBackground from '../components/ui/FarmBackground';
import SetPasswordModal from '../components/SetPasswordModal';
import AgriPipelineModal from '../components/dashboard/AgriPipelineModal';
import { demandForecastService } from '../services/demandForecastService';

const FarmerDashboard = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPipelineModal, setShowPipelineModal] = useState(false);

  // Farmer AI Insight (Phase 3)
  const farmerInsight = demandForecastService.getFarmerInsight('Tomato', 'Trichy', 500);

  const tabs = [
    { id: 'profile',   label: 'Farm Profile',                    icon: User },
    { id: 'products',  label: 'Field Inventory',                icon: PackageOpen },
    { id: 'future',    label: 'Harvest Schedule',                icon: Sprout },
    { id: 'orders',    label: 'Supply Contracts',                icon: ClipboardList },
    { id: 'fastsell',  label: 'Fast Sell',                       icon: Zap },
    { id: 'insights',  label: 'Demand Intelligence',             icon: Layers },
    { id: 'transport', label: 'Reefer Logistics',                icon: Truck },
    { id: 'storage',   label: 'Cold Storage Decisions',          icon: Warehouse },
    { id: 'analytics', label: 'Escrow & Payouts',                icon: LineChart },
    { id: 'shop',      label: 'Direct Shop',                     icon: Store },
    { id: 'reviews',   label: 'Buyer Feedback',                  icon: MessageSquare },
  ];

  return (
    <FarmBackground>
      <SetPasswordModal />
      <div className="min-h-screen text-[#17201B] font-sans">
        
        {/* Commercial Platform Navigation Bar */}
        <header className="bg-white border-b border-[#D8DFD5] sticky top-0 z-40 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsMobileMenuOpen(prev => !prev)} 
                className="lg:hidden p-2 text-[#66736A] hover:text-[#17201B]"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#123C2A] flex items-center justify-center text-white">
                  <Sprout className="w-4 h-4 text-[#7DBA52]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif font-bold text-lg text-[#123C2A] tracking-tight">FarmDirect</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#E8EFE4] text-[#2F7D4A] uppercase tracking-wider">
                      Producer Hub
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <NotificationBell />
              <div className="h-6 w-px bg-[#D8DFD5] hidden sm:block" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#E8EFE4] text-[#123C2A] flex items-center justify-center font-bold text-xs border border-[#D8DFD5]">
                  {user?.avatar ? (
                    <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt="avatar" />
                  ) : (
                    <span>{user?.name ? user.name[0] : 'R'}</span>
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-[#17201B] leading-none">{user?.name || 'Ravi Teja Farms'}</p>
                  <p className="text-[10px] text-[#66736A] mt-0.5">Verified Producer • Trichy</p>
                </div>
              </div>
              <button 
                onClick={logout}
                className="p-2 text-[#66736A] hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Horizontal Navigation Sub-bar (Desktop) */}
          <div className="hidden lg:block border-t border-[#D8DFD5] bg-[#F5F3EA]/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#123C2A] text-white shadow-xs'
                          : 'text-[#66736A] hover:text-[#17201B] hover:bg-white'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#7DBA52]' : 'text-[#66736A]'}`} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-b border-[#D8DFD5] px-4 py-3 space-y-1 shadow-md"
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold ${
                      isActive ? 'bg-[#123C2A] text-white' : 'text-[#66736A] hover:bg-[#F5F3EA]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          {/* Platform Perspective Switcher */}
          <DemoRoleSwitcher onOpenPipelineModal={() => setShowPipelineModal(true)} />

          {/* Agro Demand Intelligence Hero Banner */}
          <div className="bg-white rounded-xl border border-[#D8DFD5] p-6 shadow-sm overflow-hidden relative">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#D8DFD5]">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8EFE4] text-[#123C2A] text-[10px] font-bold uppercase tracking-wider mb-2 border border-[#D8DFD5]">
                  <Sparkles className="w-3 h-3 text-[#2F7D4A]" /> AI Demand Intelligence Engine
                </div>
                <h3 className="text-xl font-serif font-bold text-[#17201B]">
                  {farmerInsight.headline}
                </h3>
                <p className="text-xs text-[#66736A] mt-1 max-w-2xl leading-relaxed">
                  <span className="font-bold text-[#123C2A]">Recommendation:</span> {farmerInsight.recommendedAction} (Est. Net Realization: <span className="text-[#2F7D4A] font-bold">{farmerInsight.potentialRevenueBoost}</span>)
                </p>
              </div>

              {/* Badges */}
              <div className="grid grid-cols-3 gap-3 shrink-0">
                <div className="p-3 bg-[#F5F3EA] border border-[#D8DFD5] rounded-lg text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Planned Yield</span>
                  <span className="text-base font-bold text-[#17201B] font-mono mt-0.5 block">{farmerInsight.upcomingHarvestKg} kg</span>
                </div>
                <div className="p-3 bg-[#F5F3EA] border border-[#D8DFD5] rounded-lg text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Chennai Demand</span>
                  <span className="text-base font-bold text-[#2F7D4A] font-mono mt-0.5 block">{farmerInsight.predictedRegionalDemandKg} kg</span>
                </div>
                <div className="p-3 bg-[#E8EFE4] border border-[#7DBA52] rounded-lg text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#123C2A] block">Opportunity</span>
                  <span className="text-base font-bold text-[#123C2A] uppercase block mt-0.5">{farmerInsight.opportunityLevel}</span>
                </div>
              </div>
            </div>

            {/* Live Operational Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-5">
              <div className="p-3 bg-[#F5F3EA]/60 rounded-lg border border-[#D8DFD5]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Active Crops</span>
                <span className="text-base font-bold text-[#17201B] font-mono mt-0.5 block">4 Registered</span>
              </div>
              <div className="p-3 bg-[#F5F3EA]/60 rounded-lg border border-[#D8DFD5]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Stock on Hand</span>
                <span className="text-base font-bold text-[#2F7D4A] font-mono mt-0.5 block">1,250 kg</span>
              </div>
              <div className="p-3 bg-[#F5F3EA]/60 rounded-lg border border-[#D8DFD5]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Harvest Window</span>
                <span className="text-base font-bold text-[#123C2A] font-mono mt-0.5 block">500 kg (2d)</span>
              </div>
              <div className="p-3 bg-[#F5F3EA]/60 rounded-lg border border-[#D8DFD5]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Today's Sales</span>
                <span className="text-base font-bold text-[#D9A441] font-mono mt-0.5 block">₹14,200</span>
              </div>
              <div className="p-3 bg-[#F5F3EA]/60 rounded-lg border border-[#D8DFD5]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Escrow Settled</span>
                <span className="text-base font-bold text-[#123C2A] font-mono mt-0.5 block">₹92,400</span>
              </div>
              <div className="p-3 bg-[#F5F3EA]/60 rounded-lg border border-[#D8DFD5]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Active Contracts</span>
                <span className="text-base font-bold text-[#2F7D4A] font-mono mt-0.5 block">3 Batches</span>
              </div>
              <div className="p-3 bg-[#F5F3EA]/60 rounded-lg border border-[#D8DFD5]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Avg Realized</span>
                <span className="text-base font-bold text-[#17201B] font-mono mt-0.5 block">₹38.50/kg</span>
              </div>
            </div>
          </div>

          {/* Active Tab View */}
          <div className="w-full">
            {activeTab === 'profile'   && <FarmerProfile />}
            {activeTab === 'products'  && <FarmerProducts />}
            {activeTab === 'fastsell'  && <FastSell />}
            {activeTab === 'shop'      && <FarmerShop />}
            {activeTab === 'future'    && <FarmerFutureHarvest />}
            {activeTab === 'orders'    && <FarmerOrders />}
            {activeTab === 'insights'  && <MarketIntelligenceMap />}
            {activeTab === 'transport' && <FarmerTransportTracking />}
            {activeTab === 'storage'   && <StorageAvailability />}
            {activeTab === 'analytics' && <FarmerAnalytics />}
            {activeTab === 'reviews'   && <FarmerReviews />}
          </div>
        </main>

        {/* Demo Pipeline Modal */}
        <AgriPipelineModal
          isOpen={showPipelineModal}
          onClose={() => setShowPipelineModal(false)}
        />
      </div>
    </FarmBackground>
  );
};

export default FarmerDashboard;
