/**
 * buyerMatchingService.js
 * Intelligent Buyer Matching & Multi-Farmer Supply Aggregation Engine for FarmDirect.
 * Matches bulk requirements against individual farmers & FPO collectives,
 * providing detailed match reasons, compatibility scores, and multi-supplier pooling.
 */

export const DEMO_SUPPLIER_POOL = [
  {
    id: 'supp-farmer-a',
    name: 'Ravi Teja Farms (Farmer A)',
    role: 'Farmer',
    crop: 'Tomato',
    variety: 'Hybrid Grade A',
    availableQuantityKg: 700,
    unitPrice: 38,
    location: 'Trichy Rural',
    district: 'Trichy',
    distanceKm: 45,
    harvestDate: '2026-09-24',
    qualityGrade: 'Grade A',
    reliabilityScore: 98,
    matchScore: 92,
    verified: true,
    fpoAffiliated: false,
    reasons: [
      { text: 'Quantity available (700 kg ready for dispatch)', status: true },
      { text: 'Harvest date compatible (1 day buffer before delivery deadline)', status: true },
      { text: 'Within delivery radius (< 50 km to consolidated corridor)', status: true },
      { text: 'Price compatible (₹38/kg matches ₹40 target budget)', status: true },
      { text: 'Quality compatible (Certified Grade A / Zero chemical pesticide residue)', status: true },
    ]
  },
  {
    id: 'supp-farmer-b',
    name: 'Kaveri Valley Greenery (Farmer B)',
    role: 'Farmer',
    crop: 'Tomato',
    variety: 'Hybrid Grade A',
    availableQuantityKg: 500,
    unitPrice: 39,
    location: 'Dindigul Cluster',
    district: 'Dindigul',
    distanceKm: 85,
    harvestDate: '2026-09-25',
    qualityGrade: 'Grade A',
    reliabilityScore: 95,
    matchScore: 84,
    verified: true,
    fpoAffiliated: true,
    reasons: [
      { text: 'Quantity available (500 kg ready for dispatch)', status: true },
      { text: 'Harvest date compatible (Same day harvest pick-up)', status: true },
      { text: 'Within delivery radius (Direct access to NH-44 corridor)', status: true },
      { text: 'Price compatible (₹39/kg matches ₹40 target budget)', status: true },
      { text: 'Quality compatible (Certified Grade A firm skin index)', status: true },
    ]
  },
  {
    id: 'supp-fpo-c',
    name: 'Trichy Agro Producer Collective (FPO C)',
    role: 'FPO / Farmer Group',
    crop: 'Tomato',
    variety: 'Hybrid Grade A',
    availableQuantityKg: 800,
    unitPrice: 37,
    location: 'Manapparai Hub, Trichy',
    district: 'Trichy',
    distanceKm: 60,
    harvestDate: '2026-09-23',
    qualityGrade: 'Grade A',
    reliabilityScore: 99,
    matchScore: 79,
    verified: true,
    fpoAffiliated: true,
    memberFarmersCount: 38,
    reasons: [
      { text: 'Quantity available (800 kg pooled from 12 member farmers)', status: true },
      { text: 'Harvest date compatible (Pre-cooled in cooperative chamber)', status: true },
      { text: 'Within delivery radius (Central consolidation depot available)', status: true },
      { text: 'Price compatible (₹37/kg competitive collective wholesale rate)', status: true },
      { text: 'Quality compatible (Standardized optical sorter graded Grade A)', status: true },
    ]
  },
  {
    id: 'supp-farmer-d',
    name: 'Salem Mountain Orchards',
    role: 'Farmer',
    crop: 'Tomato',
    variety: 'Country Heirloom',
    availableQuantityKg: 350,
    unitPrice: 44,
    location: 'Salem',
    district: 'Salem',
    distanceKm: 140,
    harvestDate: '2026-09-28',
    qualityGrade: 'Grade B',
    reliabilityScore: 88,
    matchScore: 61,
    verified: true,
    fpoAffiliated: false,
    reasons: [
      { text: 'Quantity available (350 kg available)', status: true },
      { text: 'Harvest date delay (Harvests 3 days after deadline)', status: false },
      { text: 'Longer delivery radius (140 km from primary transit leg)', status: false },
      { text: 'Price exceeds target (₹44/kg vs ₹40/kg budget)', status: false },
      { text: 'Grade mismatch (Grade B vs Grade A requirement)', status: false }
    ]
  }
];

export const buyerMatchingService = {
  /**
   * Evaluates buyer requirement and finds ranked matches
   */
  findMatches: ({
    crop = 'Tomato',
    targetQuantityKg = 2000,
    requiredDate = '2026-09-25',
    destination = 'Chennai',
    maxPrice = 40,
    qualityGrade = 'Grade A'
  }) => {
    // Score candidate suppliers
    const candidates = DEMO_SUPPLIER_POOL.map((supplier) => {
      let score = 90;
      if (supplier.crop.toLowerCase() !== crop.toLowerCase()) score -= 40;
      if (supplier.unitPrice > maxPrice) score -= 20;
      if (supplier.qualityGrade !== qualityGrade) score -= 15;
      if (supplier.distanceKm > 100) score -= 10;
      return {
        ...supplier,
        calculatedScore: Math.max(30, Math.min(99, score))
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    // Multi-Farmer Aggregation Algorithm:
    // Takes the best compatible suppliers to satisfy the exact requirement (e.g. 2,000 kg)
    const topThree = candidates.filter(s => s.matchScore >= 75).slice(0, 3);
    const aggregatedSupplyKg = topThree.reduce((acc, curr) => acc + curr.availableQuantityKg, 0);
    const isFullySatisfied = aggregatedSupplyKg >= targetQuantityKg;

    // Calculate pooled pricing
    const totalWeightedCost = topThree.reduce((acc, s) => acc + (s.availableQuantityKg * s.unitPrice), 0);
    const weightedAvgPricePerKg = aggregatedSupplyKg > 0 ? (totalWeightedCost / aggregatedSupplyKg).toFixed(2) : 0;

    const multiFarmerFulfillment = {
      targetQuantityKg,
      totalFulfilledKg: aggregatedSupplyKg,
      fulfillmentPercentage: Math.min(100, Math.round((aggregatedSupplyKg / targetQuantityKg) * 100)),
      supplierCount: topThree.length,
      proposalHeadline: `Fulfilled through ${topThree.length} suppliers`,
      status: isFullySatisfied ? '100% Demand Covered' : 'Partial Match',
      suppliers: topThree.map(s => ({
        id: s.id,
        name: s.name,
        role: s.role,
        allocatedKg: s.availableQuantityKg,
        unitPrice: s.unitPrice,
        subtotal: s.availableQuantityKg * s.unitPrice,
        sharePercentage: ((s.availableQuantityKg / aggregatedSupplyKg) * 100).toFixed(1),
        location: s.location,
        qualityGrade: s.qualityGrade,
        matchScore: s.matchScore
      })),
      totalFarmerPayout: totalWeightedCost,
      averageFarmgatePrice: weightedAvgPricePerKg
    };

    return {
      requirement: {
        crop,
        targetQuantityKg,
        requiredDate,
        destination,
        maxPrice,
        qualityGrade
      },
      candidates,
      multiFarmerFulfillment
    };
  }
};

export default buyerMatchingService;
