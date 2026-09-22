/**
 * supplyChainService.js
 * Single Source of Truth & Reactive Supply Chain State Engine for FarmDirect.
 * Connects the entire end-to-end operational lifecycle:
 * DEMAND FORECAST → HARVEST PLANNING → FUTURE HARVEST → BUYER REQUIREMENT →
 * SMART MATCHING → MULTI-FARMER FULFILLMENT → ROUTE OPTIMIZATION →
 * SMART STORAGE → LIVE TELEMETRY → DELIVERY SIGN-OFF → TRANSPARENT PRICING & FARMER EARNINGS.
 */

import { demandForecastService } from './demandForecastService';
import { buyerMatchingService } from './buyerMatchingService';
import { routeOptimizationService } from './routeOptimizationService';
import { storageRecommendationService } from './storageRecommendationService';
import { impactAnalyticsService } from './impactAnalyticsService';

const STORAGE_KEY = 'farmdirect_supply_chain_state_v1';

// Seed Baseline Scenario Data matching SIH specification
const SEED_HARVESTS = [
  {
    id: 'harv-farmer-a',
    farmerId: 'farmer-ravi-teja',
    farmerName: 'Ravi Teja Farms (Farmer A)',
    role: 'Farmer',
    crop: 'Tomato',
    variety: 'Hybrid Grade A',
    expectedQuantityKg: 700,
    availableQuantityKg: 700,
    allocatedQuantityKg: 0,
    unitPrice: 38,
    harvestDate: '2026-09-24',
    cultivationDate: '2026-08-10',
    location: 'Trichy Rural Cluster',
    lat: 10.8250,
    lng: 78.6850,
    qualityGrade: 'Grade A',
    status: 'OPEN', // OPEN, PARTIALLY_RESERVED, FULLY_RESERVED, HARVESTED
    fpoAffiliated: false,
    rating: 4.9
  },
  {
    id: 'harv-farmer-b',
    farmerId: 'farmer-kaveri-valley',
    farmerName: 'Kaveri Valley Greenery (Farmer B)',
    role: 'Farmer',
    crop: 'Tomato',
    variety: 'Hybrid Grade A',
    expectedQuantityKg: 500,
    availableQuantityKg: 500,
    allocatedQuantityKg: 0,
    unitPrice: 39,
    harvestDate: '2026-09-25',
    cultivationDate: '2026-08-12',
    location: 'Dindigul Cluster',
    lat: 10.3673,
    lng: 77.9803,
    qualityGrade: 'Grade A',
    status: 'OPEN',
    fpoAffiliated: true,
    rating: 4.8
  },
  {
    id: 'harv-fpo-c',
    farmerId: 'fpo-trichy-collective',
    farmerName: 'Trichy Agro Producer Collective (FPO C)',
    role: 'FPO / Farmer Group',
    crop: 'Tomato',
    variety: 'Hybrid Grade A',
    expectedQuantityKg: 800,
    availableQuantityKg: 800,
    allocatedQuantityKg: 0,
    unitPrice: 37,
    harvestDate: '2026-09-23',
    cultivationDate: '2026-08-08',
    location: 'Manapparai Hub, Trichy',
    lat: 10.6074,
    lng: 78.4180,
    qualityGrade: 'Grade A',
    status: 'OPEN',
    fpoAffiliated: true,
    memberFarmersCount: 14,
    rating: 4.9
  }
];

const SEED_REQUIREMENTS = [
  {
    id: 'req-freshbasket-01',
    buyerId: 'buyer-freshbasket',
    buyerName: 'FreshBasket Supermarkets Ltd.',
    procurementManager: 'Anita Desai',
    crop: 'Tomato',
    targetQuantityKg: 2000,
    maxBudgetPerKg: 40,
    requiredDate: '2026-09-25',
    destination: 'Chennai Central Fulfillment Terminal',
    qualityGrade: 'Grade A',
    notes: 'Requires cold-chain transit with multi-farm consolidation',
    status: 'MATCHING', // OPEN, MATCHING, FULFILLED, IN_TRANSIT, DELIVERED
    createdAt: '2026-09-22T09:00:00Z'
  }
];

class SupplyChainStore {
  constructor() {
    this.listeners = new Set();
    this.state = this.loadState();
  }

  loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to parse supply chain state from localStorage:', e);
    }

    return {
      harvests: [...SEED_HARVESTS],
      requirements: [...SEED_REQUIREMENTS],
      bulkOrders: [],
      shipments: [],
      earnings: {
        'farmer-ravi-teja': { totalEarned: 0, pendingPayout: 0, completedOrdersCount: 0, allocatedLots: [] },
        'farmer-kaveri-valley': { totalEarned: 0, pendingPayout: 0, completedOrdersCount: 0, allocatedLots: [] },
        'fpo-trichy-collective': { totalEarned: 0, pendingPayout: 0, completedOrdersCount: 0, allocatedLots: [] },
      },
      auditLedgers: []
    };
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Error saving supply chain state:', e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (err) {
        console.error('Listener callback error:', err);
      }
    }
  }

  getState() {
    return this.state;
  }

  // ── 1. HARVEST & SUPPLY MANAGEMENT ──────────────────────────────────────────
  getHarvests(filterCrop = null) {
    if (!filterCrop) return this.state.harvests;
    return this.state.harvests.filter(h => h.crop.toLowerCase() === filterCrop.toLowerCase());
  }

  publishHarvest(newHarvestData) {
    const newHarvest = {
      id: 'harv-' + Date.now(),
      farmerId: newHarvestData.farmerId || 'farmer-ravi-teja',
      farmerName: newHarvestData.farmerName || 'Ravi Teja Farms (Farmer A)',
      role: newHarvestData.role || 'Farmer',
      crop: newHarvestData.crop || 'Tomato',
      variety: newHarvestData.variety || 'Hybrid Grade A',
      expectedQuantityKg: Number(newHarvestData.expectedQuantityKg || newHarvestData.expected_quantity) || 500,
      availableQuantityKg: Number(newHarvestData.expectedQuantityKg || newHarvestData.expected_quantity) || 500,
      allocatedQuantityKg: 0,
      unitPrice: Number(newHarvestData.unitPrice || newHarvestData.expected_price) || 38,
      harvestDate: newHarvestData.harvestDate || newHarvestData.harvest_date || '2026-09-24',
      cultivationDate: newHarvestData.cultivationDate || newHarvestData.cultivation_date || '2026-08-10',
      location: newHarvestData.location || 'Trichy Rural Cluster',
      lat: 10.8250,
      lng: 78.6850,
      qualityGrade: newHarvestData.qualityGrade || 'Grade A',
      status: 'OPEN',
      rating: 4.9
    };

    this.state.harvests = [newHarvest, ...this.state.harvests];
    this.saveState();
    return newHarvest;
  }

  // ── 2. BUYER REQUIREMENT MANAGEMENT ─────────────────────────────────────────
  getRequirements() {
    return this.state.requirements;
  }

  postRequirement(reqData) {
    const newReq = {
      id: 'req-' + Date.now(),
      buyerId: reqData.buyerId || 'buyer-freshbasket',
      buyerName: reqData.buyerName || 'Institutional Buyer',
      procurementManager: reqData.procurementManager || 'Procurement Team',
      crop: reqData.crop || 'Tomato',
      targetQuantityKg: Number(reqData.quantityKg || reqData.targetQuantityKg) || 2000,
      maxBudgetPerKg: Number(reqData.maxPrice || reqData.maxBudgetPerKg) || 40,
      requiredDate: reqData.requiredDate || '2026-09-25',
      destination: reqData.destination || 'Chennai Central Terminal',
      qualityGrade: reqData.qualityGrade || 'Grade A',
      notes: reqData.notes || 'Consolidated fresh lot required',
      status: 'MATCHING',
      createdAt: new Date().toISOString()
    };

    this.state.requirements = [newReq, ...this.state.requirements];
    this.saveState();
    return newReq;
  }

  // ── 3. SMART MATCHING & MULTI-FARMER SUPPLY AGGREGATION ─────────────────────
  getMatchesForRequirement(requirementId) {
    const req = this.state.requirements.find(r => r.id === requirementId) || this.state.requirements[0];
    if (!req) return null;

    // Filter available harvests of the requested crop
    const candidateHarvests = this.state.harvests.filter(h => 
      h.crop.toLowerCase() === req.crop.toLowerCase() && h.availableQuantityKg > 0
    );

    // Compute explainable match score & reasons
    const scoredCandidates = candidateHarvests.map(h => {
      const priceCompatible = h.unitPrice <= req.maxBudgetPerKg;
      const gradeCompatible = h.qualityGrade === req.qualityGrade;
      const harvestDateCompatible = new Date(h.harvestDate) <= new Date(req.requiredDate);

      let score = 90;
      if (!priceCompatible) score -= 20;
      if (!gradeCompatible) score -= 15;
      if (!harvestDateCompatible) score -= 20;

      return {
        id: h.id,
        farmerId: h.farmerId,
        name: h.farmerName,
        role: h.role,
        crop: h.crop,
        availableQuantityKg: h.availableQuantityKg,
        unitPrice: h.unitPrice,
        location: h.location,
        lat: h.lat,
        lng: h.lng,
        qualityGrade: h.qualityGrade,
        matchScore: Math.max(50, score),
        reasons: [
          { text: `Quantity available (${h.availableQuantityKg} kg available)`, status: h.availableQuantityKg > 0 },
          { text: `Harvest date compatible (${h.harvestDate})`, status: harvestDateCompatible },
          { text: 'Within delivery transit radius (< 100 km to corridor)', status: true },
          { text: `Price compatible (₹${h.unitPrice}/kg <= ₹${req.maxBudgetPerKg}/kg budget)`, status: priceCompatible },
          { text: `Quality compatible (${h.qualityGrade})`, status: gradeCompatible }
        ]
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    // Greedily aggregate suppliers to satisfy required quantity
    let remainingNeededKg = req.targetQuantityKg;
    const allocatedSuppliers = [];

    for (const cand of scoredCandidates) {
      if (remainingNeededKg <= 0) break;
      const allocation = Math.min(cand.availableQuantityKg, remainingNeededKg);
      if (allocation > 0) {
        allocatedSuppliers.push({
          ...cand,
          allocatedKg: allocation,
          subtotal: allocation * cand.unitPrice,
          sharePercentage: ((allocation / req.targetQuantityKg) * 100).toFixed(1)
        });
        remainingNeededKg -= allocation;
      }
    }

    const totalFulfilledKg = allocatedSuppliers.reduce((sum, s) => sum + s.allocatedKg, 0);
    const totalFarmerPayout = allocatedSuppliers.reduce((sum, s) => sum + s.subtotal, 0);
    const weightedAvgPrice = totalFulfilledKg > 0 ? (totalFarmerPayout / totalFulfilledKg).toFixed(2) : req.maxBudgetPerKg;

    return {
      requirement: req,
      candidates: scoredCandidates,
      fulfillmentPlan: {
        targetQuantityKg: req.targetQuantityKg,
        totalFulfilledKg,
        fulfillmentPercentage: Math.min(100, Math.round((totalFulfilledKg / req.targetQuantityKg) * 100)),
        isComplete: totalFulfilledKg >= req.targetQuantityKg,
        supplierCount: allocatedSuppliers.length,
        proposalHeadline: `Fulfilled through ${allocatedSuppliers.length} suppliers (100% Demand Met)`,
        suppliers: allocatedSuppliers,
        totalFarmerPayout,
        averageFarmgatePrice: Number(weightedAvgPrice)
      }
    };
  }

  // ── 4. CREATE BULK ORDER & DISPATCH LOGISTICS ────────────────────────────────
  acceptFulfillmentPlan(requirementId) {
    const match = this.getMatchesForRequirement(requirementId);
    if (!match || !match.fulfillmentPlan) {
      throw new Error('Fulfillment plan unavailable');
    }

    const { requirement, fulfillmentPlan } = match;

    // 1. Lock harvest reservations
    for (const alloc of fulfillmentPlan.suppliers) {
      const harvest = this.state.harvests.find(h => h.id === alloc.id);
      if (harvest) {
        harvest.availableQuantityKg = Math.max(0, harvest.availableQuantityKg - alloc.allocatedKg);
        harvest.allocatedQuantityKg += alloc.allocatedKg;
        harvest.status = harvest.availableQuantityKg === 0 ? 'FULLY_RESERVED' : 'PARTIALLY_RESERVED';
      }
    }

    // 2. Mark requirement as fulfilled
    const req = this.state.requirements.find(r => r.id === requirement.id);
    if (req) {
      req.status = 'FULFILLED';
    }

    // 3. Compute Route & Storage via services
    const routePlan = routeOptimizationService.optimizeCollectionRoute({
      suppliers: fulfillmentPlan.suppliers.map(s => ({
        id: s.id,
        name: s.name,
        location: s.location,
        lat: s.lat || 10.8250,
        lng: s.lng || 78.6850,
        quantityKg: s.allocatedKg
      })),
      buyerDestination: {
        name: requirement.destination,
        location: requirement.destination,
        lat: 13.0827,
        lng: 80.2707
      }
    });

    const storagePlan = storageRecommendationService.recommendStorage({
      crop: requirement.crop,
      quantityKg: fulfillmentPlan.totalFulfilledKg,
      originRegion: 'Trichy'
    });

    // 4. Calculate Transparent Payout Ledger
    const auditLedger = impactAnalyticsService.calculateTransactionAudit({
      crop: requirement.crop,
      quantityKg: fulfillmentPlan.totalFulfilledKg,
      suppliers: fulfillmentPlan.suppliers.map(s => ({
        name: s.name,
        quantityKg: s.allocatedKg,
        ratePerKg: s.unitPrice
      })),
      logisticsDistanceKm: routePlan.optimized.totalDistanceKm,
      logisticsCost: routePlan.optimized.totalLogisticsCost,
      storageDays: 3,
      storageCost: storagePlan.primaryRecommendation.estimatedTotalCost || 1800,
      qcInspectionCost: 800
    });

    // 5. Create Bulk Order Entity
    const bulkOrderId = 'ORDER-BLK-' + (this.state.bulkOrders.length + 101);
    const newBulkOrder = {
      id: bulkOrderId,
      requirementId: requirement.id,
      buyerName: requirement.buyerName,
      crop: requirement.crop,
      totalQuantityKg: fulfillmentPlan.totalFulfilledKg,
      destination: requirement.destination,
      deliveryDeadline: requirement.requiredDate,
      totalLandedCost: auditLedger.finalAmount,
      landedPricePerKg: auditLedger.landedPricePerKg,
      status: 'CONFIRMED', // CONFIRMED, IN_TRANSIT, DELIVERED
      allocations: fulfillmentPlan.suppliers,
      route: routePlan,
      storage: storagePlan,
      auditLedger,
      createdAt: new Date().toISOString()
    };

    // 6. Create Live Active Shipment Entity for Logistics Command
    const shipmentId = 'SHP-' + (this.state.shipments.length + 9841);
    const newShipment = {
      id: shipmentId,
      bulkOrderId,
      crop: requirement.crop,
      totalQuantityKg: fulfillmentPlan.totalFulfilledKg,
      vehicle: routePlan.vehicle,
      driverName: routePlan.vehicle.driverName,
      driverContact: routePlan.vehicle.driverContact,
      status: 'IN_TRANSIT', // ORDER_CONFIRMED, VEHICLE_ASSIGNED, PICKUP, IN_TRANSIT, STORAGE, DELIVERED
      currentLegIndex: 3,
      currentLocation: 'NH-44 Expressway near Namakkal',
      currentSpeedKmH: 58,
      cargoTemp: '11.4°C (Optimal)',
      batteryLevel: '98%',
      etaToNextStop: '38 mins to Salem Storage Node',
      etaToBuyer: '5h 15m remaining',
      waypoints: routePlan.waypoints,
      telemetryHistory: [
        { time: '06:15 AM', event: `Pickup Complete (Farmer A: ${fulfillmentPlan.suppliers[0]?.allocatedKg || 700} kg)`, status: 'done' },
        { time: '08:00 AM', event: `Pickup Complete (FPO C: ${fulfillmentPlan.suppliers[2]?.allocatedKg || 800} kg)`, status: 'done' },
        { time: '10:15 AM', event: `Pickup Complete (Farmer B: ${fulfillmentPlan.suppliers[1]?.allocatedKg || 500} kg)`, status: 'done' },
        { time: '01:10 PM', event: 'En route to Salem Storage Node via NH-44', status: 'active' },
        { time: '02:00 PM', event: 'Salem Buffer Stop & Inspection', status: 'pending' },
        { time: '07:30 PM', event: 'Scheduled Chennai Hub Arrival', status: 'pending' }
      ],
      createdAt: new Date().toISOString()
    };

    this.state.bulkOrders = [newBulkOrder, ...this.state.bulkOrders];
    this.state.shipments = [newShipment, ...this.state.shipments];
    this.saveState();

    return {
      bulkOrder: newBulkOrder,
      shipment: newShipment
    };
  }

  // ── 5. SHIPMENT PROGRESSION & STAGE ADVANCEMENT ──────────────────────────────
  getShipments() {
    // If empty, auto-generate initial live shipment from scenario
    if (this.state.shipments.length === 0) {
      this.acceptFulfillmentPlan('req-freshbasket-01');
    }
    return this.state.shipments;
  }

  getActiveShipment() {
    return this.getShipments()[0];
  }

  updateShipmentStage(shipmentId, nextStage) {
    const shipment = this.state.shipments.find(s => s.id === shipmentId) || this.state.shipments[0];
    if (!shipment) return;

    shipment.status = nextStage;
    if (nextStage === 'DELIVERED') {
      const order = this.state.bulkOrders.find(o => o.id === shipment.bulkOrderId);
      if (order) order.status = 'DELIVERED';
    }

    this.saveState();
    return shipment;
  }

  // ── 6. DELIVERY SIGN-OFF & TRANSPARENT SETTLEMENT ────────────────────────────
  completeDeliverySignoff(shipmentId, { otpCode = '849201', qcScore = '98.6% Grade A', buyerRating = 5 } = {}) {
    const shipment = this.state.shipments.find(s => s.id === shipmentId) || this.state.shipments[0];
    if (!shipment) return;

    shipment.status = 'DELIVERED';
    shipment.deliverySignoff = {
      signedBy: 'Anita Desai (Procurement Manager)',
      signedAt: new Date().toISOString(),
      otpCode,
      otpVerified: true,
      qcScore,
      buyerRating,
      digitalSignatureHash: '0x' + Math.random().toString(16).substr(2, 10) + '9fa4b2e8'
    };

    // Update parent BulkOrder
    const order = this.state.bulkOrders.find(o => o.id === shipment.bulkOrderId) || this.state.bulkOrders[0];
    if (order) {
      order.status = 'DELIVERED';
      order.deliveredAt = shipment.deliverySignoff.signedAt;

      // Credit individual farmer earnings immediately
      for (const alloc of order.allocations) {
        const farmerKey = alloc.farmerId || 'farmer-ravi-teja';
        if (!this.state.earnings[farmerKey]) {
          this.state.earnings[farmerKey] = { totalEarned: 0, completedOrdersCount: 0, allocatedLots: [] };
        }
        const record = this.state.earnings[farmerKey];
        record.totalEarned += alloc.subtotal || (alloc.allocatedKg * alloc.unitPrice);
        record.completedOrdersCount += 1;
        record.allocatedLots.push({
          orderId: order.id,
          crop: order.crop,
          quantityKg: alloc.allocatedKg,
          unitPrice: alloc.unitPrice,
          payout: alloc.subtotal,
          deliveredAt: order.deliveredAt
        });
      }
    }

    this.saveState();
    return shipment;
  }

  // ── 7. FARMER EARNINGS ACCESSOR ─────────────────────────────────────────────
  getFarmerEarnings(farmerId = 'farmer-ravi-teja') {
    const record = this.state.earnings[farmerId] || {
      totalEarned: 26600,
      completedOrdersCount: 1,
      allocatedLots: [
        {
          orderId: 'ORDER-BLK-101',
          crop: 'Tomato',
          quantityKg: 700,
          unitPrice: 38,
          payout: 26600,
          deliveredAt: '2026-09-25T19:25:00Z'
        }
      ]
    };
    return record;
  }

  // ── 8. RESET SCENARIO HELPER ────────────────────────────────────────────────
  resetToDefaultScenario() {
    localStorage.removeItem(STORAGE_KEY);
    this.state = this.loadState();
    // Auto-create initial scenario state
    this.acceptFulfillmentPlan('req-freshbasket-01');
    this.saveState();
    return this.state;
  }
}

// Export singleton instance
export const supplyChainService = new SupplyChainStore();
export default supplyChainService;
