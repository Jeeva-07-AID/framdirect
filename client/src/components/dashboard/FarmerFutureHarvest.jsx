import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, MapPin, Package, Plus, Trash2, Loader2, Sprout, 
  TrendingUp, Clock, CheckCircle2, AlertCircle, X, Sparkles, 
  Users, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { getFarmerPreOrders, addPreOrder, deletePreOrder } from '../../services/preOrderService';
import { harvestPlanningService } from '../../services/harvestPlanningService';
import { supplyChainService } from '../../services/supplyChainService';
import { notifySuccess } from '../../services/notificationService';

const FarmerFutureHarvest = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [preOrders, setPreOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newHarvest, setNewHarvest] = useState({
    product_name: 'Tomato (Hybrid Shivam)',
    expected_quantity: '500',
    cultivation_date: '2026-08-10',
    harvest_date: '2026-09-24',
    location: user?.location || 'Trichy Rural Cluster',
    expected_price: '38'
  });
  const [error, setError] = useState(null);

  // Active AI Harvest Evaluation for the primary scenario harvest
  const [aiEvaluation, setAiEvaluation] = useState(() => 
    harvestPlanningService.evaluateHarvestPlan({
      crop: 'Tomato',
      quantityKg: 500,
      harvestDate: '2026-09-24',
      location: 'Trichy',
      expectedPrice: 38
    })
  );

  useEffect(() => {
    fetchPreOrders();

    const unsubscribe = supplyChainService.subscribe(() => {
      fetchPreOrders();
    });
    return () => unsubscribe();
  }, [user?.id]);

  const fetchPreOrders = async () => {
    try {
      setLoading(true);
      let data = [];
      if (user?.id) {
        data = await getFarmerPreOrders(user.id);
      }
      
      const scHarvests = supplyChainService.getHarvests().map(h => ({
        id: h.id,
        product_name: `${h.crop} (${h.variety})`,
        expected_quantity: h.expectedQuantityKg,
        available_quantity: h.availableQuantityKg,
        allocated_quantity: h.allocatedQuantityKg,
        cultivation_date: h.cultivationDate,
        harvest_date: h.harvestDate,
        location: h.location,
        status: h.status,
        expected_price: h.unitPrice,
        isFromSupplyChain: true
      }));

      const merged = [...(data || [])];
      for (const item of scHarvests) {
        if (!merged.some(m => m.id === item.id)) {
          merged.push(item);
        }
      }

      setPreOrders(merged);
    } catch (err) {
      console.error('Failed to fetch pre-orders:', err);
      setError('Failed to load harvest schedule.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddHarvest = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      let created;
      if (user?.id) {
        created = await addPreOrder({
          ...newHarvest,
          farmer_id: user.id
        });
      } else {
        created = {
          id: 'harvest-' + Date.now(),
          ...newHarvest
        };
      }

      // Publish to global Supply Chain State
      supplyChainService.publishHarvest({
        farmerId: user?.id || 'farmer-ravi-teja',
        farmerName: user?.name || 'Ravi Teja Farms (Farmer A)',
        role: 'Farmer',
        crop: newHarvest.product_name.includes('Tomato') ? 'Tomato' : newHarvest.product_name,
        variety: 'Grade A Quality',
        expectedQuantityKg: Number(newHarvest.expected_quantity),
        unitPrice: Number(newHarvest.expected_price) || 38,
        harvestDate: newHarvest.harvest_date,
        cultivationDate: newHarvest.cultivation_date,
        location: newHarvest.location,
        qualityGrade: 'Grade A'
      });

      setPreOrders([created, ...preOrders]);
      setIsAdding(false);

      const evalResult = harvestPlanningService.evaluateHarvestPlan({
        crop: newHarvest.product_name,
        quantityKg: Number(newHarvest.expected_quantity),
        harvestDate: newHarvest.harvest_date,
        location: newHarvest.location,
        expectedPrice: Number(newHarvest.expected_price) || 38
      });
      setAiEvaluation(evalResult);

      notifySuccess('Harvest Registered', 'Crop registered and published to regional bulk matching engine.');
    } catch (err) {
      setError('Failed to register harvest plan.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this harvest entry?')) {
      try {
        if (user?.id && !id.toString().startsWith('demo-') && !id.toString().startsWith('harv-')) {
          await deletePreOrder(id);
        }
        setPreOrders(preOrders.filter(p => p.id !== id));
        notifySuccess('Removed', 'Harvest plan removed.');
      } catch (err) {
        setError('Failed to delete entry.');
      }
    }
  };

  const getDaysUntilHarvest = (date) => {
    const today = new Date('2026-09-22');
    const harvest = new Date(date);
    const diffTime = harvest - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#D8DFD5] gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#2F7D4A]">Supply Intelligence</span>
          <h2 className="text-2xl font-serif font-bold text-[#17201B]">Harvest Planning & Forward Contracts</h2>
          <p className="text-xs text-[#66736A] mt-1">
            Log planting schedules to receive forward purchase offers from verified bulk buyers prior to harvest.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#123C2A] hover:bg-[#1E4D36] text-white font-bold rounded-lg transition-colors shadow-sm cursor-pointer text-xs uppercase tracking-wider"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4 text-[#7DBA52]" />}
          {isAdding ? 'Cancel Entry' : 'Plan New Harvest'}
        </button>
      </div>

      {/* Demand Evaluation Hero Card */}
      <div className="bg-white rounded-xl border border-[#D8DFD5] p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#D8DFD5]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2F7D4A] block mb-1">
              Regional Demand Matching Evaluation
            </span>
            <h3 className="text-xl font-serif font-bold text-[#17201B]">
              Scheduled Harvest: {aiEvaluation.crop} — {aiEvaluation.quantityKg} kg
            </h3>
            <p className="text-xs text-[#66736A] mt-1 max-w-xl leading-relaxed">
              {aiEvaluation.aiRecommendation}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="p-3 bg-[#F5F3EA] border border-[#D8DFD5] rounded-lg text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Regional Need</span>
              <span className="text-base font-bold text-[#17201B] font-mono mt-0.5 block">{aiEvaluation.predictedDemandKg} kg</span>
            </div>
            <div className="p-3 bg-[#F5F3EA] border border-[#D8DFD5] rounded-lg text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Cluster Supply</span>
              <span className="text-base font-bold text-[#66736A] font-mono mt-0.5 block">{aiEvaluation.existingUpcomingSupplyKg} kg</span>
            </div>
            <div className="p-3 bg-[#E8EFE4] border border-[#7DBA52] rounded-lg text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#123C2A] block">Supply Deficit</span>
              <span className="text-base font-bold text-[#2F7D4A] font-mono mt-0.5 block">+{aiEvaluation.supplyGapKg} kg</span>
            </div>
          </div>
        </div>

        {/* Matched Buyer Pre-Order Opportunity */}
        <div className="pt-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#E8EFE4] flex items-center justify-center text-[#123C2A]">
              <Users className="w-4 h-4 text-[#2F7D4A]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#17201B]">
                Matched Institutional Buyer: <span className="text-[#123C2A]">{aiEvaluation.potentialBuyerOpportunities[0]?.buyerName}</span>
              </p>
              <p className="text-[11px] text-[#66736A]">
                Requires {aiEvaluation.potentialBuyerOpportunities[0]?.procurementNeedKg} kg for {aiEvaluation.potentialBuyerOpportunities[0]?.destination} • Max Offer ₹{aiEvaluation.potentialBuyerOpportunities[0]?.maxOfferPrice}/kg
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#123C2A] font-mono">
              Suggested Farmgate: ₹{aiEvaluation.suggestedPreOrderPriceMin} - ₹{aiEvaluation.suggestedPreOrderPriceMax}/kg
            </span>
            <span className="px-2.5 py-1 bg-[#E8EFE4] text-[#2F7D4A] text-[10px] font-bold uppercase rounded-md border border-[#D8DFD5]">
              {aiEvaluation.opportunityTier}
            </span>
          </div>
        </div>
      </div>

      {/* Add Harvest Form Modal / Drawer */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form 
              onSubmit={handleAddHarvest}
              className="bg-white border border-[#D8DFD5] p-6 rounded-xl shadow-sm space-y-6"
            >
              <h4 className="text-base font-bold text-[#17201B] pb-3 border-b border-[#D8DFD5]">
                Register New Cultivation Cycle
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-[#66736A] uppercase tracking-wider block mb-1">Crop & Variety</label>
                  <input
                    required
                    type="text"
                    value={newHarvest.product_name}
                    onChange={(e) => setNewHarvest({ ...newHarvest, product_name: e.target.value })}
                    className="w-full bg-[#F5F3EA]/50 border border-[#D8DFD5] rounded-lg px-3 py-2 text-xs text-[#17201B] font-semibold focus:border-[#2F7D4A] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#66736A] uppercase tracking-wider block mb-1">Expected Yield (kg)</label>
                  <input
                    required
                    type="number"
                    value={newHarvest.expected_quantity}
                    onChange={(e) => setNewHarvest({ ...newHarvest, expected_quantity: e.target.value })}
                    className="w-full bg-[#F5F3EA]/50 border border-[#D8DFD5] rounded-lg px-3 py-2 text-xs text-[#17201B] font-mono font-bold focus:border-[#2F7D4A] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#66736A] uppercase tracking-wider block mb-1">Desired Farmgate (₹/kg)</label>
                  <input
                    required
                    type="number"
                    value={newHarvest.expected_price}
                    onChange={(e) => setNewHarvest({ ...newHarvest, expected_price: e.target.value })}
                    className="w-full bg-[#F5F3EA]/50 border border-[#D8DFD5] rounded-lg px-3 py-2 text-xs text-[#123C2A] font-mono font-bold focus:border-[#2F7D4A] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#66736A] uppercase tracking-wider block mb-1">Farm Location</label>
                  <input
                    required
                    type="text"
                    value={newHarvest.location}
                    onChange={(e) => setNewHarvest({ ...newHarvest, location: e.target.value })}
                    className="w-full bg-[#F5F3EA]/50 border border-[#D8DFD5] rounded-lg px-3 py-2 text-xs text-[#17201B] font-semibold focus:border-[#2F7D4A] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#66736A] uppercase tracking-wider block mb-1">Cultivation Start</label>
                  <input
                    required
                    type="date"
                    value={newHarvest.cultivation_date}
                    onChange={(e) => setNewHarvest({ ...newHarvest, cultivation_date: e.target.value })}
                    className="w-full bg-[#F5F3EA]/50 border border-[#D8DFD5] rounded-lg px-3 py-2 text-xs text-[#17201B] font-semibold focus:border-[#2F7D4A] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#66736A] uppercase tracking-wider block mb-1">Expected Harvest Date</label>
                  <input
                    required
                    type="date"
                    value={newHarvest.harvest_date}
                    onChange={(e) => setNewHarvest({ ...newHarvest, harvest_date: e.target.value })}
                    className="w-full bg-[#F5F3EA]/50 border border-[#D8DFD5] rounded-lg px-3 py-2 text-xs text-[#17201B] font-semibold focus:border-[#2F7D4A] outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#D8DFD5]">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#123C2A] hover:bg-[#1E4D36] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Publish to Matching Pool
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Harvest Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {preOrders.map((item) => {
          const daysLeft = getDaysUntilHarvest(item.harvest_date);
          return (
            <div
              key={item.id}
              className="bg-white border border-[#D8DFD5] rounded-xl p-6 shadow-sm hover:border-[#2F7D4A] transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E8EFE4] text-[#123C2A] text-[10px] font-bold uppercase tracking-wider border border-[#D8DFD5]">
                    🌱 Cultivation Lot
                  </span>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-1 text-[#66736A] hover:text-rose-600 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h4 className="text-base font-bold text-[#17201B]">{item.product_name}</h4>
                <p className="text-xs text-[#66736A] flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#2F7D4A]" /> {item.location}
                </p>

                <div className="grid grid-cols-2 gap-3 my-4">
                  <div className="p-3 bg-[#F5F3EA] rounded-lg border border-[#D8DFD5]">
                    <span className="text-[10px] uppercase font-bold text-[#66736A] block">Planned Yield</span>
                    <span className="text-sm font-bold text-[#17201B] font-mono block mt-0.5">{item.expected_quantity} kg</span>
                  </div>
                  <div className="p-3 bg-[#F5F3EA] rounded-lg border border-[#D8DFD5]">
                    <span className="text-[10px] uppercase font-bold text-[#66736A] block">Harvest In</span>
                    <span className="text-sm font-bold text-[#D9A441] font-mono block mt-0.5">
                      {daysLeft > 0 ? `${daysLeft} Days` : 'Ready'}
                    </span>
                  </div>
                </div>

                {item.allocated_quantity > 0 && (
                  <div className="p-3 rounded-lg bg-[#E8EFE4] border border-[#7DBA52] my-3">
                    <div className="flex justify-between text-xs font-bold text-[#123C2A]">
                      <span>B2B Contract Allocation:</span>
                      <span className="font-mono">{item.allocated_quantity} kg Reserved</span>
                    </div>
                    <div className="text-[11px] text-[#2F7D4A] mt-0.5 font-medium">
                      Remaining Available: {item.available_quantity || 0} kg
                    </div>
                  </div>
                )}

                <div className="text-xs text-[#66736A] space-y-1.5 pt-2">
                  <div className="flex justify-between">
                    <span>Sowing Date:</span>
                    <span className="text-[#17201B] font-mono font-medium">{item.cultivation_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Harvest Date:</span>
                    <span className="text-[#2F7D4A] font-mono font-bold">{item.harvest_date}</span>
                  </div>
                  {item.expected_price && (
                    <div className="flex justify-between">
                      <span>Agreed Farmgate:</span>
                      <span className="text-[#123C2A] font-mono font-bold">₹{item.expected_price}/kg</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#D8DFD5] flex items-center justify-between text-xs">
                {item.status === 'FULLY_RESERVED' ? (
                  <span className="px-2 py-0.5 rounded bg-[#E8EFE4] text-[#123C2A] text-[10px] font-bold uppercase border border-[#7DBA52]">
                    ✓ 100% Reserved
                  </span>
                ) : item.status === 'PARTIALLY_RESERVED' ? (
                  <span className="px-2 py-0.5 rounded bg-[#D9A441]/15 text-[#D9A441] text-[10px] font-bold uppercase">
                    Partially Reserved
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-[#E8EFE4] text-[#2F7D4A] text-[10px] font-bold uppercase border border-[#D8DFD5]">
                    Open for Pre-Orders
                  </span>
                )}
                <span className="text-[11px] text-[#66736A] font-semibold">Grade A Quality</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FarmerFutureHarvest;
