import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LogOut, Search, Map, ClipboardList, Menu, X, User, Zap, Sprout, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from '../components/NotificationBell';

import BuyerExplore from '../components/dashboard/BuyerExplore';
import BuyerRecommendations from '../components/dashboard/BuyerRecommendations';
import BuyerOrders from '../components/dashboard/BuyerOrders';
import FastBuy from '../components/dashboard/FastBuy';
import PreOrderBuyer from '../components/PreOrderBuyer';
import BuyerShop from '../components/dashboard/BuyerShop';
import FarmBackground from '../components/ui/FarmBackground';
import GlassCard from '../components/ui/GlassCard';
import SetPasswordModal from '../components/SetPasswordModal';

const BuyerDashboard = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('explore');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'explore', label: t('tab_explore'), icon: Search },
    { id: 'shop', label: t('tab_shop'), icon: Store },
    { id: 'fastbuy', label: t('tab_fast_buy') || 'Fast Buy', icon: Zap },
    { id: 'recommendations', label: t('tab_nearby'), icon: Map },
    { id: 'future', label: t('tab_future'), icon: Sprout },
    { id: 'orders', label: t('tab_my_orders'), icon: ClipboardList },
  ];

  const handleTabClick = (id) => {
     setActiveTab(id);
     setIsMobileMenuOpen(false);
  };

  const renderSidebar = () => {
    return (
      <div className="flex flex-col h-full bg-slate-950/40 backdrop-blur-2xl border-r border-white/5">
        <div className="p-10 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/30">
                <Store className="w-5 h-5 text-emerald-500" />
             </div>
             <h1 className="text-xl font-black text-white tracking-tighter uppercase italic">
               Direct
             </h1>
          </div>
          {isMobileMenuOpen && (
             <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-2 text-slate-400 hover:text-white rounded-xl transition-colors">
               <X className="w-6 h-6" />
             </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto py-8 px-6 space-y-3 relative">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-6 px-4">Marketplace</p>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`w-full flex items-center px-5 py-4 text-xs font-bold rounded-2xl transition-all relative z-10 uppercase tracking-widest ${
                  isActive 
                    ? 'text-slate-950' 
                    : tab.id === 'fastbuy' ? 'text-amber-500 hover:bg-amber-500/10' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {isActive && (
                   <motion.div 
                     layoutId="buyer-active-tab"
                     className={`absolute inset-0 rounded-2xl -z-10 shadow-lg ${tab.id === 'fastbuy' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                     transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                   />
                )}
                <Icon className={`w-4 h-4 mr-4 ${isActive ? 'text-slate-950 stroke-[3]' : tab.id === 'fastbuy' ? 'text-amber-500' : 'text-slate-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6 border-t border-white/5 space-y-4 bg-slate-950/20">
          <div className="flex items-center space-x-4 p-4 rounded-2xl bg-white/5 border border-white/5">
             <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/10">
                {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-slate-400 m-2" />}
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user?.name || 'Buyer'}</p>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{user?.role || 'Customer'}</p>
             </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center px-4 py-4 text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all border border-rose-500/20 uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4 mr-3" />
            {t('logout')}
          </button>
        </div>
      </div>
    );
  };

  return (
    <FarmBackground>
      <SetPasswordModal />
      <div className="min-h-screen flex flex-col md:flex-row text-slate-100 font-sans selection:bg-emerald-500/30">
        
        {/* Mobile Header */}
        <header className="md:hidden glass border-b border-white/10 p-4 sticky top-0 z-40 flex justify-between items-center bg-slate-950/40 backdrop-blur-md">
           <div className="flex items-center">
              <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 mr-2 text-slate-400 hover:text-white transition-colors">
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-black text-white tracking-tighter italic uppercase underline decoration-emerald-500 decoration-4 underline-offset-4">Direct</h1>
           </div>
           <div className="flex items-center space-x-3">
              <NotificationBell />
              <div className="w-9 h-9 bg-slate-800 rounded-full flex justify-center items-center overflow-hidden border border-slate-700 shadow-sm ring-2 ring-emerald-500/20">
                 {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-slate-400" />}
              </div>
           </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
             <>
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
                />
                <motion.aside 
                  initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                  transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                  className="fixed inset-y-0 left-0 w-[85vw] max-w-sm z-50 md:hidden flex flex-col shadow-2xl"
                >
                  {renderSidebar()}
                </motion.aside>
             </>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-80 flex-col z-20 shrink-0 sticky top-0 h-screen">
           {renderSidebar()}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full overflow-x-hidden p-6 md:p-12 lg:p-16">
           {/* Section Header */}
           <div className="mb-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4"
              >
                 Marketplace Explore / {activeTab}
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none"
              >
                {tabs.find(t => t.id === activeTab)?.label}
              </motion.h2>
           </div>

           <AnimatePresence mode="wait">
              <motion.div
                 key={activeTab}
                 initial={{ opacity: 0, y: 30 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 transition={{ 
                   type: "spring",
                   damping: 20,
                   stiffness: 100,
                   duration: 0.5 
                 }}
                 className="w-full max-w-7xl mx-auto min-h-[60vh]"
              >
                 <GlassCard className="h-full border-none p-0 bg-transparent backdrop-blur-none shadow-none">
                    {activeTab === 'explore' && <BuyerExplore />}
                    {activeTab === 'shop' && <BuyerShop />}
                    {activeTab === 'fastbuy' && <FastBuy />}
                    {activeTab === 'recommendations' && <BuyerRecommendations />}
                    {activeTab === 'future' && <PreOrderBuyer />}
                    {activeTab === 'orders' && <BuyerOrders />}
                 </GlassCard>
              </motion.div>
           </AnimatePresence>
        </main>
      </div>
    </FarmBackground>
  );
};

export default BuyerDashboard;
