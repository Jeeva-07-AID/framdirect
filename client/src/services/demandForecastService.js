/**
 * demandForecastService.js
 * Clean deterministic AI Demand Forecasting service for FarmDirect.
 * Supports regional demand prediction, 7-day/30-day forecast, supply-demand gap,
 * overstock risk, and clean abstraction for real ML model integration.
 */

// Regional Demand & Supply Matrix (Baseline reference for Tamil Nadu agro-corridors)
const REGIONAL_MARKET_MATRIX = {
  Trichy: {
    Tomato: {
      crop: 'Tomato',
      variety: 'Hybrid Shivam',
      region: 'Trichy',
      predictedDemandKg: 2840,
      availableSupplyKg: 1950,
      gapKg: 890,
      demandLevel: 'HIGH',
      growthPercent7d: 18.2,
      growthPercent30d: 34.5,
      confidenceScore: 94.6,
      overstockRisk: 'Low',
      riskColor: 'emerald',
      weeklyTrend: [
        { day: 'Day 1', demand: 2400, supply: 1950 },
        { day: 'Day 2', demand: 2510, supply: 1950 },
        { day: 'Day 3', demand: 2620, supply: 1950 },
        { day: 'Day 4', demand: 2690, supply: 1950 },
        { day: 'Day 5', demand: 2750, supply: 1950 },
        { day: 'Day 6', demand: 2800, supply: 1950 },
        { day: 'Day 7', demand: 2840, supply: 1950 },
      ],
      aiInsight: 'Tomato demand in Trichy is predicted to increase by 18% over the next 7 days due to festive procurement spikes in urban retail hubs.',
      recommendedAction: 'Pre-book buyers before harvest to capture peak farmgate realization.',
      benchmarkPricePerKg: 40,
      estimatedPriceRange: [41, 45]
    },
    Onion: {
      crop: 'Onion',
      variety: 'Bellary Medium',
      region: 'Trichy',
      predictedDemandKg: 3400,
      availableSupplyKg: 3100,
      gapKg: 300,
      demandLevel: 'MODERATE',
      growthPercent7d: 6.4,
      growthPercent30d: 12.0,
      confidenceScore: 91.2,
      overstockRisk: 'Low',
      riskColor: 'emerald',
      benchmarkPricePerKg: 32,
      estimatedPriceRange: [32, 35]
    },
    Banana: {
      crop: 'Banana',
      variety: 'Poovan / Nendran',
      region: 'Trichy',
      predictedDemandKg: 4500,
      availableSupplyKg: 4900,
      gapKg: -400,
      demandLevel: 'SURPLUS',
      growthPercent7d: -4.5,
      growthPercent30d: -8.0,
      confidenceScore: 89.0,
      overstockRisk: 'High',
      riskColor: 'amber',
      aiInsight: 'Surplus banana arrivals detected along the Cauvery belt. Overstock risk elevated.',
      recommendedAction: 'Utilize ripened cold storage or divert shipments to Coimbatore metro.',
      benchmarkPricePerKg: 28,
      estimatedPriceRange: [24, 27]
    }
  },
  Chennai: {
    Tomato: {
      crop: 'Tomato',
      region: 'Chennai',
      predictedDemandKg: 6500,
      availableSupplyKg: 4200,
      gapKg: 2300,
      demandLevel: 'CRITICAL_HIGH',
      growthPercent7d: 22.4,
      confidenceScore: 96.0,
      overstockRisk: 'None',
      benchmarkPricePerKg: 44,
      estimatedPriceRange: [45, 52]
    },
    Onion: {
      crop: 'Onion',
      region: 'Chennai',
      predictedDemandKg: 7800,
      availableSupplyKg: 6000,
      gapKg: 1800,
      demandLevel: 'HIGH',
      growthPercent7d: 14.1,
      confidenceScore: 92.5,
      benchmarkPricePerKg: 36,
      estimatedPriceRange: [38, 42]
    }
  },
  Madurai: {
    Tomato: {
      crop: 'Tomato',
      region: 'Madurai',
      predictedDemandKg: 2100,
      availableSupplyKg: 1800,
      gapKg: 300,
      demandLevel: 'MODERATE',
      growthPercent7d: 8.5,
      confidenceScore: 90.0,
      benchmarkPricePerKg: 38,
      estimatedPriceRange: [38, 41]
    }
  },
  Coimbatore: {
    Tomato: {
      crop: 'Tomato',
      region: 'Coimbatore',
      predictedDemandKg: 3900,
      availableSupplyKg: 2900,
      gapKg: 1000,
      demandLevel: 'HIGH',
      growthPercent7d: 15.6,
      confidenceScore: 93.4,
      benchmarkPricePerKg: 42,
      estimatedPriceRange: [43, 47]
    }
  },
  Salem: {
    Tomato: {
      crop: 'Tomato',
      region: 'Salem',
      predictedDemandKg: 1900,
      availableSupplyKg: 1650,
      gapKg: 250,
      demandLevel: 'BALANCED',
      growthPercent7d: 4.2,
      confidenceScore: 89.5,
      benchmarkPricePerKg: 37,
      estimatedPriceRange: [37, 40]
    }
  }
};

