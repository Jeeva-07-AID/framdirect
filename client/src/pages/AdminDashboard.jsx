import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, BarChart3, Layers, DollarSign, LogOut } from 'lucide-react';
import FarmBackground from '../components/ui/FarmBackground';
import MarketIntelligenceMap from '../components/dashboard/MarketIntelligenceMap';
import PriceTransparencyScreen from '../components/dashboard/PriceTransparencyScreen';
import DemoRoleSwitcher from '../components/DemoRoleSwitcher';
import AgriPipelineModal from '../components/dashboard/AgriPipelineModal';

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('heatmap');
  const [showPipelineModal, setShowPipelineModal] = useState(false);

  return (
    <FarmBackground>
      <div className="min-h-screen text-[#17201B] font-sans">
        
        {/* Top Header */}
        <header className="bg-white border-b border-[#D8DFD5] sticky top-0 z-40 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-[#123C2A] flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4 text-[#7DBA52]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-lg text-[#123C2A] tracking-tight">
                    FarmDirect Platform Governance
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#E8EFE4] text-[#123C2A] text-[10px] font-bold uppercase tracking-wider border border-[#D8DFD5]">
                    System Oversight
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={logout}
                className="p-2 text-[#66736A] hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub Navigation Bar */}
          <div className="border-t border-[#D8DFD5] bg-[#F5F3EA]/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <nav className="flex space-x-2 py-2">
                <button
                  onClick={() => setActiveTab('heatmap')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'heatmap'
                      ? 'bg-[#123C2A] text-white shadow-xs'
                      : 'text-[#66736A] hover:text-[#17201B] hover:bg-white'
                  }`}
                >
                  <Layers className={`w-3.5 h-3.5 ${activeTab === 'heatmap' ? 'text-[#7DBA52]' : 'text-[#66736A]'}`} />
                  Supply-Demand Heatmap & Corridors
                </button>

                <button
                  onClick={() => setActiveTab('transparency')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'transparency'
                      ? 'bg-[#123C2A] text-white shadow-xs'
                      : 'text-[#66736A] hover:text-[#17201B] hover:bg-white'
                  }`}
                >
                  <DollarSign className={`w-3.5 h-3.5 ${activeTab === 'transparency' ? 'text-[#7DBA52]' : 'text-[#66736A]'}`} />
                  Price Spread Audit & Impact Ledger
                </button>
              </nav>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Perspective Switcher */}
          <DemoRoleSwitcher onOpenPipelineModal={() => setShowPipelineModal(true)} />

          {/* Tab Content */}
          {activeTab === 'heatmap' && <MarketIntelligenceMap />}
          {activeTab === 'transparency' && <PriceTransparencyScreen />}
        </div>

        {/* Demo Pipeline Modal */}
        <AgriPipelineModal
          isOpen={showPipelineModal}
          onClose={() => setShowPipelineModal(false)}
        />
      </div>
    </FarmBackground>
  );
};

export default AdminDashboard;
