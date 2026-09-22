/**
 * storageRecommendationService.js
 * Smart Storage Advisor for FarmDirect.
 * Evaluates produce perishability, cold-chain compatibility, storage nodes,
 * shelf-life extension, and split-storage allocations.
 */

export const STORAGE_NODES_DIRECTORY = [
  {
    id: 'store-salem-01',
    name: 'Salem Agro Cold Chain Facility',
    type: 'Multi-Chamber Refrigerated Cold Storage',
    district: 'Salem',
    address: 'NH-44 Agro Industrial Corridor, Salem',
    distanceKm: 42,
    compatibleCrops: ['Tomato', 'Capsicum', 'Carrot', 'Grapes'],
    optimalTempRange: '10°C - 13°C',
    humidityRange: '90% - 95% RH',
    availableCapacityTons: 14.5,
    totalCapacityTons: 50.0,
    dailyCostPerTon: 300,
    dailyCostPerKg: 0.30,
    shelfLifeExtensionDays: 14,
    spoilageReductionRate: '93% Spoilage Loss Prevented',
    rating: 4.9,
    certifications: ['FSSAI Cold Chain Certified', 'APEDA Approved'],
    recommendationReason: 'Strategically positioned on the northern transit corridor toward Chennai with precision temperature telemetry.'
  },
  {
    id: 'store-trichy-02',
    name: 'Trichy Central Agro Buffer Warehouse',
    type: 'Controlled Atmosphere (CA) Pre-cooling Depot',
    district: 'Trichy',
    address: 'Near Ponmalai Goods Shed, Trichy',
    distanceKm: 18,
    compatibleCrops: ['Tomato', 'Banana', 'Onion', 'Mango'],
    optimalTempRange: '12°C - 14°C',
    humidityRange: '85% - 90% RH',
    availableCapacityTons: 8.0,
    totalCapacityTons: 25.0,
    dailyCostPerTon: 280,
    dailyCostPerKg: 0.28,
    shelfLifeExtensionDays: 10,
    spoilageReductionRate: '88% Spoilage Loss Prevented',
    rating: 4.8,
    certifications: ['WDRA Registered', 'FSSAI Certified'],
    recommendationReason: 'Immediate proximity to farm harvest clusters for rapid post-harvest heat removal and pre-cooling.'
  },
  {
    id: 'store-dindigul-03',
    name: 'Dindigul Regional Fruit & Veg Preserve',
    type: 'Refrigerated Micro-Node',
    district: 'Dindigul',
    address: 'Oddanchatram Highway, Dindigul',
    distanceKm: 55,
    compatibleCrops: ['Tomato', 'Shallots', 'Drumstick'],
    optimalTempRange: '11°C - 13°C',
    humidityRange: '88% - 92% RH',
    availableCapacityTons: 3.5,
    totalCapacityTons: 15.0,
    dailyCostPerTon: 290,
    dailyCostPerKg: 0.29,
    shelfLifeExtensionDays: 12,
    spoilageReductionRate: '90% Spoilage Loss Prevented',
    rating: 4.7,
    certifications: ['State Warehouse Corp'],
    recommendationReason: 'Ideal for interim buffering during high morning harvest influx.'
  }
];

export const storageRecommendationService = {
  /**
   * Evaluates storage options for a given crop batch
   */
  recommendStorage: ({
    crop = 'Tomato',
    quantityKg = 2000,
    originRegion = 'Trichy',
    targetDays = 3
  } = {}) => {
    const quantityTons = quantityKg / 1000;
    
    // Filter facilities that accept this crop
    const compatible = STORAGE_NODES_DIRECTORY.filter(node => 
      node.compatibleCrops.some(c => c.toLowerCase() === crop.toLowerCase())
    );

    // Rank based on capacity and distance
    const ranked = compatible.map(facility => {
      const canFitEntireBatch = facility.availableCapacityTons >= quantityTons;
      const totalEstimatedCost = Math.round(facility.dailyCostPerKg * quantityKg * targetDays);

      return {
        ...facility,
        canFitEntireBatch,
        estimatedTotalCost: totalEstimatedCost,
        costBreakdown: `₹${facility.dailyCostPerKg}/kg/day × ${quantityKg} kg × ${targetDays} days = ₹${totalEstimatedCost}`,
        matchScore: canFitEntireBatch ? 96 : 74
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    const primaryFacility = ranked[0] || STORAGE_NODES_DIRECTORY[0];
    
    // Split storage check: If batch exceeds primary facility capacity
    let splitRequired = false;
    let splitAllocations = null;

    if (quantityTons > primaryFacility.availableCapacityTons && ranked.length > 1) {
      splitRequired = true;
      const alloc1 = primaryFacility.availableCapacityTons;
      const alloc2 = quantityTons - alloc1;
      splitAllocations = [
        { facility: primaryFacility.name, allocatedTons: alloc1, allocatedKg: alloc1 * 1000 },
        { facility: ranked[1].name, allocatedTons: alloc2, allocatedKg: alloc2 * 1000 }
      ];
    }

    return {
      crop,
      quantityKg,
      targetDays,
      primaryRecommendation: primaryFacility,
      allOptions: ranked,
      temperatureGuidelines: primaryFacility.optimalTempRange,
      shelfLifeBenefit: `Extends harvest shelf-life by ${primaryFacility.shelfLifeExtensionDays} days`,
      lossReduction: primaryFacility.spoilageReductionRate,
      splitStorage: {
        isRecommended: splitRequired,
        allocations: splitAllocations
      },
      isEstimate: true
    };
  }
};

export default storageRecommendationService;
