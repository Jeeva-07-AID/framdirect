import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, PackageCheck, MapPin, Clock, ArrowRight, User, Package, 
  Navigation, Bell, Sparkles, Thermometer, ShieldCheck, CheckCircle2 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supplyChainService } from '../../services/supplyChainService';
import { notifySuccess } from '../../services/notificationService';

const STATUS_STEPS = ['Ordered', 'Picked', 'In Transit', 'Delivered'];

const MOCK_ORDERS = [
  {
    id: 'ORD-7742',
    product_name: 'Organic Field Tomatoes',
    quantity: 150,
    buyer_name: 'Chennai Fresh Retailers',
    from_location: 'Ravi Teja Farm, Trichy',
    to_location: 'Chennai Central Terminal',
    status: 'In Transit',
    transport_name: 'TN Reefer Fleet #48',
    boarding_time: '10:30 PM',
    delivery_time: '04:00 AM',
    progress: 65,
    cargoTemp: '11.4°C'
  },
  {
    id: 'ORD-8119',
    product_name: 'Grade-A Table Potatoes',
    quantity: 500,
    buyer_name: 'Heritage Foods Co.',
    from_location: 'Madurai Cluster Hub',
    to_location: 'Koyambedu Wholesale Depot',
    status: 'Picked',
    transport_name: 'Southern Cold Transport',
    boarding_time: '11:15 PM',
    delivery_time: '06:30 AM',
    progress: 35,
    cargoTemp: '8.2°C'
  }
];

