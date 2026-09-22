import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  Users, Package, Sprout, ShoppingCart, Warehouse, Truck, 
  DollarSign, PlusCircle, CheckCircle2, TrendingUp, ShieldCheck, 
  LogOut, ArrowRight, UserPlus, Check 
} from 'lucide-react';
import FarmBackground from '../components/ui/FarmBackground';
import DemoRoleSwitcher from '../components/DemoRoleSwitcher';
import AgriPipelineModal from '../components/dashboard/AgriPipelineModal';
import { notifySuccess } from '../services/notificationService';

export const FPODashboard = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('inventory');
  const [showPipelineModal, setShowPipelineModal] = useState(false);

  // Member Farmers Mock Data
  const [memberFarmers, setMemberFarmers] = useState([
    { id: 'f-1', name: 'Ravi Teja', village: 'Lalgudi, Trichy', acreage: 4.5, crops: 'Tomato, Chili', harvestDate: '24 Sep', status: 'Active' },
    { id: 'f-2', name: 'Murugesan K.', village: 'Manapparai, Trichy', acreage: 6.0, crops: 'Tomato, Onion', harvestDate: '26 Sep', status: 'Active' },
    { id: 'f-3', name: 'Selvaraj P.', village: 'Musiri, Trichy', acreage: 3.5, crops: 'Tomato, Banana', harvestDate: '27 Sep', status: 'Active' },
    { id: 'f-4', name: 'Kavitha R.', village: 'Thuraiyur, Trichy', acreage: 5.0, crops: 'Tomato, Shallots', harvestDate: '29 Sep', status: 'Active' },
  ]);

  // Aggregated Inventory
  const [inventory, setInventory] = useState([
    { crop: 'Tomato (Hybrid Grade A)', totalPooledKg: 4200, memberContributors: 14, targetWholesalePrice: 38, status: 'Ready for Bulk Dispatch' },
    { crop: 'Small Onion (Shallots)', totalPooledKg: 3100, memberContributors: 8, targetWholesalePrice: 32, status: 'Graded & Stored' },
    { crop: 'Banana (Poovan)', totalPooledKg: 5800, memberContributors: 12, targetWholesalePrice: 28, status: 'Cold Chain Buffer' },
  ]);

  // Bulk Buyer RFQs
  const [activeRFQs, setActiveRFQs] = useState([
    {
      id: 'RFQ-101',
      buyer: 'FreshBasket Supermarkets Ltd.',
      crop: 'Tomato',
      requiredKg: 2000,
      destination: 'Chennai Urban Hub',
      targetDate: '25 Sep 2026',
      offeredPrice: 40,
      allocatedKg: 800,
      status: 'Matched (800 kg FPO Quota Allocated)'
    },
    {
      id: 'RFQ-102',
      buyer: 'Madurai Retailers Alliance',
      crop: 'Shallots',
      requiredKg: 1500,
      destination: 'Madurai Terminal',
      targetDate: '28 Sep 2026',
      offeredPrice: 34,
      allocatedKg: 1500,
      status: 'Ready to Accept'
    }
  ]);

  const [newFarmerName, setNewFarmerName] = useState('');
  const [newFarmerVillage, setNewFarmerVillage] = useState('');
  const [newFarmerAcreage, setNewFarmerAcreage] = useState('');

  const handleRegisterFarmer = (e) => {
    e.preventDefault();
    if (!newFarmerName) return;
    const newEntry = {
      id: 'f-' + (memberFarmers.length + 1),
      name: newFarmerName,
      village: newFarmerVillage || 'Trichy Rural',
      acreage: Number(newFarmerAcreage) || 3.0,
      crops: 'Tomato, Vegetables',
      harvestDate: 'Next Week',
      status: 'Active'
    };
    setMemberFarmers([newEntry, ...memberFarmers]);
    setNewFarmerName('');
    setNewFarmerVillage('');
    setNewFarmerAcreage('');
    notifySuccess('Farmer Registered', `${newEntry.name} enrolled in FPO collective.`);
  };

  const handleAcceptRFQ = (rfqId) => {
    setActiveRFQs(prev => prev.map(r => r.id === rfqId ? { ...r, status: 'Contract Executed & Dispatched' } : r));
    notifySuccess('Contract Accepted', 'Consolidated pickup scheduled across member farms.');
  };

  return (
    <FarmBackground>
      <div className="min-h-screen text-[#17201B] font-sans">
        
        {/* Top Header */}
        <header className="bg-white border-b border-[#D8DFD5] sticky top-0 z-40 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-[#123C2A] flex items-center justify-center text-white">
                <Users className="w-4 h-4 text-[#7DBA52]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-lg text-[#123C2A] tracking-tight">
                    Trichy Agro Collective (FPO)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#E8EFE4] text-[#123C2A] text-[10px] font-bold uppercase tracking-wider border border-[#D8DFD5]">
                    Aggregation Hub
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-[#17201B] leading-none">NABARD Registered FPO</p>
                <p className="text-[10px] text-[#66736A] mt-0.5">{memberFarmers.length} Member Producers</p>
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

          {/* Sub Navigation Bar */}
          <div className="border-t border-[#D8DFD5] bg-[#F5F3EA]/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <nav className="flex space-x-2 py-2">
                {[
                  { id: 'inventory', label: 'Aggregated Supply Pool', icon: Package },
                  { id: 'rfq', label: 'Institutional Demand RFQs', icon: ShoppingCart },
                  { id: 'members', label: 'Member Producer Registry', icon: Users },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
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

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Perspective Switcher */}
          <DemoRoleSwitcher onOpenPipelineModal={() => setShowPipelineModal(true)} />

          {/* Aggregated Inventory Tab */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-[#D8DFD5] p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#D8DFD5] gap-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#2F7D4A]">Supply Consolidation</span>
                    <h3 className="text-xl font-serif font-bold text-[#17201B]">Pooled Regional Harvest Stock</h3>
                    <p className="text-xs text-[#66736A] mt-0.5">
                      Combines smallholder outputs into institutional-grade lot sizes for supermarket contracts.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#123C2A] font-mono bg-[#E8EFE4] px-3 py-1.5 rounded-lg border border-[#D8DFD5]">
                    Total Pooled: 13,100 kg
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                  {inventory.map((item, idx) => (
                    <div key={idx} className="p-5 rounded-xl bg-[#F5F3EA]/40 border border-[#D8DFD5] flex flex-col justify-between">
                      <div>
                        <span className="px-2 py-0.5 rounded bg-white text-[#123C2A] text-[10px] font-bold uppercase tracking-wider border border-[#D8DFD5]">
                          {item.status}
                        </span>
                        <h4 className="text-base font-bold text-[#17201B] mt-2">{item.crop}</h4>
                        <div className="my-3 p-3 bg-white rounded-lg border border-[#D8DFD5] grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-[#66736A] block">Pooled Volume</span>
                            <span className="text-lg font-bold text-[#123C2A] font-mono">{item.totalPooledKg.toLocaleString()} kg</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-[#66736A] block">Floor Rate</span>
                            <span className="text-lg font-bold text-[#2F7D4A] font-mono">₹{item.targetWholesalePrice}/kg</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-[#66736A]">
                        Aggregated from <strong>{item.memberContributors} smallholder farmers</strong>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Institutional RFQ Demand Tab */}
          {activeTab === 'rfq' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-[#D8DFD5] p-6 shadow-sm">
                <div className="pb-4 border-b border-[#D8DFD5] mb-6">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#2F7D4A]">Forward Bulk Demand</span>
                  <h3 className="text-xl font-serif font-bold text-[#17201B]">Institutional Buyer Procurement Contracts</h3>
                  <p className="text-xs text-[#66736A] mt-0.5">
                    Match consolidated FPO farmgate supply directly against verified bulk purchaser RFQs.
                  </p>
                </div>

                <div className="space-y-4">
                  {activeRFQs.map((rfq) => (
                    <div key={rfq.id} className="p-5 rounded-xl border border-[#D8DFD5] bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-bold text-[#66736A]">{rfq.id}</span>
                          <span className="px-2 py-0.5 rounded bg-[#E8EFE4] text-[#123C2A] text-[10px] font-bold uppercase tracking-wider border border-[#D8DFD5]">
                            {rfq.status}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-[#17201B]">{rfq.buyer}</h4>
                        <p className="text-xs text-[#66736A] mt-1">
                          Demand: <strong>{rfq.requiredKg.toLocaleString()} kg of {rfq.crop}</strong> for {rfq.destination} by {rfq.targetDate}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-[10px] font-bold uppercase text-[#66736A] block">Offered Farmgate</span>
                          <span className="text-xl font-bold text-[#123C2A] font-mono">₹{rfq.offeredPrice}/kg</span>
                        </div>
                        <button
                          onClick={() => handleAcceptRFQ(rfq.id)}
                          className="px-4 py-2 bg-[#123C2A] hover:bg-[#1E4D36] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-sm"
                        >
                          Execute Contract
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Member Registry Tab */}
          {activeTab === 'members' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Member Farmers Table */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-[#D8DFD5] p-6 shadow-sm overflow-hidden">
                <div className="pb-4 border-b border-[#D8DFD5] mb-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#2F7D4A]">Network Roster</span>
                    <h3 className="text-lg font-serif font-bold text-[#17201B]">Enrolled Member Producers</h3>
                  </div>
                  <span className="text-xs text-[#66736A] font-semibold">{memberFarmers.length} Farmers Enrolled</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#D8DFD5] text-[#66736A] font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-3">Producer</th>
                        <th className="py-2.5 px-3">Village</th>
                        <th className="py-2.5 px-3">Acreage</th>
                        <th className="py-2.5 px-3">Primary Crops</th>
                        <th className="py-2.5 px-3">Harvest</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D8DFD5]">
                      {memberFarmers.map((f) => (
                        <tr key={f.id} className="hover:bg-[#F5F3EA]/50">
                          <td className="py-3 px-3 font-bold text-[#17201B]">{f.name}</td>
                          <td className="py-3 px-3 text-[#66736A]">{f.village}</td>
                          <td className="py-3 px-3 font-mono font-semibold">{f.acreage} ac</td>
                          <td className="py-3 px-3 text-[#17201B]">{f.crops}</td>
                          <td className="py-3 px-3 font-mono text-[#2F7D4A] font-bold">{f.harvestDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Enroll Form */}
              <div className="bg-white rounded-xl border border-[#D8DFD5] p-6 shadow-sm">
                <h4 className="text-base font-serif font-bold text-[#17201B] mb-4 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#2F7D4A]" />
                  Enroll Member Producer
                </h4>
                <form onSubmit={handleRegisterFarmer} className="space-y-4 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-[#66736A] uppercase tracking-wider block mb-1">Farmer Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Annamalai S."
                      value={newFarmerName}
                      onChange={(e) => setNewFarmerName(e.target.value)}
                      className="w-full bg-[#F5F3EA]/50 border border-[#D8DFD5] rounded-lg px-3 py-2 text-xs text-[#17201B] outline-none focus:border-[#2F7D4A]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#66736A] uppercase tracking-wider block mb-1">Village & Block</label>
                    <input
                      type="text"
                      placeholder="e.g. Lalgudi, Trichy"
                      value={newFarmerVillage}
                      onChange={(e) => setNewFarmerVillage(e.target.value)}
                      className="w-full bg-[#F5F3EA]/50 border border-[#D8DFD5] rounded-lg px-3 py-2 text-xs text-[#17201B] outline-none focus:border-[#2F7D4A]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#66736A] uppercase tracking-wider block mb-1">Holding (Acres)</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 4.0"
                      value={newFarmerAcreage}
                      onChange={(e) => setNewFarmerAcreage(e.target.value)}
                      className="w-full bg-[#F5F3EA]/50 border border-[#D8DFD5] rounded-lg px-3 py-2 text-xs text-[#17201B] outline-none focus:border-[#2F7D4A]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#123C2A] hover:bg-[#1E4D36] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-sm"
                  >
                    Enroll in FPO Registry
                  </button>
                </form>
              </div>
            </div>
          )}
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

export default FPODashboard;