/**
 * Service API methods
 */
export const demandForecastService = {
  /**
   * Get demand forecast for a specific crop and region
   */
  getForecast: (crop = 'Tomato', region = 'Trichy') => {
    const regionData = REGIONAL_MARKET_MATRIX[region] || REGIONAL_MARKET_MATRIX['Trichy'];
    const cropData = regionData[crop] || regionData['Tomato'];
    return {
      ...cropData,
      isEstimate: true,
      lastCalculated: '2026-09-22T08:00:00Z',
      forecastHorizon: '7-Day & 30-Day Predictive Model v2.4'
    };
  },

  /**
   * Get Farmer-specific AI Farm Insight
   * Example: Upcoming harvest 500kg vs regional demand 780kg
   */
  getFarmerInsight: (farmerCrop = 'Tomato', farmerRegion = 'Trichy', upcomingHarvestKg = 500) => {
    return {
      crop: farmerCrop,
      region: farmerRegion,
      growthPercent7d: 18.0,
      upcomingHarvestKg,
      predictedRegionalDemandKg: 780,
      opportunityLevel: 'High',
      opportunityScore: 92,
      headline: 'Tomato demand in Trichy is predicted to increase by 18% over the next 7 days.',
      recommendedAction: 'Pre-book buyers before harvest to capture peak farmgate realization.',
      potentialRevenueBoost: '₹4,500 - ₹6,000 above standard spot rate',
      isEstimate: true
    };
  },

  /**
   * Get full regional heatmap matrix across all primary centers
   */
  getRegionalHeatmap: (selectedCrop = 'Tomato') => {
    const regions = ['Trichy', 'Chennai', 'Madurai', 'Coimbatore', 'Salem'];
    return regions.map((region) => {
      const data = demandForecastService.getForecast(selectedCrop, region);
      return {
        region,
        crop: selectedCrop,
        demandKg: data.predictedDemandKg,
        supplyKg: data.availableSupplyKg,
        gapKg: data.gapKg,
        demandLevel: data.demandLevel,
        avgPrice: data.benchmarkPricePerKg,
        suppliersCount: region === 'Trichy' ? 14 : region === 'Chennai' ? 4 : 8,
        buyersCount: region === 'Trichy' ? 9 : region === 'Chennai' ? 28 : 12,
        status: data.gapKg > 500 ? 'Severe Shortage' : data.gapKg > 0 ? 'Shortage' : data.gapKg < -200 ? 'Surplus / Overstock' : 'Balanced'
      };
    });
  },

  /**
   * Get top high-demand and low-demand crops
   */
  getCropMarketSummary: () => {
    return {
      highDemandCrops: [
        { crop: 'Tomato', region: 'Trichy / Chennai', gap: '+890 kg shortage', trend: '↑ +18%' },
        { crop: 'Shallots (Small Onion)', region: 'Perambalur', gap: '+1,200 kg shortage', trend: '↑ +24%' },
        { crop: 'Green Capsicum', region: 'Hosur Hub', gap: '+650 kg shortage', trend: '↑ +15%' }
      ],
      overstockRiskCrops: [
        { crop: 'Banana (Poovan)', region: 'Cauvery Belt', gap: '-400 kg surplus', trend: '↓ -4.5%' },
        { crop: 'Cabbage', region: 'Nilgiris Outskirts', gap: '-600 kg surplus', trend: '↓ -6.0%' }
      ]
    };
  }
};

export default demandForecastService;
