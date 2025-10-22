const { HermesClient } = require('@pythnetwork/hermes-client');
const { ethers } = require('ethers');
const logger = require('../utils/logger');

class PythPriceService {
  constructor() {
    this.client = new HermesClient('https://hermes.pyth.network');
    this.priceCache = new Map();
    this.cacheTimeout = 30000; // 30 seconds
  }

  async getPriceData(priceId) {
    const cacheKey = priceId;
    const cached = this.priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const priceFeeds = await this.client.getLatestPriceFeeds([priceId]);
      const priceData = priceFeeds[0];
      
      if (priceData) {
        const data = {
          price: priceData.price.price,
          conf: priceData.price.conf,
          expo: priceData.price.expo,
          publishTime: priceData.price.publishTime
        };
        
        this.priceCache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
        
        return data;
      }
    } catch (error) {
      logger.error('Failed to fetch Pyth price data:', error);
    }
    
    return null;
  }

  // ETH/USD price feed
  async getETHPrice() {
    return this.getPriceData('0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace');
  }

  // BTC/USD price feed  
  async getBTCPrice() {
    return this.getPriceData('0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43');
  }

  // Calculate volatility score based on price confidence
  calculateVolatilityScore(priceData) {
    if (!priceData || !priceData.price || !priceData.conf) {
      return 50; // default medium risk
    }

    const price = Math.abs(priceData.price);
    const confidence = Math.abs(priceData.conf);
    
    if (price === 0) return 100;
    
    const confidenceRatio = (confidence / price) * 100;
    
    // Higher confidence interval = higher volatility = higher risk
    if (confidenceRatio > 5) return 90;
    if (confidenceRatio > 3) return 70;
    if (confidenceRatio > 1) return 50;
    if (confidenceRatio > 0.5) return 30;
    return 10;
  }

  // Enhanced price analysis for tokens
  async analyzeTokenPriceRisk(tokenSymbol) {
    try {
      let priceData = null;
      
      // Map common tokens to Pyth price feeds
      const priceIdMap = {
        'ETH': '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
        'BTC': '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
        'USDC': '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
        'USDT': '0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b'
      };

      const priceId = priceIdMap[tokenSymbol.toUpperCase()];
      if (priceId) {
        priceData = await this.getPriceData(priceId);
      }

      if (!priceData) {
        // For unknown tokens, get ETH price for reference
        priceData = await this.getETHPrice();
      }

      const volatilityScore = this.calculateVolatilityScore(priceData);
      
      return {
        factor: 'pyth_price_volatility',
        score: volatilityScore,
        reasoning: [`Price volatility analysis using Pyth Network data`],
        data: {
          priceData,
          volatilityScore,
          hasRealTimeData: !!priceIdMap[tokenSymbol.toUpperCase()]
        }
      };
    } catch (error) {
      logger.error('Pyth price analysis failed:', error);
      return {
        factor: 'pyth_price_volatility',
        score: 50,
        reasoning: ['Price analysis failed'],
        error: error.message
      };
    }
  }
}

module.exports = PythPriceService;