import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  LogOut, 
  Search, 
  Map, 
  ClipboardList, 
  Menu, 
  X, 
  User, 
  Zap, 
  Sprout, 
  Store, 
  ShoppingBag, 
  Layers, 
  DollarSign,
  TrendingUp,
  Truck,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from '../components/NotificationBell';

import BuyerExplore from '../components/dashboard/BuyerExplore';
import BuyerRecommendations from '../components/dashboard/BuyerRecommendations';
import BuyerOrders from '../components/dashboard/BuyerOrders';
import FastBuy from '../components/dashboard/FastBuy';
import PreOrderBuyer from '../components/PreOrderBuyer';
import BuyerShop from '../components/dashboard/BuyerShop';
import BuyerProfile from '../components/dashboard/BuyerProfile';
import BulkBuyerCommand from '../components/dashboard/BulkBuyerCommand';
import MarketIntelligenceMap from '../components/dashboard/MarketIntelligenceMap';
import PriceTransparencyScreen from '../components/dashboard/PriceTransparencyScreen';
import DemoRoleSwitcher from '../components/DemoRoleSwitcher';
import FarmBackground from '../components/ui/FarmBackground';
import SetPasswordModal from '../components/SetPasswordModal';
import AgriPipelineModal from '../components/dashboard/AgriPipelineModal';

