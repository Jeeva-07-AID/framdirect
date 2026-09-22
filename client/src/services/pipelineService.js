/**
 * pipelineService.js
 * Core engine powering the complete 10-stage Demo Scenario:
 * PREDICT → PLAN → MATCH → MOVE → STORE → DELIVER → LEARN
 * 
 * Scenario Specification:
 * - Crop: Tomato, Region: Trichy
 * - Predicted Demand: 2,840 kg | Available Supply: 1,950 kg | Supply Gap: 890 kg
 * - Buyer Requirement: 2,000 kg Grade A Tomato (Chennai Destination)
 * - Multi-Farmer Fulfillment:
 *     Supplier 1 (Farmer A): 700 kg
 *     Supplier 2 (Farmer B): 500 kg
 *     Supplier 3 (FPO C):    800 kg
 *     Total: 2,000 kg (100% Fulfilled)
 * - AI Logistics Optimizer:
 *     Multi-stop Reefer: Trichy → Farmer A → Farmer B → FPO C → Storage → Chennai Hub
 *     Saved 338 km (342 km vs 680 km across 3 separate trips) | Saved ₹7,800 freight
 * - Smart Storage Advisor:
 *     Salem Agro Cold Chain Node (10°C - 13°C) extending shelf-life +14 days
 * - Real-Time Telemetry & Transparent Price Audit
 */

import { demandForecastService } from './demandForecastService';
import { harvestPlanningService } from './harvestPlanningService';
import { buyerMatchingService } from './buyerMatchingService';
import { routeOptimizationService } from './routeOptimizationService';
import { storageRecommendationService } from './storageRecommendationService';
import { impactAnalyticsService } from './impactAnalyticsService';

