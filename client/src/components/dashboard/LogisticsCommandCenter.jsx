import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, Navigation, CheckCircle2, ShieldCheck, ArrowRight, 
  Gauge, Fuel, Leaf, DollarSign, MapPin, Eye, Thermometer 
} from 'lucide-react';
import { routeOptimizationService } from '../../services/routeOptimizationService';

export const LogisticsCommandCenter = () => {
  const [routeData, setRouteData] = useState(() => routeOptimizationService.optimizeCollectionRoute());
  const [activeRouteMode, setActiveRouteMode] = useState('optimized'); // 'optimized' vs 'unoptimized'
  const [selectedWaypoint, setSelectedWaypoint] = useState(routeData.waypoints[1]); // Farmer A default

  const { vehicle, waypoints, unoptimized, optimized, savings } = routeData;

  const nodeMap = {
    1: { x: 250, y: 310, label: 'Trichy Depot' },
    2: { x: 230, y: 270, label: 'Farmer A (700kg)' },
    3: { x: 200, y: 340, label: 'FPO C (800kg)' },
    4: { x: 160, y: 370, label: 'Farmer B (500kg)' },
    5: { x: 220, y: 190, label: 'Salem Buffer' },
    6: { x: 380, y: 80,  label: 'Chennai Terminal' }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Mode Toggle */}
      <div className="bg-white rounded-xl border border-[#D8DFD5] p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#D8DFD5]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2F7D4A]">
              Corridor Optimization Engine
            </span>
            <h2 className="text-2xl font-serif font-bold text-[#17201B]">
              Multi-Stop Collection & Cold-Chain Routing
            </h2>
            <p className="text-xs text-[#66736A] mt-1 max-w-2xl leading-relaxed">
              Consolidates fragmented farmgate pickups into a single coordinated refrigerated reefer corridor. Eliminates multiple empty return trips and guarantees farm-to-terminal arrival within 6 hours.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-[#F5F3EA] p-1.5 rounded-lg border border-[#D8DFD5] shrink-0">
            <button
              onClick={() => setActiveRouteMode('unoptimized')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                activeRouteMode === 'unoptimized'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'text-[#66736A] hover:text-[#17201B]'
              }`}
            >
              Separate Trips (3 Point-to-Point)
            </button>
            <button
              onClick={() => setActiveRouteMode('optimized')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                activeRouteMode === 'optimized'
                  ? 'bg-[#123C2A] text-white shadow-xs'
                  : 'text-[#66736A] hover:text-[#17201B]'
              }`}
            >
              AI Multi-Stop Route (1 Reefer)
            </button>
          </div>
        </div>

        {/* 4 Savings Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-3 bg-[#F5F3EA]/50 rounded-lg border border-[#D8DFD5]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Transit Distance Saved</span>
            <span className="text-2xl font-bold text-[#2F7D4A] font-mono mt-0.5 block">
              {savings.distanceSavedKm} <span className="text-xs font-normal text-[#66736A]">km</span>
            </span>
            <span className="text-[10px] text-[#2F7D4A] font-semibold mt-0.5 block">
              {savings.distanceSavedPercent}% reduction in total miles
            </span>
          </div>

          <div className="p-3 bg-[#F5F3EA]/50 rounded-lg border border-[#D8DFD5]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Freight Expense Saved</span>
            <span className="text-2xl font-bold text-[#123C2A] font-mono mt-0.5 block">
              ₹{savings.costDifference.toLocaleString()}
            </span>
            <span className="text-[10px] text-[#2F7D4A] font-semibold mt-0.5 block">
              {savings.costSavedPercent}% lower landed transport fee
            </span>
          </div>

          <div className="p-3 bg-[#F5F3EA]/50 rounded-lg border border-[#D8DFD5]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Payload Utilization</span>
            <span className="text-2xl font-bold text-[#123C2A] font-mono mt-0.5 block">
              {vehicle.capacityUtilizationPercent}%
            </span>
            <span className="text-[10px] text-[#66736A] mt-0.5 block">
              {vehicle.currentPayloadKg} / {vehicle.ratedPayloadKg} kg rated
            </span>
          </div>

          <div className="p-3 bg-[#F5F3EA]/50 rounded-lg border border-[#D8DFD5]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Carbon Abatement</span>
            <span className="text-2xl font-bold text-[#2F7D4A] font-mono mt-0.5 block">
              {savings.co2ReducedKg} <span className="text-xs font-normal text-[#66736A]">kg CO2</span>
            </span>
            <span className="text-[10px] text-[#66736A] mt-0.5 block">
              {savings.fuelSavedLiters} Liters diesel conserved
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map (7 Cols) + Waypoint Manifest (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Interactive Logistics Map SVG */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#D8DFD5] p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#D8DFD5]">
            <div className="flex items-center space-x-2">
              <span className={`w-2.5 h-2.5 rounded-full ${activeRouteMode === 'optimized' ? 'bg-[#2F7D4A]' : 'bg-rose-600'}`} />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#17201B]">
                {activeRouteMode === 'optimized' ? 'Tamil Nadu Single-Corridor Optimization' : 'Unoptimized Fragmented Trips'}
              </h4>
            </div>

            <span className="text-xs font-mono font-semibold text-[#66736A]">
              Reefer: {vehicle.id} ({vehicle.coolingSetPoint})
            </span>
          </div>

          {/* SVG Map Canvas */}
          <div className="relative w-full aspect-[4/3] bg-[#F5F3EA]/60 rounded-lg border border-[#D8DFD5] flex items-center justify-center p-4 overflow-hidden">
            <svg viewBox="0 0 450 420" className="w-full h-full">
              {/* Route Lines */}
              {activeRouteMode === 'optimized' ? (
                <g>
                  {/* Outer line */}
                  <polyline
                    points="250,310 230,270 200,340 160,370 220,190 380,80"
                    fill="none"
                    stroke="#D8DFD5"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Inner green line */}
                  <polyline
                    points="250,310 230,270 200,340 160,370 220,190 380,80"
                    fill="none"
                    stroke="#2F7D4A"
                    strokeWidth="3.5"
                    strokeDasharray="6 4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              ) : (
                <g>
                  <line x1="230" y1="270" x2="380" y2="80" stroke="#be123c" strokeWidth="2.5" strokeDasharray="5 3" />
                  <line x1="200" y1="340" x2="380" y2="80" stroke="#be123c" strokeWidth="2.5" strokeDasharray="5 3" />
                  <line x1="160" y1="370" x2="380" y2="80" stroke="#be123c" strokeWidth="2.5" strokeDasharray="5 3" />
                </g>
              )}

              {/* Waypoint Nodes */}
              {waypoints.map((wp) => {
                const node = nodeMap[wp.stopNumber];
                if (!node) return null;
                const isSelected = selectedWaypoint?.stopNumber === wp.stopNumber;

                return (
                  <g
                    key={wp.stopNumber}
                    className="cursor-pointer"
                    onClick={() => setSelectedWaypoint(wp)}
                  >
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isSelected ? "16" : "12"}
                      fill="#FFFFFF"
                      stroke={isSelected ? "#123C2A" : wp.type === 'destination' ? '#123C2A' : '#2F7D4A'}
                      strokeWidth={isSelected ? "3" : "2"}
                    />
                    <text
                      x={node.x}
                      y={node.y + 4}
                      textAnchor="middle"
                      fill="#17201B"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {wp.stopNumber}
                    </text>

                    {/* Node Label Box */}
                    <rect
                      x={node.x - 45}
                      y={node.y + 14}
                      width="90"
                      height="18"
                      rx="4"
                      fill={isSelected ? '#123C2A' : '#FFFFFF'}
                      stroke="#D8DFD5"
                    />
                    <text
                      x={node.x}
                      y={node.y + 26}
                      textAnchor="middle"
                      fill={isSelected ? '#FFFFFF' : '#17201B'}
                      fontSize="8"
                      fontWeight="bold"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* In-Map Telemetry Card */}
            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm border border-[#D8DFD5] rounded-lg p-3 text-xs space-y-1 shadow-xs">
              <div className="flex justify-between gap-4 text-[#66736A]">
                <span>Driver:</span>
                <span className="font-semibold text-[#17201B]">{vehicle.driverName}</span>
              </div>
              <div className="flex justify-between gap-4 text-[#66736A]">
                <span>Cargo Temp:</span>
                <span className="font-mono font-bold text-[#2F7D4A]">{vehicle.coolingSetPoint}</span>
              </div>
              <div className="flex justify-between gap-4 text-[#66736A]">
                <span>Current Load:</span>
                <span className="font-mono font-bold text-[#123C2A]">{vehicle.currentPayloadKg} kg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Waypoint Sequence Manifest */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#D8DFD5] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-[#D8DFD5] mb-4 flex items-center justify-between">
              <h4 className="text-base font-serif font-bold text-[#17201B]">
                Pickup & Transit Manifest
              </h4>
              <span className="text-xs font-mono font-semibold text-[#2F7D4A] bg-[#E8EFE4] px-2 py-0.5 rounded border border-[#D8DFD5]">
                {waypoints.length} Stops
              </span>
            </div>

            <div className="space-y-3">
              {waypoints.map((wp) => {
                const isSelected = selectedWaypoint?.stopNumber === wp.stopNumber;
                return (
                  <div
                    key={wp.stopNumber}
                    onClick={() => setSelectedWaypoint(wp)}
                    className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#E8EFE4] border-[#2F7D4A] ring-1 ring-[#2F7D4A]'
                        : 'bg-white border-[#D8DFD5] hover:bg-[#F5F3EA]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-[#123C2A]">{wp.time || wp.scheduledTime}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white text-[#66736A] border border-[#D8DFD5]">
                        Stop 0{wp.stopNumber} • {wp.type}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-[#17201B]">{wp.name}</p>
                    <p className="text-[11px] text-[#66736A] mt-0.5">{wp.location}</p>
                    <p className="text-[11px] text-[#2F7D4A] font-semibold mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {wp.action}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assigned Reefer Unit Card */}
          <div className="mt-6 p-4 rounded-lg bg-[#F5F3EA] border border-[#D8DFD5] text-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Assigned Fleet Carrier</span>
            <p className="font-bold text-[#17201B]">{vehicle.type} • Reefer Reg #{vehicle.id}</p>
            <p className="text-[11px] text-[#66736A]">Carrier Driver: {vehicle.driverContact} • GPS Live Monitored</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LogisticsCommandCenter;
