import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Truck, Navigation, ShieldCheck, LogOut, CheckCircle2, Phone, AlertCircle } from 'lucide-react';
import FarmBackground from '../components/ui/FarmBackground';
import LogisticsCommandCenter from '../components/dashboard/LogisticsCommandCenter';
import DemoRoleSwitcher from '../components/DemoRoleSwitcher';
import AgriPipelineModal from '../components/dashboard/AgriPipelineModal';

export const LogisticsDashboard = () => {
  const { user, logout } = useAuth();
  const [showPipelineModal, setShowPipelineModal] = useState(false);

  return (
    <FarmBackground>
      <div className="min-h-screen text-[#17201B] font-sans">
        
        {/* Top Header */}
        <header className="bg-white border-b border-[#D8DFD5] sticky top-0 z-40 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-[#123C2A] flex items-center justify-center text-white">
                <Truck className="w-4 h-4 text-[#7DBA52]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-lg text-[#123C2A] tracking-tight">
                    ColdFleet Express Dispatch
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#E8EFE4] text-[#123C2A] text-[10px] font-bold uppercase tracking-wider border border-[#D8DFD5]">
                    Fleet Carrier
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-[#17201B] leading-none">Tamil Nadu Reefer Fleet</p>
                <p className="text-[10px] text-[#66736A] mt-0.5">8 Active Corridor Vehicles</p>
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
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Platform Perspective Switcher */}
          <DemoRoleSwitcher onOpenPipelineModal={() => setShowPipelineModal(true)} />

          {/* Logistics Command Center Hero */}
          <LogisticsCommandCenter />
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

export default LogisticsDashboard;