export const INITIAL_PIPELINE_STATE = {
  // 1. Demand Forecast (Phase 4)
  forecast: {
    crop: 'Tomato',
    region: 'Trichy',
    predictedDemandKg: 2840,
    availableSupplyKg: 1950,
    gapKg: 890,
    demandLevel: 'HIGH',
    growthPercent7d: 18.2,
    demandConfidence: '94.6% AI Confidence',
    deficitRegions: ['Trichy Urban Hub', 'Chennai Metro', 'Madurai Central'],
    historicalWeeklyTrend: [
      { week: 'Day 1', demand: 2400, supply: 1950 },
      { week: 'Day 2', demand: 2510, supply: 1950 },
      { week: 'Day 3', demand: 2620, supply: 1950 },
      { week: 'Day 4', demand: 2690, supply: 1950 },
      { week: 'Day 5', demand: 2750, supply: 1950 },
      { week: 'Day 6', demand: 2800, supply: 1950 },
      { week: 'Day 7', demand: 2840, supply: 1950 },
    ],
    recommendedAction: 'Tomato demand in Trichy is predicted to increase by 18% over the next 7 days. Pre-book buyers before harvest.',
    benchmarkPricePerKg: 40,
    estimatedPriceRange: [41, 45],
    isEstimate: true
  },

  // 2. Harvest Planning (Phase 3 & 5)
  harvestPlan: {
    crop: 'Tomato',
    farmerName: 'Ravi Teja Farms (Farmer A)',
    location: 'Trichy Rural Cluster',
    plannedAcreage: 3.5,
    expectedYieldKg: 500,
    upcomingHarvestKg: 500,
    predictedRegionalDemandKg: 780,
    existingRegisteredSupplyKg: 420,
    supplyGapKg: 360,
    opportunityLevel: 'High',
    cultivationDate: '2026-08-10',
    harvestDate: '2026-09-24',
    storageRequirement: 'Cold Chain (10-13°C)',
    aiRecommendation: 'High regional shortage detected (360 kg gap). Good opportunity to list this harvest for pre-order.',
    status: 'Scheduled & Verified'
  },

  // 3. Buyer Requirement (Phase 6 & 10)
  buyerRequirement: {
    buyerName: 'FreshBasket Supermarkets Ltd.',
    procurementManager: 'Anita Desai',
    deliveryHub: 'Chennai Central Fulfillment Terminal',
    crop: 'Tomato',
    requiredQuantityKg: 2000,
    maxBudgetPerKg: 40,
    requiredByDate: '2026-09-25',
    destination: 'Chennai',
    qualityGrade: 'Grade A',
    notes: 'Requires cold-chain transport with multi-farm consolidation'
  },

  // 4. Smart Matching (Phase 6)
  smartMatching: {
    overallCompatibilityScore: 94.8,
    matchingCriteria: [
      { name: 'Crop & Grade Compatibility (Grade A)', score: 100, weight: '30%' },
      { name: 'Combined Quantity Match (2,000 kg)', score: 100, weight: '25%' },
      { name: 'Price Budget Feasibility (<= ₹40/kg)', score: 96, weight: '20%' },
      { name: 'Proximity & Route Coherence', score: 92, weight: '15%' },
      { name: 'Farmer & FPO Reliability Index', score: 98, weight: '10%' }
    ],
    candidatePool: [
      {
        id: 'supp-1',
        name: 'Ravi Teja Farms (Farmer A)',
        role: 'Farmer',
        location: 'Trichy Rural',
        capacity: 700,
        pricePerKg: 38,
        rating: 4.9,
        organic: true,
        matchScore: 92,
        selected: true,
        reasons: [
          'Quantity available (700 kg)',
          'Harvest date compatible (Sep 24)',
          'Within delivery radius (45 km)',
          'Price compatible (₹38 <= ₹40)',
          'Quality Grade A verified'
        ]
      },
      {
        id: 'supp-2',
        name: 'Kaveri Valley Greenery (Farmer B)',
        role: 'Farmer',
        location: 'Dindigul Cluster',
        capacity: 500,
        pricePerKg: 39,
        rating: 4.8,
        organic: true,
        matchScore: 84,
        selected: true,
        reasons: [
          'Quantity available (500 kg)',
          'Harvest date compatible (Sep 25)',
          'Within delivery radius (85 km)',
          'Price compatible (₹39 <= ₹40)',
          'Quality Grade A verified'
        ]
      },
      {
        id: 'supp-3',
        name: 'Trichy Agro Producer Collective (FPO C)',
        role: 'FPO / Farmer Group',
        location: 'Manapparai Hub, Trichy',
        capacity: 800,
        pricePerKg: 37,
        rating: 4.9,
        organic: false,
        matchScore: 79,
        selected: true,
        reasons: [
          'Quantity available (800 kg pooled from 12 member farmers)',
          'Harvest date compatible (Sep 23 pre-cooled)',
          'Within delivery radius (60 km depot)',
          'Price compatible (₹37 <= ₹40)',
          'Optical sorter Grade A certified'
        ]
      },
      {
        id: 'supp-4',
        name: 'Salem Mountain Orchards',
        role: 'Farmer',
        location: 'Salem Hub',
        capacity: 350,
        pricePerKg: 44,
        rating: 4.4,
        organic: false,
        matchScore: 61,
        selected: false,
        reasons: [
          'Quantity available (350 kg)',
          'Harvest date delayed past deadline',
          'Higher price (₹44 > ₹40 budget)'
        ]
      }
    ]
  },

  // 5. Multi-Farmer Fulfillment (Phase 7)
  fulfillment: {
    totalTargetKg: 2000,
    fulfilledKg: 2000,
    fulfillmentPercentage: 100,
    proposalHeadline: 'Fulfilled through 3 suppliers (100% Demand Satisfied)',
    contributions: [
      { farmerId: 'supp-1', farmerName: 'Farmer A (Ravi Teja)', location: 'Trichy', allocatedKg: 700, unitPrice: 38, totalPayout: 26600, share: 35.0 },
      { farmerId: 'supp-2', farmerName: 'Farmer B (Kaveri Valley)', location: 'Dindigul', allocatedKg: 500, unitPrice: 39, totalPayout: 19500, share: 25.0 },
      { farmerId: 'supp-3', farmerName: 'FPO C (Trichy Collective)', location: 'Manapparai', allocatedKg: 800, unitPrice: 37, totalPayout: 29600, share: 40.0 }
    ],
    totalFarmerFarmgatePayout: 75700,
    averageFarmgatePricePerKg: 37.85
  },

  // 6. Route Optimization (Phase 11 & 12)
  routeOptimization: {
    carrierName: 'AgriTransit ColdFleet #TN-45-7821',
    driver: 'Murugan Swamy',
    driverPhone: '+91 98402 18942',
    waypoints: [
      { order: 1, name: 'Depot Start', location: 'Trichy Transport Hub', lat: 10.7905, lng: 78.7047, time: '05:00 AM', action: 'Vehicle Sanitization & Reefer Pre-cooling (11°C)' },
      { order: 2, name: 'Farmer A Pickup', location: 'Ravi Teja Farms (Trichy Rural)', lat: 10.8250, lng: 78.6850, time: '06:15 AM', action: 'Loaded 700 kg Grade A Tomatoes' },
      { order: 3, name: 'FPO C Pickup', location: 'Manapparai Collective Hub', lat: 10.6074, lng: 78.4180, time: '08:00 AM', action: 'Loaded 800 kg Grade A Tomatoes' },
      { order: 4, name: 'Farmer B Pickup', location: 'Kaveri Valley (Dindigul)', lat: 10.3673, lng: 77.9803, time: '10:15 AM', action: 'Loaded 500 kg Grade A Tomatoes (Batch Full: 2,000 kg)' },
      { order: 5, name: 'Storage Node', location: 'Salem Agro Cold Chain Node', lat: 11.6643, lng: 78.1460, time: '02:00 PM', action: 'Pre-cooling audit & expressway buffer clearance' },
      { order: 6, name: 'Buyer Delivery Hub', location: 'Chennai Central Fulfillment Terminal', lat: 13.0827, lng: 80.2707, time: '07:30 PM', action: 'Final dock unloading, optical inspection & digital sign-off' }
    ],
    unoptimizedDistanceKm: 680,
    optimizedDistanceKm: 342,
    distanceSavedKm: 338,
    costSavedAmount: 7800,
    fuelSavedLitres: 64,
    co2ReducedKg: 169.6,
    efficiencyGainPercent: 49.7,
    vehicleUtilizationPercent: 80
  },

  // 7. Storage Allocation (Phase 13)
  storage: {
    facilityName: 'Salem Agro Cold Chain Facility',
    facilityType: 'Multi-Chamber Refrigerated Cold Storage (10°C - 13°C)',
    temperatureSetPoint: '11.5°C',
    humidityLevel: '92% RH',
    allocatedBays: 'Bay #C-14 & #C-15',
    storageCapacityTons: 2.0,
    shelfLifeExtendedDays: '+14 Days',
    spoilageLossRisk: 'Reduced from 22% to 1.4%',
    dailyStorageCost: 600,
    totalStorageCost: 1800,
    reservationStatus: 'Reserved & Temperature Stabilized',
    recommendationReason: 'Optimal temperature match (10-13°C for Tomatoes) located on northern transit corridor towards Chennai.'
  },

  // 8. Live Tracking & Telemetry (Phase 14)
  tracking: {
    status: 'In Transit',
    currentLegIndex: 3,
    currentLocation: 'NH-44 Expressway near Namakkal',
    currentSpeedKmH: 58,
    cargoTemp: '11.4°C (Optimal)',
    batteryLevel: '98%',
    etaToNextStop: '38 mins to Salem Cold Storage Node',
    etaToBuyer: '5h 15m remaining',
    telemetryHistory: [
      { time: '06:15 AM', event: 'Trichy Pickup Complete (Farmer A: 700 kg)', status: 'done' },
      { time: '08:00 AM', event: 'Manapparai Hub Pickup Complete (FPO C: 800 kg)', status: 'done' },
      { time: '10:15 AM', event: 'Dindigul Pickup Complete (Farmer B: 500 kg - Total 2,000 kg)', status: 'done' },
      { time: '01:10 PM', event: 'En route to Salem Storage Node via NH-44', status: 'active' },
      { time: '02:00 PM', event: 'Salem Buffer Stop & Inspection', status: 'pending' },
      { time: '07:30 PM', event: 'Scheduled Chennai Hub Arrival', status: 'pending' }
    ]
  },

  // 9. Delivery & Digital Handshake (Phase 14 & 18)
  delivery: {
    deliveryStatus: 'Delivered & Accepted',
    signedBy: 'Anita Desai (Procurement Manager, FreshBasket)',
    deliveryTimestamp: '2026-09-25T19:25:00Z',
    deliveredQuantityKg: 2000,
    qcScore: '98.6% Grade A Quality Score',
    spoilageDetectedKg: 0,
    otpCode: '849201',
    otpVerified: true,
    digitalSignatureHash: '0x9fa4b2e811c09772d54e66d3'
  },

  // 10. Transparent Pricing & Impact Breakdown (Phase 15 & 16)
  transparentPricing: {
    lineItems: [
      { label: 'Farmer A Farmgate Payout (Ravi Teja - 700 kg @ ₹38/kg)', amount: 26600, category: 'farmer', pct: 30.6 },
      { label: 'Farmer B Farmgate Payout (Kaveri Valley - 500 kg @ ₹39/kg)', amount: 19500, category: 'farmer', pct: 22.4 },
      { label: 'FPO C Farmgate Payout (Trichy Collective - 800 kg @ ₹37/kg)', amount: 29600, category: 'farmer', pct: 34.1 },
      { label: 'AI Multi-Stop Reefer Logistics (342 km optimized)', amount: 6400, category: 'logistics', pct: 7.4 },
      { label: 'Cold Storage Buffer Pre-cooling (3 Days)', amount: 1800, category: 'storage', pct: 2.1 },
      { label: 'Digital QC & Chemical Residue Inspection', amount: 800, category: 'qc', pct: 0.9 },
      { label: 'FarmDirect Escrow & Telemetry Facilitation (2.5%)', amount: 2150, category: 'platform', pct: 2.5 }
    ],
    totalLandedBuyerCost: 86850,
    landedPricePerKg: 43.43,
    traditionalMandiCostPerKg: 52.00,
    traditionalMandiTotalCost: 104000,
    buyerSavingsAmount: 17150,
    buyerSavingsPercent: 16.5,
    farmerEarningsIncreasePercent: 45.6,
    illustrativeNotice: 'Illustrative comparison based on regional wholesale APMC survey data, not measured individual guarantee.',
    middlemenCutEliminated: '100% (No commission brokers, zero APMC market fee deductions)'
  }
};

/**
 * Storage Reservation Helper (Persisted locally)
 */
const STORAGE_STORAGE_KEY = 'farmdirect_storage_reservations';

export const getSavedStorageReservations = () => {
  try {
    const raw = localStorage.getItem(STORAGE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveStorageReservation = (reservation) => {
  const current = getSavedStorageReservations();
  const newItem = {
    id: 'res-' + Date.now(),
    createdAt: new Date().toISOString(),
    status: 'Confirmed',
    ...reservation
  };
  const updated = [newItem, ...current];
  localStorage.setItem(STORAGE_STORAGE_KEY, JSON.stringify(updated));
  return newItem;
};

export default {
  INITIAL_PIPELINE_STATE,
  getSavedStorageReservations,
  saveStorageReservation
};
