import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Snowflake, Wind, Package, MapPin, Phone, Filter,
  ChevronDown, Loader2, Warehouse, AlertTriangle, CheckCircle, Search, X, 
  ArrowRight, Brain, Thermometer, Clock, TrendingUp, ShieldCheck, CheckCircle2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getStorageFacilities } from '../services/storageService';
import StorageReservationModal from './StorageReservationModal';
import { getSavedStorageReservations } from '../services/pipelineService';

// ── Economic Decision Tool: Store vs Sell Advisor ────────────────────────────
const EconomicStorageAdvisor = () => {
  const [selectedCrop, setSelectedCrop] = useState('Tomatoes');

  const economicData = {
    Tomatoes: {
      currentPrice: 28,
      forecastPrice: 35,
      days: 5,
      storageCostPerDay: 0.8,
      recommendation: 'STORE',
      rationale: 'Demand spike in Chennai terminal over the weekend will elevate farmgate prices above cumulative storage expense.'
    },
    Potatoes: {
      currentPrice: 24,
      forecastPrice: 26,
      days: 14,
      storageCostPerDay: 0.25,
      recommendation: 'STORE',
      rationale: 'Stable shelf-life allows farmers to bypass mid-month localized gluts.'
    },
    Onions: {
      currentPrice: 32,
      forecastPrice: 30,
      days: 7,
      storageCostPerDay: 0.4,
      recommendation: 'SELL NOW',
      rationale: 'Northern harvest arrivals anticipated next week will increase overall supply and soften prices.'
    }
  };

  const curr = economicData[selectedCrop] || economicData.Tomatoes;
  const totalStorageCost = (curr.storageCostPerDay * curr.days).toFixed(2);
  const netGain = (curr.forecastPrice - curr.currentPrice - Number(totalStorageCost)).toFixed(2);
  const isStore = curr.recommendation === 'STORE';

  return (
    <div className="bg-white rounded-xl border border-[#D8DFD5] shadow-sm p-6 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#D8DFD5]">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#2F7D4A]">
            AI Economic Decision Engine
          </span>
          <h3 className="text-xl font-serif font-bold text-[#17201B]">
            Cold Storage Intelligence: Store vs. Sell Analysis
          </h3>
          <p className="text-xs text-[#66736A] mt-1">
            Determine whether storing your produce delivers positive net ROI after refrigeration costs.
          </p>
        </div>

        {/* Crop Selectors */}
        <div className="flex items-center gap-2">
          {['Tomatoes', 'Potatoes', 'Onions'].map((crop) => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                selectedCrop === crop
                  ? 'bg-[#123C2A] text-white border-[#123C2A]'
                  : 'bg-white text-[#17201B] border-[#D8DFD5] hover:bg-[#F5F3EA]'
              }`}
            >
              {crop}
            </button>
          ))}
        </div>
      </div>

      {/* Decision Calculation Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 py-6 border-b border-[#D8DFD5] bg-[#F5F3EA]/30 -mx-6 px-6">
        <div className="p-3 bg-white rounded-lg border border-[#D8DFD5]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Current Spot Price</span>
          <span className="text-xl font-bold text-[#17201B] font-mono mt-1 block">₹{curr.currentPrice}.00<span className="text-xs text-[#66736A]">/kg</span></span>
          <span className="text-[10px] text-[#66736A]">Mandi spot today</span>
        </div>

        <div className="p-3 bg-white rounded-lg border border-[#D8DFD5]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Forecast in {curr.days} Days</span>
          <span className="text-xl font-bold text-[#2F7D4A] font-mono mt-1 block">₹{curr.forecastPrice}.00<span className="text-xs text-[#66736A]">/kg</span></span>
          <span className="text-[10px] text-[#2F7D4A] font-medium">Expected wholesale</span>
        </div>

        <div className="p-3 bg-white rounded-lg border border-[#D8DFD5]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">{curr.days}-Day Storage Cost</span>
          <span className="text-xl font-bold text-[#D9A441] font-mono mt-1 block">-₹{totalStorageCost}<span className="text-xs text-[#66736A]">/kg</span></span>
          <span className="text-[10px] text-[#66736A]">₹{curr.storageCostPerDay}/day/kg</span>
        </div>

        <div className="p-3 bg-white rounded-lg border border-[#D8DFD5]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Net Economic Margin</span>
          <span className={`text-xl font-bold font-mono mt-1 block ${Number(netGain) >= 0 ? 'text-[#2F7D4A]' : 'text-rose-600'}`}>
            {Number(netGain) >= 0 ? `+₹${netGain}` : `-₹${Math.abs(netGain)}`}<span className="text-xs text-[#66736A]">/kg</span>
          </span>
          <span className="text-[10px] text-[#66736A]">After refrigeration fees</span>
        </div>

        <div className={`p-3 rounded-lg border flex flex-col justify-center col-span-2 md:col-span-1 ${
          isStore 
            ? 'bg-[#E8EFE4] border-[#7DBA52] text-[#123C2A]' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">AI Recommendation</span>
          <span className="text-lg font-bold uppercase tracking-tight mt-0.5 block flex items-center gap-1.5">
            {isStore ? <CheckCircle2 className="w-4 h-4 text-[#2F7D4A]" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
            {curr.recommendation}
          </span>
          <span className="text-[10px] opacity-90 mt-0.5">
            {isStore ? 'High net arbitrage' : 'Liquidate at farmgate'}
          </span>
        </div>
      </div>

      <div className="pt-4 flex items-center gap-2 text-xs text-[#66736A]">
        <Brain className="w-4 h-4 text-[#2F7D4A] shrink-0" />
        <span><strong>Advisory Insight:</strong> {curr.rationale}</span>
      </div>
    </div>
  );
};

// ── main component ────────────────────────────────────────────────────────────
const StorageAvailability = () => {
  const { t } = useTranslation();
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [locationSearch, setLocationSearch] = useState('');
  const [sortBy, setSortBy] = useState('available');
  const [bookingFacility, setBookingFacility] = useState(null);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const data = await getStorageFacilities();
      setFacilities(data || []);
    } catch (err) {
      console.warn('Storage data warning:', err.message);
      setFacilities([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = [...facilities];
    if (typeFilter !== 'all') list = list.filter(f => f.type === typeFilter);
    if (locationSearch.trim()) {
      list = list.filter(f =>
        f.location.toLowerCase().includes(locationSearch.toLowerCase()) ||
        f.name.toLowerCase().includes(locationSearch.toLowerCase())
      );
    }
    if (sortBy === 'price') list.sort((a, b) => a.price_per_day - b.price_per_day);
    else if (sortBy === 'capacity') list.sort((a, b) => b.available_capacity - a.available_capacity);
    else list.sort((a, b) => (b.available_capacity / b.capacity) - (a.available_capacity / a.capacity));
    return list;
  }, [facilities, typeFilter, locationSearch, sortBy]);

  const types = [
    { value: 'all', label: 'All Warehouses', icon: Warehouse },
    { value: 'cold', label: 'Refrigerated Cold Chain', icon: Snowflake },
    { value: 'freezer', label: 'Deep Cold Storage', icon: Wind },
    { value: 'dry', label: 'Ventilated Dry Warehouse', icon: Package },
  ];

  return (
    <div className="space-y-8">
      {/* Economic Store vs Sell Advisor Hero */}
      <EconomicStorageAdvisor />

      {/* Directory & Booking Controls */}
      <div className="bg-white rounded-xl border border-[#D8DFD5] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#D8DFD5]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2F7D4A]">Network Directory</span>
            <h3 className="text-xl font-serif font-bold text-[#17201B]">Regional Storage & Cold Chain Nodes</h3>
            <p className="text-xs text-[#66736A] mt-1">
              Find verified regional cold rooms to preserve freshness and schedule dock space.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute top-3 left-3 text-[#66736A]" />
              <input
                type="text"
                placeholder="Search hub or district..."
                value={locationSearch}
                onChange={e => setLocationSearch(e.target.value)}
                className="w-full bg-[#F5F3EA]/50 border border-[#D8DFD5] rounded-lg pl-9 pr-4 py-2 text-xs text-[#17201B] outline-none focus:border-[#2F7D4A]"
              />
            </div>
          </div>
        </div>

        {/* Type Category Filters */}
        <div className="pt-4 flex flex-wrap gap-2">
          {types.map(t_item => {
            const Icon = t_item.icon;
            return (
              <button
                key={t_item.value}
                onClick={() => setTypeFilter(t_item.value)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                  typeFilter === t_item.value
                    ? 'bg-[#123C2A] text-white border-[#123C2A]'
                    : 'bg-white text-[#17201B] border-[#D8DFD5] hover:bg-[#F5F3EA]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t_item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Facilities Grid */}
      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#2F7D4A]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-[#D8DFD5] p-6">
          <Warehouse className="w-12 h-12 text-[#66736A]/40 mx-auto mb-3" />
          <h4 className="text-base font-bold text-[#17201B]">No Storage Facilities Found</h4>
          <p className="text-xs text-[#66736A] mt-1">Try expanding your search query or selecting all warehouse types.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((facility, idx) => {
            const pct = Math.round((facility.available_capacity / facility.capacity) * 100);
            return (
              <div 
                key={facility.id || idx}
                className="bg-white rounded-xl border border-[#D8DFD5] shadow-sm hover:border-[#2F7D4A] transition-all p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#E8EFE4] text-[#123C2A] text-[10px] font-bold uppercase tracking-wider border border-[#D8DFD5]">
                      {facility.type === 'cold' ? '❄️ Cold Storage' : facility.type === 'freezer' ? '🧊 Cryo Freezer' : '📦 Dry Warehouse'}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#123C2A]">
                      ₹{facility.price_per_day}/day/MT
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-[#17201B]">{facility.name}</h4>
                  <p className="text-xs text-[#66736A] flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#2F7D4A]" />
                    <span>{facility.location}</span>
                  </p>

                  {/* Capacity Bar */}
                  <div className="my-4 p-3 bg-[#F5F3EA] rounded-lg border border-[#D8DFD5]">
                    <div className="flex justify-between text-xs mb-1.5 font-semibold">
                      <span className="text-[#66736A]">Available Capacity:</span>
                      <span className="text-[#123C2A] font-mono">{facility.available_capacity} / {facility.capacity} MT</span>
                    </div>
                    <div className="w-full bg-[#D8DFD5] h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${pct < 20 ? 'bg-rose-500' : 'bg-[#2F7D4A]'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#D8DFD5] flex items-center justify-between gap-3">
                  <a 
                    href={`tel:${facility.contact}`}
                    className="text-xs text-[#66736A] hover:text-[#123C2A] flex items-center gap-1 font-semibold"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#2F7D4A]" />
                    <span>{facility.contact}</span>
                  </a>

                  <button
                    onClick={() => setBookingFacility(facility)}
                    disabled={facility.available_capacity <= 0}
                    className="px-4 py-2 bg-[#123C2A] hover:bg-[#1E4D36] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    Book Space
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reservation Modal */}
      {bookingFacility && (
        <StorageReservationModal
          isOpen={!!bookingFacility}
          onClose={() => setBookingFacility(null)}
          facility={bookingFacility}
          onSuccess={() => {
            fetchFacilities();
            setBookingFacility(null);
          }}
        />
      )}
    </div>
  );
};

export default StorageAvailability;
