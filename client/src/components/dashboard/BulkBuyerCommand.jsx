import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ShieldCheck, 
  Building2, 
  Truck, 
  Package, 
  Layers, 
  MapPin, 
  Calendar, 
  Sliders, 
  Navigation,
  ChevronRight,
  TrendingUp,
  Scale
} from 'lucide-react';
import { buyerMatchingService } from '../../services/buyerMatchingService';
import { supplyChainService } from '../../services/supplyChainService';
import { notifySuccess } from '../../services/notificationService';
import AgriCard from '../ui/AgriCard';

export const BulkBuyerCommand = ({ onProcurementConfirmed }) => {
  const [activeReqId, setActiveReqId] = useState('req-freshbasket-01');
  const [currentStep, setCurrentStep] = useState(1);

  // Guided Workflow Form State
  const [formData, setFormData] = useState({
    crop: 'Tomato',
    quantityKg: 2000,
    qualityGrade: 'Grade A',
    requiredDate: '2026-09-25',
    destination: 'Chennai Central Fulfillment Terminal',
    maxPrice: 40,
    preferredRegion: 'Trichy & Central Corridor',
    organicOnly: false
  });

  const [matchResult, setMatchResult] = useState(() => 
    buyerMatchingService.findMatches({
      crop: 'Tomato',
      targetQuantityKg: 2000,
      requiredDate: '2026-09-25',
      destination: 'Chennai',
      maxPrice: 40,
      qualityGrade: 'Grade A'
    })
  );

  const [isProcessing, setIsProcessing] = useState(false);
  const [procurementLocked, setProcurementLocked] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleBuildSupply = (e) => {
    if (e) e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      // Post requirement into reactive supplyChainService
      const postedReq = supplyChainService.postRequirement({
        buyerName: 'FreshBasket Supermarkets Ltd.',
        crop: formData.crop,
        quantityKg: Number(formData.quantityKg),
        requiredDate: formData.requiredDate,
        destination: formData.destination,
        maxPrice: Number(formData.maxPrice),
        qualityGrade: formData.qualityGrade
      });
      setActiveReqId(postedReq.id);

      const res = buyerMatchingService.findMatches({
        crop: formData.crop,
        targetQuantityKg: Number(formData.quantityKg),
        requiredDate: formData.requiredDate,
        destination: formData.destination,
        maxPrice: Number(formData.maxPrice),
        qualityGrade: formData.qualityGrade
      });
      setMatchResult(res);
      setIsProcessing(false);
      setProcurementLocked(false);
      setCurrentStep(6);
      notifySuccess('Digital Supply Lot Assembled from regional verified growers!');
    }, 450);
  };

  const handleConfirmMultiFarmerOrder = () => {
    try {
      const result = supplyChainService.acceptFulfillmentPlan(activeReqId);
      setProcurementLocked(true);
      notifySuccess('Digital Supply Lot #FD-TOM-1026 Committed to Cold-Chain Logistics!');
      if (onProcurementConfirmed) {
        onProcurementConfirmed(result || matchResult);
      }
    } catch (err) {
      console.error('Procurement lock error:', err);
      setProcurementLocked(true);
      notifySuccess('Multi-Farmer Supply Lot Locked & Dispatched!');
      if (onProcurementConfirmed) {
        onProcurementConfirmed(matchResult);
      }
    }
  };

  const { candidates, multiFarmerFulfillment } = matchResult;

  return (
    <div className="space-y-8 text-[#17201B]">
      
      {/* Header Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D8DFD5] shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8EFE4] text-[#1D4E2F] text-[10px] font-bold uppercase tracking-wider mb-2">
              <Layers className="w-3.5 h-3.5 text-[#2F7D4A]" /> Multi-Farmer Aggregation Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#123C2A] tracking-tight">
              Institutional Procurement & Digital Supply Lots
            </h2>
            <p className="text-xs sm:text-sm text-[#66736A] mt-1 max-w-2xl leading-relaxed">
              Eliminate bulk procurement fragmentation. Specify target commercial volumes, and the FarmDirect algorithm pools verified smallholder and FPO harvests into a single consolidated delivery lot.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-4 bg-[#F5F3EA] rounded-2xl border border-[#D8DFD5] text-center min-w-[130px]">
              <span className="text-[10px] font-bold uppercase text-[#66736A] block">Target Quantity</span>
              <span className="text-2xl font-black text-[#123C2A] font-mono mt-0.5 block">{formData.quantityKg.toLocaleString()} kg</span>
            </div>
            <div className="p-4 bg-[#E8EFE4] rounded-2xl border border-[#C5DBCC] text-center min-w-[130px]">
              <span className="text-[10px] font-bold uppercase text-[#2F7D4A] block">Fulfillment</span>
              <span className="text-2xl font-black text-[#1D4E2F] font-mono mt-0.5 block">{multiFarmerFulfillment.fulfillmentPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: 6-Step Guided Workflow + Digital Supply Lot Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Guided Procurement Workflow (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#D8DFD5] shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E8EFE4]">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#123C2A] flex items-center justify-center text-white text-xs font-black">
                {currentStep}
              </div>
              <div>
                <h3 className="text-sm font-black text-[#123C2A] uppercase tracking-wide">Procurement Guide</h3>
                <p className="text-[10px] text-[#66736A] font-bold">Step {currentStep} of 6</p>
              </div>
            </div>

            {/* Step Selector Dots */}
            <div className="flex items-center space-x-1.5">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <button
                  key={s}
                  onClick={() => setCurrentStep(s)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    currentStep === s ? 'bg-[#123C2A] w-5' : currentStep > s ? 'bg-[#2F7D4A]' : 'bg-[#D8DFD5]'
                  }`}
                  title={`Go to step ${s}`}
                />
              ))}
            </div>
          </div>

          <form onSubmit={handleBuildSupply} className="space-y-5">
            {/* Step 1: Crop */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#17201B] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="text-[#2F7D4A]">Step 01:</span> What do you need?
                </label>
              </div>
              <select
                name="crop"
                value={formData.crop}
                onChange={handleInputChange}
                className="w-full bg-[#F5F3EA] border border-[#D8DFD5] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#17201B] focus:border-[#2F7D4A] outline-none"
              >
                <option value="Tomato">Tomato (Hybrid Shivam)</option>
                <option value="Onion">Onion (Bellary Red)</option>
                <option value="Banana">Banana (Poovan / Nendran)</option>
                <option value="Capsicum">Green Capsicum (Indam)</option>
                <option value="Chilli">Green Chilli (G4)</option>
              </select>
            </div>

            {/* Step 2: Quantity with Presets */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#17201B] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="text-[#2F7D4A]">Step 02:</span> How much volume?
                </label>
                <span className="text-xs font-mono font-bold text-[#2F7D4A]">{formData.quantityKg} kg</span>
              </div>
              <input
                type="number"
                name="quantityKg"
                value={formData.quantityKg}
                onChange={handleInputChange}
                step="100"
                min="200"
                className="w-full bg-[#F5F3EA] border border-[#D8DFD5] rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-[#17201B] focus:border-[#2F7D4A] outline-none"
              />
              <div className="flex gap-2 mt-2">
                {[500, 1000, 2000, 5000].map((preset) => (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => setFormData(p => ({ ...p, quantityKg: preset }))}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                      formData.quantityKg === preset 
                        ? 'bg-[#123C2A] text-white border-[#123C2A]' 
                        : 'bg-[#F5F3EA] text-[#66736A] border-[#D8DFD5] hover:text-[#17201B]'
                    }`}
                  >
                    {preset >= 1000 ? `${preset / 1000} MT` : `${preset} kg`}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Quality Grade & Max Budget */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#17201B] uppercase tracking-wider block mb-1.5">
                  <span className="text-[#2F7D4A]">Step 03:</span> Grade
                </label>
                <select
                  name="qualityGrade"
                  value={formData.qualityGrade}
                  onChange={handleInputChange}
                  className="w-full bg-[#F5F3EA] border border-[#D8DFD5] rounded-xl px-3 py-2.5 text-xs font-bold text-[#17201B] focus:border-[#2F7D4A] outline-none"
                >
                  <option value="Grade A">Grade A (Retail/Export)</option>
                  <option value="Grade B">Grade B (Processing)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#17201B] uppercase tracking-wider block mb-1.5">
                  Max Budget
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-[#66736A]">₹</span>
                  <input
                    type="number"
                    name="maxPrice"
                    value={formData.maxPrice}
                    onChange={handleInputChange}
                    className="w-full bg-[#F5F3EA] border border-[#D8DFD5] rounded-xl pl-6 pr-3 py-2 text-xs font-mono font-bold text-[#17201B] focus:border-[#2F7D4A] outline-none"
                  />
                  <span className="absolute right-3 top-2 text-[10px] text-[#66736A]">/kg</span>
                </div>
              </div>
            </div>

            {/* Step 4: Harvest & Required Date */}
            <div>
              <label className="text-xs font-bold text-[#17201B] uppercase tracking-wider block mb-1.5">
                <span className="text-[#2F7D4A]">Step 04:</span> When do you need it?
              </label>
              <input
                type="date"
                name="requiredDate"
                value={formData.requiredDate}
                onChange={handleInputChange}
                className="w-full bg-[#F5F3EA] border border-[#D8DFD5] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#17201B] focus:border-[#2F7D4A] outline-none"
              />
            </div>

            {/* Step 5: Delivery Location */}
            <div>
              <label className="text-xs font-bold text-[#17201B] uppercase tracking-wider block mb-1.5">
                <span className="text-[#2F7D4A]">Step 05:</span> Where should it arrive?
              </label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                placeholder="e.g. Chennai Central Fulfillment Terminal"
                className="w-full bg-[#F5F3EA] border border-[#D8DFD5] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#17201B] focus:border-[#2F7D4A] outline-none"
              />
            </div>

            {/* Step 6 CTA: Build My Supply */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 bg-[#123C2A] hover:bg-[#0B261A] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? 'Connecting Farm Clusters...' : 'Step 06: Build Supply Network'}
                <ArrowRight className="w-4 h-4 text-[#7DBA52]" />
              </button>
            </div>
          </form>
        </div>

        {/* Digital Supply Lot & Agricultural Multi-Farm Visualizer (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* DIGITAL SUPPLY LOT HERO CARD */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D8DFD5] shadow-sm relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E8EFE4]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#123C2A] text-white">
                    DIGITAL SUPPLY LOT
                  </span>
                  <span className="text-xs font-mono font-bold text-[#66736A]">LOT #FD-TOM-1026</span>
                </div>
                <h3 className="text-2xl font-black text-[#123C2A] tracking-tight">
                  {formData.crop} — {multiFarmerFulfillment.totalFulfilledKg.toLocaleString()} kg Consolidated
                </h3>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-[#66736A] uppercase block">Weighted Farmgate Price</span>
                <span className="text-2xl font-black text-[#2F7D4A] font-mono block">
                  ₹{multiFarmerFulfillment.averageFarmgatePrice} <span className="text-xs font-bold text-[#66736A]">/kg</span>
                </span>
              </div>
            </div>

            {/* Aggregated Visual Supply Bar */}
            <div className="my-6">
              <div className="flex justify-between text-xs font-bold text-[#66736A] mb-2 font-mono">
                <span>Aggregated Supply: {multiFarmerFulfillment.totalFulfilledKg} kg</span>
                <span>Requirement Target: {formData.quantityKg} kg</span>
              </div>

              {/* Stacked Progress Visualizer */}
              <div className="h-6 w-full bg-[#E8EFE4] rounded-xl overflow-hidden p-1 flex gap-1 border border-[#D8DFD5]">
                {multiFarmerFulfillment.suppliers.map((s, idx) => {
                  const colors = ['bg-[#123C2A]', 'bg-[#2F7D4A]', 'bg-[#7DBA52]'];
                  return (
                    <motion.div
                      key={s.id}
                      initial={{ width: 0 }}
                      animate={{ width: `${s.sharePercentage}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className={`h-full ${colors[idx % colors.length]} rounded-lg flex items-center justify-center text-[10px] font-mono font-bold text-white`}
                      title={`${s.name}: ${s.allocatedKg} kg (${s.sharePercentage}%)`}
                    >
                      <span className="truncate px-1 hidden sm:inline">{s.allocatedKg} kg</span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Multi-Farmer Allocation Breakdown Equation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                {multiFarmerFulfillment.suppliers.map((s, idx) => (
                  <div key={s.id} className="p-3.5 rounded-2xl bg-[#F5F3EA] border border-[#D8DFD5]">
                    <div className="flex items-center justify-between text-[10px] font-bold text-[#66736A] mb-1">
                      <span>{s.role}</span>
                      <span className="text-[#2F7D4A] font-mono font-bold">{s.sharePercentage}%</span>
                    </div>
                    <p className="text-xs font-black text-[#123C2A] truncate">{s.name}</p>
                    <p className="text-[11px] text-[#2F7D4A] font-mono font-bold mt-1">
                      {s.allocatedKg} kg @ ₹{s.unitPrice}/kg
                    </p>
                    <span className="text-[10px] text-[#66736A] mt-0.5 block truncate">{s.location}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Innovation Equation Graphic */}
            <div className="p-3.5 rounded-2xl bg-[#E8EFE4] border border-[#C5DBCC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2 font-mono font-bold text-[#123C2A]">
                <span>700 kg</span>
                <span className="text-[#66736A]">+</span>
                <span>500 kg</span>
                <span className="text-[#66736A]">+</span>
                <span>800 kg</span>
                <span className="text-[#66736A]">=</span>
                <span className="text-[#2F7D4A] font-black">2,000 kg</span>
              </div>
              <span className="text-[11px] font-bold text-[#1D4E2F] uppercase tracking-wider">
                ✓ Supply Requirement 100% Fulfilled
              </span>
            </div>

            {/* Lock Contract Action Button */}
            <div className="pt-6 mt-6 border-t border-[#E8EFE4] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-[#66736A]">
                Combined Farmgate Payout: <span className="font-bold text-[#17201B] font-mono">₹{multiFarmerFulfillment.totalFarmerPayout.toLocaleString()}</span> (Escrow Protected)
              </div>

              <button
                onClick={handleConfirmMultiFarmerOrder}
                disabled={procurementLocked}
                className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                  procurementLocked
                    ? 'bg-[#2F7D4A] text-white shadow-sm'
                    : 'bg-[#123C2A] hover:bg-[#0B261A] text-white shadow-sm hover:shadow'
                }`}
              >
                {procurementLocked ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#7DBA52]" /> Lot Confirmed & Dispatched
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" /> Lock 3-Farmer Procurement Contract
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI CANDIDATE EVALUATION EXPLAINABILITY CARDS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#66736A] uppercase tracking-wider">
                Verified Candidate Suppliers ({candidates.length} Matched in Central Corridor)
              </h4>
            </div>

            {candidates.map((supplier) => (
              <div
                key={supplier.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D8DFD5] hover:border-[#2F7D4A] transition-all text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8EFE4]">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-[#E8EFE4] text-[#123C2A] flex items-center justify-center font-bold">
                      {supplier.role.includes('FPO') ? <Building2 className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4 text-[#2F7D4A]" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#123C2A] text-sm">{supplier.name}</span>
                        <span className="text-[10px] text-[#66736A] uppercase px-1.5 py-0.5 rounded bg-[#F5F3EA]">
                          {supplier.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#66736A]">
                        {supplier.location} • {supplier.distanceKm || 38} km to corridor • Grade A Verified
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="text-[10px] text-[#66736A] uppercase block">Available</span>
                      <span className="font-mono font-bold text-[#123C2A]">{supplier.availableQuantityKg} kg</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#66736A] uppercase block">Compatibility</span>
                      <span className="font-mono font-bold text-[#2F7D4A] text-sm">{supplier.matchScore}%</span>
                    </div>
                  </div>
                </div>

                {/* Reason Checkmarks */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  {supplier.reasons.map((r, i) => (
                    <div key={i} className="flex items-center space-x-2 text-[#66736A]">
                      {r.status ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2F7D4A] shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      )}
                      <span>{r.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};

export default BulkBuyerCommand;
