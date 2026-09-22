import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Sprout, Users, ShoppingBag, Truck, ShieldCheck, PlayCircle, Globe } from 'lucide-react';

export const DemoRoleSwitcher = ({ onOpenPipelineModal }) => {
  const { user, login } = useAuth();
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const roles = [
    { id: 'Farmer', label: 'Farmer', path: '/farmer-dashboard', icon: Sprout, color: 'from-emerald-500 to-green-600' },
    { id: 'FPO', label: 'FPO Collective', path: '/fpo-dashboard', icon: Users, color: 'from-teal-500 to-cyan-600' },
    { id: 'Buyer', label: 'Bulk Buyer', path: '/buyer-dashboard', icon: ShoppingBag, color: 'from-blue-500 to-indigo-600' },
    { id: 'Logistics', label: 'Logistics', path: '/logistics-dashboard', icon: Truck, color: 'from-amber-500 to-orange-600' },
    { id: 'Admin', label: 'Platform Admin', path: '/admin-dashboard', icon: ShieldCheck, color: 'from-purple-500 to-pink-600' },
  ];

  const handleSwitchRole = (targetRole, path) => {
    const mockSession = {
      user: { id: `demo-${targetRole.toLowerCase()}-user`, email: `${targetRole.toLowerCase()}@farmdirect.ai` },
      access_token: 'demo-token'
    };
    const mockProfile = {
      id: `demo-${targetRole.toLowerCase()}-user`,
      name: `Demo ${targetRole}`,
      role: targetRole,
      phone: '+91 98402 18942',
      location: 'Trichy, Tamil Nadu',
      verified: true
    };
    login(mockSession, mockProfile);
    if (path) {
      navigate(path);
    }
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'ta' ? 'en' : 'ta';
    i18n.changeLanguage(nextLang);
    localStorage.setItem('appLanguage', nextLang);
  };

  return (
    <div className="bg-white/95 backdrop-blur-md border border-[#D8DFD5] rounded-2xl p-2 px-3.5 shadow-[0_2px_8px_rgba(18,60,42,0.04)] flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center space-x-2">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#66736A] pl-1">
          Platform Perspective:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {roles.map((r) => {
            const Icon = r.icon;
            const isActive = user?.role === r.id;
            return (
              <button
                key={r.id}
                onClick={() => handleSwitchRole(r.id, r.path)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#123C2A] text-white shadow-sm ring-1 ring-[#123C2A]'
                    : 'text-[#66736A] hover:text-[#123C2A] hover:bg-[#E8EFE4] border border-transparent'
                }`}
                title={`Switch to ${r.label} View`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#7DBA52]' : 'text-[#66736A]'}`} />
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Language Switcher Button (English / தமிழ்) */}
        <button
          onClick={toggleLanguage}
          className="px-3 py-1.5 rounded-xl bg-[#F5F3EA] hover:bg-[#E8EFE4] border border-[#D8DFD5] text-xs font-bold text-[#17201B] flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Switch Language (English / தமிழ்)"
        >
          <Globe className="w-3.5 h-3.5 text-[#2F7D4A]" />
          <span>{i18n.language === 'ta' ? 'தமிழ்' : 'English'}</span>
        </button>

        {onOpenPipelineModal && (
          <button
            onClick={onOpenPipelineModal}
            className="px-3.5 py-1.5 bg-[#2F7D4A] hover:bg-[#24643B] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <PlayCircle className="w-3.5 h-3.5 text-[#7DBA52]" />
            <span>Supply Intelligence</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default DemoRoleSwitcher;