const BuyerDashboard = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('bulk');
  const [showPipelineModal, setShowPipelineModal] = useState(false);

  const tabs = [
    { id: 'bulk',            label: 'Bulk Procurement & Lots', icon: ShoppingBag },
    { id: 'explore',         label: 'Produce Catalog', icon: Search },
    { id: 'orders',          label: 'My Orders & Traceability', icon: ClipboardList },
    { id: 'future',          label: 'Harvest Reservations', icon: Sprout },
    { id: 'heatmap',         label: 'Supply Corridors Map', icon: Layers },
    { id: 'transparency',    label: 'Price Transparency', icon: DollarSign },
    { id: 'recommendations', label: 'Nearby Farms', icon: Map },
    { id: 'fastbuy',         label: 'Fast Buy', icon: Zap },
    { id: 'profile',         label: 'Profile', icon: User },
  ];

  return (
    <FarmBackground>
      <SetPasswordModal />
      <div className="min-h-screen text-[#17201B] font-sans">
        
        {/* Top Commercial Header */}
        <header className="sticky top-0 z-40 bg-[#F5F3EA]/90 backdrop-blur-md border-b border-[#D8DFD5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
            {/* Brand Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('bulk')}>
              <div className="w-9 h-9 rounded-xl bg-[#123C2A] flex items-center justify-center text-white shadow-sm">
                <Sprout className="h-5 w-5 text-[#7DBA52]" />
              </div>
              <div>
                <span className="text-lg font-black text-[#123C2A] tracking-tight block leading-none">FarmDirect</span>
                <span className="text-[9px] font-bold text-[#66736A] uppercase tracking-wider">Procurement Command Center</span>
              </div>
            </div>

            {/* Center Role Perspective Switcher */}
            <div className="hidden md:block flex-1 max-w-2xl mx-auto">
              <DemoRoleSwitcher onOpenPipelineModal={() => setShowPipelineModal(true)} />
            </div>

            {/* Right User & Notifications */}
            <div className="flex items-center space-x-3">
              <NotificationBell />
              <div className="flex items-center space-x-2.5 pl-3 border-l border-[#D8DFD5]">
                <div className="w-8 h-8 rounded-full bg-[#E8EFE4] text-[#123C2A] flex items-center justify-center font-bold text-xs border border-[#C5DBCC]">
                  {user?.name?.[0] || 'B'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-[#17201B] leading-none">{user?.name || 'Anita Desai'}</p>
                  <p className="text-[10px] text-[#66736A] font-bold mt-0.5">FreshBasket Retail</p>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-[#66736A] hover:text-rose-600 rounded-lg hover:bg-white transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Role Switcher Bar */}
          <div className="md:hidden px-4 pb-3">
            <DemoRoleSwitcher onOpenPipelineModal={() => setShowPipelineModal(true)} />
          </div>

          {/* Horizontal Refined Segmented Navigation Bar */}
          <div className="bg-white border-t border-[#D8DFD5] px-4 sm:px-8">
            <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-[#123C2A] text-white shadow-sm'
                        : 'text-[#66736A] hover:text-[#123C2A] hover:bg-[#F5F3EA]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#7DBA52]' : 'text-[#66736A]'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
          
          {/* Top Procurement Overview Hero Stats Bar */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#D8DFD5] shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E8EFE4]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2F7D4A] block mb-1">
                  Commercial Procurement Overview
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#123C2A] tracking-tight">
                  Good morning, {user?.name || 'Anita Desai'}
                </h2>
                <p className="text-xs text-[#66736A] mt-1">
                  Central Corridor Supply Pipeline • Direct sourcing from 42 verified Tamil Nadu producer clusters
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('bulk')}
                  className="px-4 py-2.5 bg-[#123C2A] hover:bg-[#0B261A] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-[#7DBA52]" /> New Supply Requirement
                </button>
              </div>
            </div>

            {/* 5 Enterprise Procurement Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6">
              <div className="p-3.5 bg-[#F5F3EA] rounded-2xl border border-[#D8DFD5]">
                <span className="text-[10px] font-bold uppercase text-[#66736A] block">Active Orders</span>
                <span className="text-xl font-black text-[#123C2A] font-mono mt-0.5 block">2 Orders</span>
                <span className="text-[10px] text-[#2F7D4A] font-bold mt-0.5 block">2,000 kg In Pipeline</span>
              </div>
              <div className="p-3.5 bg-[#F5F3EA] rounded-2xl border border-[#D8DFD5]">
                <span className="text-[10px] font-bold uppercase text-[#66736A] block">Incoming Supply</span>
                <span className="text-xl font-black text-[#2F7D4A] font-mono mt-0.5 block">2,000 kg</span>
                <span className="text-[10px] text-[#66736A] font-bold mt-0.5 block">Reefer Temp: 11.4°C</span>
              </div>
              <div className="p-3.5 bg-[#F5F3EA] rounded-2xl border border-[#D8DFD5]">
                <span className="text-[10px] font-bold uppercase text-[#66736A] block">Digital Supply Lots</span>
                <span className="text-xl font-black text-[#123C2A] font-mono mt-0.5 block">1 Assembled</span>
                <span className="text-[10px] text-[#66736A] font-bold mt-0.5 block">#FD-TOM-1026</span>
              </div>
              <div className="p-3.5 bg-[#F5F3EA] rounded-2xl border border-[#D8DFD5]">
                <span className="text-[10px] font-bold uppercase text-[#66736A] block">Expected Arrival</span>
                <span className="text-xl font-black text-[#123C2A] font-mono mt-0.5 block">Today 07:30 PM</span>
                <span className="text-[10px] text-[#2F7D4A] font-bold mt-0.5 block">Chennai Terminal</span>
              </div>
              <div className="p-3.5 bg-[#E8EFE4] rounded-2xl border border-[#C5DBCC]">
                <span className="text-[10px] font-bold uppercase text-[#1D4E2F] block">Verified Savings</span>
                <span className="text-xl font-black text-[#1D4E2F] font-mono mt-0.5 block">₹28,400</span>
                <span className="text-[10px] text-[#2F7D4A] font-bold mt-0.5 block">Zero Brokerage</span>
              </div>
            </div>
          </div>

          {/* Active Tab View */}
          <div className="w-full">
            {activeTab === 'bulk'            && <BulkBuyerCommand onProcurementConfirmed={() => setActiveTab('orders')} />}
            {activeTab === 'explore'         && <BuyerExplore />}
            {activeTab === 'orders'          && <BuyerOrders />}
            {activeTab === 'future'          && <PreOrderBuyer />}
            {activeTab === 'heatmap'         && <MarketIntelligenceMap />}
            {activeTab === 'transparency'    && <PriceTransparencyScreen />}
            {activeTab === 'recommendations' && <BuyerRecommendations />}
            {activeTab === 'fastbuy'         && <FastBuy />}
            {activeTab === 'profile'         && <BuyerProfile />}
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

export default BuyerDashboard;