const FarmerTransportTracking = () => {
  const { t } = useTranslation();
  const [activeShipment, setActiveShipment] = useState(() => supplyChainService.getActiveShipment());
  const [orders, setOrders] = useState(MOCK_ORDERS);

  useEffect(() => {
    const unsubscribe = supplyChainService.subscribe((state) => {
      setActiveShipment(state.shipments[0] || null);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#D8DFD5] gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#2F7D4A]">Cold Chain Fleet</span>
          <h2 className="text-2xl font-serif font-bold text-[#17201B]">Logistics, Transit & Delivery Verification</h2>
          <p className="text-xs text-[#66736A] mt-1">
            Real-time tracking of refrigerated produce transport with IoT temperature verification and arrival sign-off.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-[#E8EFE4] text-[#123C2A] text-xs font-bold rounded-lg border border-[#D8DFD5] flex items-center gap-1.5">
            <Thermometer className="w-4 h-4 text-[#2F7D4A]" />
            Active Reefer Telemetry
          </span>
        </div>
      </div>

      {/* Primary Active Shipment Hero (from SupplyChainService) */}
      {activeShipment && (
        <div className="bg-white rounded-xl border border-[#D8DFD5] shadow-sm overflow-hidden">
          <div className="bg-[#123C2A] text-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#7DBA52]/20 text-[#7DBA52] text-[10px] font-bold uppercase tracking-wider border border-[#7DBA52]/30">
                  Consolidated Dispatch • {activeShipment.id}
                </span>
                <span className="text-xs text-[#E8EFE4]/80">Vehicle: {activeShipment.vehicleNumber || 'TN-48-AZ-1024'}</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-white">
                {activeShipment.crop || 'Tomatoes'} — {activeShipment.totalCargoWeightKg?.toLocaleString() || '2,000'} kg Cargo
              </h3>
              <p className="text-xs text-[#E8EFE4]/80 mt-1 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#7DBA52]" />
                En route to: <span className="font-semibold text-white">{activeShipment.destination || 'Chennai Terminal Dock 4'}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 rounded-md bg-[#D9A441]/20 text-[#D9A441] border border-[#D9A441]/40 text-xs font-bold uppercase tracking-wider">
                ● {activeShipment.status || 'IN_TRANSIT'}
              </span>
            </div>
          </div>

          {/* Telemetry bar */}
          <div className="p-6 bg-[#F5F3EA]/40 border-b border-[#D8DFD5] grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-white rounded-lg border border-[#D8DFD5]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Cargo Chamber Temp</span>
              <span className="text-lg font-bold text-[#2F7D4A] font-mono mt-0.5 flex items-center gap-1">
                <Thermometer className="w-4 h-4 text-[#2F7D4A]" />
                {activeShipment.cargoTemp || '11.4°C'}
              </span>
              <span className="text-[10px] text-[#2F7D4A] font-medium">Optimal Safe Window</span>
            </div>
            <div className="p-3 bg-white rounded-lg border border-[#D8DFD5]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Current Location</span>
              <span className="text-xs font-bold text-[#17201B] truncate mt-1 block">
                {activeShipment.currentLocation || 'NH-44 Namakkal Corridor'}
              </span>
              <span className="text-[10px] text-[#66736A] font-mono">{activeShipment.etaToBuyer || '5h remaining to terminal'}</span>
            </div>
            <div className="p-3 bg-white rounded-lg border border-[#D8DFD5]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Driver & Logistics</span>
              <span className="text-xs font-bold text-[#17201B] truncate mt-1 block">
                {activeShipment.driverName || 'Murugan (TN Logistics)'}
              </span>
              <span className="text-[10px] text-[#66736A] font-mono">{activeShipment.driverContact || '+91 98401 23456'}</span>
            </div>
            <div className="p-3 bg-white rounded-lg border border-[#D8DFD5]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Digital Tamper Seal</span>
              <span className="text-xs font-mono font-bold text-[#123C2A] truncate mt-1 block">
                {activeShipment.tamperSealId || 'SEAL-TN48-9921'}
              </span>
              <span className="text-[10px] text-[#2F7D4A] font-medium">✓ Intact & Active</span>
            </div>
          </div>

          {/* Progress Corridor Timeline */}
          <div className="p-6">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#66736A] mb-4">
              Corridor Progression
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Farmgate Pickup', time: '02:00 PM', done: true },
                { label: 'Cluster Aggregation', time: '03:30 PM', done: true },
                { label: 'Highway Reefer Transit', time: 'In Progress', active: true },
                { label: 'Terminal Dock Delivery', time: 'Est. 09:00 PM', pending: true },
              ].map((step, idx) => (
                <div 
                  key={idx}
                  className={`p-3 rounded-lg border ${
                    step.done 
                      ? 'bg-white border-[#7DBA52] text-[#123C2A]' 
                      : step.active 
                        ? 'bg-[#E8EFE4] border-[#2F7D4A] ring-1 ring-[#2F7D4A]' 
                        : 'bg-white/60 border-[#D8DFD5] text-[#66736A]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A]">
                      Phase 0{idx + 1}
                    </span>
                    {step.done ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2F7D4A]" />
                    ) : step.active ? (
                      <span className="w-2 h-2 rounded-full bg-[#D9A441] animate-ping" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-[#D8DFD5]" />
                    )}
                  </div>
                  <p className="text-xs font-bold">{step.label}</p>
                  <p className="text-[10px] text-[#66736A] mt-0.5">{step.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Routine Outgoing Farmgate Shipments */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#123C2A]">
          Outgoing Producer Dispatches
        </h3>
        {orders.map((order, idx) => (
          <div 
            key={order.id}
            className="bg-white rounded-xl border border-[#D8DFD5] p-5 shadow-sm hover:border-[#2F7D4A] transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#D8DFD5]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-[#F5F3EA] text-[#66736A] text-[10px] font-mono font-bold">
                    {order.id}
                  </span>
                  <span className="text-xs font-bold text-[#17201B]">{order.product_name}</span>
                </div>
                <h4 className="text-base font-bold text-[#123C2A]">
                  {order.quantity} kg allocated for {order.buyer_name}
                </h4>
                <p className="text-xs text-[#66736A] flex items-center gap-2 mt-1">
                  <span>{order.from_location}</span>
                  <ArrowRight className="w-3 h-3 text-[#2F7D4A]" />
                  <span>{order.to_location}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md bg-[#E8EFE4] text-[#123C2A] text-xs font-semibold border border-[#D8DFD5]">
                  🚚 {order.transport_name}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#D9A441]/15 text-[#D9A441] text-xs font-bold uppercase">
                  {order.status}
                </span>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between text-xs text-[#66736A]">
              <span>Departure: <strong className="text-[#17201B]">{order.boarding_time}</strong></span>
              <span>Target Delivery: <strong className="text-[#2F7D4A]">{order.delivery_time}</strong></span>
              <span>Chamber Temp: <strong className="text-[#123C2A] font-mono">{order.cargoTemp}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FarmerTransportTracking;
