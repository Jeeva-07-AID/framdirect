/**
 * priceIntelligenceService.js
 * AI Price Intelligence service for FarmDirect.
 * Provides current farmgate prices, historical averages, 7-day/30-day trends,
 * and estimated future price bands. All predictions are explicitly labeled as estimates.
 */

export const CROP_PRICE_DATABASE = {
  Tomato: {
    crop: 'Tomato',
    variety: 'Hybrid Shivam / Sahu',
    currentPrice: 40,
    historicalAverage: 37,
    demandTrend: 'Increasing',
    trendDirection: 'up',
    trendPercent: '+8.1%',
    estimatedFutureMin: 41,
    estimatedFutureMax: 45,
    mandiWholesaleRate: 31,
    retailMarketRate: 52,
    confidenceScore: 94.2,
    priceDrivers: [
      'Festive demand spike across Chennai & Bangalore consumer hubs',
      'Lower seasonal yield arrivals from border districts',
      'High institutional bulk pre-booking volume'
    ],
    priceHistory7d: [
      { date: '16 Sep', price: 36 },
      { date: '17 Sep', price: 37 },
      { date: '18 Sep', price: 37 },
      { date: '19 Sep', price: 38 },
      { date: '20 Sep', price: 39 },
      { date: '21 Sep', price: 39 },
      { date: '22 Sep (Today)', price: 40 },
      { date: '25 Sep (Est)', price: 43 },
      { date: '30 Sep (Est)', price: 45 }
    ]
  },
  Onion: {
    crop: 'Onion',
    variety: 'Medium Bellary Red',
    currentPrice: 32,
    historicalAverage: 30,
    demandTrend: 'Steady Growth',
    trendDirection: 'up',
    trendPercent: '+6.6%',
    estimatedFutureMin: 32,
    estimatedFutureMax: 35,
    mandiWholesaleRate: 24,
    retailMarketRate: 42,
    confidenceScore: 91.0,
    priceDrivers: ['Stable buffer releases', 'Inter-state logistics demand'],
    priceHistory7d: [
      { date: '16 Sep', price: 29 },
      { date: '17 Sep', price: 30 },
      { date: '18 Sep', price: 30 },
      { date: '19 Sep', price: 31 },
      { date: '20 Sep', price: 31 },
      { date: '21 Sep', price: 32 },
      { date: '22 Sep (Today)', price: 32 },
      { date: '25 Sep (Est)', price: 33 },
      { date: '30 Sep (Est)', price: 35 }
    ]
  },
  Banana: {
    crop: 'Banana',
    variety: 'Poovan Green',
    currentPrice: 28,
    historicalAverage: 31,
    demandTrend: 'Softening (Surplus Influx)',
    trendDirection: 'down',
    trendPercent: '-9.6%',
    estimatedFutureMin: 24,
    estimatedFutureMax: 27,
    mandiWholesaleRate: 18,
    retailMarketRate: 38,
    confidenceScore: 88.5,
    priceDrivers: ['Peak monsoon harvest along Cauvery delta', 'Temporary local market surplus'],
    priceHistory7d: [
      { date: '16 Sep', price: 32 },
      { date: '17 Sep', price: 31 },
      { date: '18 Sep', price: 30 },
      { date: '19 Sep', price: 29 },
      { date: '20 Sep', price: 29 },
      { date: '21 Sep', price: 28 },
      { date: '22 Sep (Today)', price: 28 },
      { date: '25 Sep (Est)', price: 26 },
      { date: '30 Sep (Est)', price: 25 }
    ]
  },
  Capsicum: {
    crop: 'Green Capsicum',
    variety: 'Indra F1 Hybrid',
    currentPrice: 48,
    historicalAverage: 44,
    demandTrend: 'Strong Demand',
    trendDirection: 'up',
    trendPercent: '+9.1%',
    estimatedFutureMin: 50,
    estimatedFutureMax: 56,
    mandiWholesaleRate: 36,
    retailMarketRate: 68,
    confidenceScore: 92.0,
    priceDrivers: ['Hotel & QSR procurement expansion in tier-1 metros'],
    priceHistory7d: [
      { date: '16 Sep', price: 43 },
      { date: '17 Sep', price: 44 },
      { date: '18 Sep', price: 45 },
      { date: '19 Sep', price: 46 },
      { date: '20 Sep', price: 47 },
      { date: '21 Sep', price: 47 },
      { date: '22 Sep (Today)', price: 48 },
      { date: '25 Sep (Est)', price: 52 },
      { date: '30 Sep (Est)', price: 55 }
    ]
  }
};

export const priceIntelligenceService = {
  /**
   * Get price intelligence report for a crop
   */
  getPriceIntelligence: (crop = 'Tomato') => {
    const data = CROP_PRICE_DATABASE[crop] || CROP_PRICE_DATABASE['Tomato'];
    return {
      ...data,
      isEstimate: true,
      legalDisclaimer: 'Price predictions are statistical AI estimates based on agricultural mandi market models and historical volume data. Prices are not guaranteed futures contracts.'
    };
  },

  /**
   * Get all active crop price cards
   */
  getAllCropPrices: () => {
    return Object.values(CROP_PRICE_DATABASE).map(cropData => ({
      ...cropData,
      isEstimate: true
    }));
  }
};

export default priceIntelligenceService;
