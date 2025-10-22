const { ethers } = require('ethers');
const logger = require('../utils/logger');

class PaypalUsdService {
  constructor() {
    // PYUSD contract addresses on different networks
    this.contracts = {
      ethereum: '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8',
      polygon: '0x692AC1e363ae34b6B489148152b12e2785a3d8d6', 
      // Add more networks as PYUSD expands
    };
    
    this.abi = [
      'function balanceOf(address account) view returns (uint256)',
      'function transfer(address to, uint256 amount) returns (bool)',
      'function approve(address spender, uint256 amount) returns (bool)',
      'function allowance(address owner, address spender) view returns (uint256)',
      'function totalSupply() view returns (uint256)',
      'function decimals() view returns (uint8)',
      'event Transfer(address indexed from, address indexed to, uint256 value)'
    ];

    this.provider = new ethers.JsonRpcProvider(
      process.env.ETHEREUM_RPC_URL
    );
  }

  // Get PYUSD contract for specific network
  getPyusdContract(network = 'ethereum') {
    const contractAddress = this.contracts[network];
    if (!contractAddress) {
      throw new Error(`PYUSD not supported on network: ${network}`);
    }
    
    return new ethers.Contract(contractAddress, this.abi, this.provider);
  }

  // Check if a token is PYUSD
  async isPyusd(tokenAddress) {
    return Object.values(this.contracts)
      .map(addr => addr.toLowerCase())
      .includes(tokenAddress.toLowerCase());
  }

  // Analyze PYUSD integration opportunities for risky tokens
  async analyzePyusdIntegration(tokenData) {
    try {
      const isPyusdToken = await this.isPyusd(tokenData.address);
      
      if (isPyusdToken) {
        // If the token itself is PYUSD, it's very safe
        return {
          factor: 'paypal_usd_analysis',
          score: 5, // Very low risk
          reasoning: ['Token is PayPal USD (PYUSD) - regulated stablecoin'],
          data: {
            isPyusd: true,
            safetyLevel: 'maximum',
            regulatory: 'regulated_stablecoin'
          }
        };
      }

      // For other tokens, analyze potential for PYUSD-based risk mitigation
      const riskMitigationScore = await this.calculateRiskMitigation(tokenData);
      
      return {
        factor: 'paypal_usd_analysis',
        score: riskMitigationScore,
        reasoning: [
          'Risk assessment for PYUSD integration opportunities',
          'Consider using PYUSD for safer DeFi interactions'
        ],
        data: {
          isPyusd: false,
          riskMitigation: riskMitigationScore,
          recommendation: this.getIntegrationRecommendation(riskMitigationScore)
        }
      };
    } catch (error) {
      logger.error('PYUSD analysis failed:', error);
      return {
        factor: 'paypal_usd_analysis',
        score: 50,
        reasoning: ['PYUSD analysis failed'],
        error: error.message
      };
    }
  }

  // Calculate how PYUSD could mitigate risks
  async calculateRiskMitigation(tokenData) {
    let mitigationScore = 50; // Base score
    
    try {
      // Check if token has high supply concentration (could benefit from PYUSD pooling)
      const totalSupply = BigInt(tokenData.totalSupply);
      const creatorBalance = BigInt(tokenData.creatorBalance);
      const creatorPercentage = Number((creatorBalance * BigInt(100)) / totalSupply);
      
      if (creatorPercentage > 70) {
        mitigationScore += 20; // High benefit from PYUSD diversification
      }
      
      // Check if token could benefit from PYUSD-backed liquidity
      const pyusdContract = this.getPyusdContract();
      const pyusdSupply = await pyusdContract.totalSupply();
      
      if (pyusdSupply > BigInt('1000000000000000000000000')) { // > 1M PYUSD
        mitigationScore -= 10; // Lower risk due to PYUSD liquidity availability
      }
      
      return Math.min(mitigationScore, 100);
    } catch (error) {
      logger.error('Risk mitigation calculation failed:', error);
      return 50;
    }
  }

  getIntegrationRecommendation(score) {
    if (score < 30) return 'low_priority';
    if (score < 60) return 'consider_integration';
    if (score < 80) return 'recommended';
    return 'high_priority';
  }

  // Create PYUSD-based payment solution for risk alerts
  async createRiskAlertPayment(userAddress, riskScore) {
    try {
      // Calculate payment amount based on risk level
      const baseAmount = ethers.parseUnits('1', 6); // 1 PYUSD base
      const riskMultiplier = Math.max(1, Math.floor(riskScore / 20));
      const paymentAmount = baseAmount * BigInt(riskMultiplier);
      
      return {
        paymentToken: 'PYUSD',
        amount: paymentAmount.toString(),
        purpose: 'risk_alert_subscription',
        riskLevel: riskScore,
        recommendation: 'Use PYUSD for stable value transactions while monitoring risky tokens'
      };
    } catch (error) {
      logger.error('Payment creation failed:', error);
      return null;
    }
  }

  // Enhanced consumer payment experience
  async processConsumerPayment(fromAddress, toAddress, amount, purpose = 'risk_monitoring') {
    try {
      // In a real implementation, this would create a transaction
      const paymentData = {
        from: fromAddress,
        to: toAddress,
        amount: amount,
        token: 'PYUSD',
        purpose: purpose,
        timestamp: new Date().toISOString(),
        status: 'pending',
        gasless: true, // PYUSD enables gasless transactions in some contexts
        stable: true   // Stable value unlike volatile crypto
      };
      
      logger.info(`PYUSD payment initiated: ${amount} from ${fromAddress} to ${toAddress}`);
      
      return {
        success: true,
        paymentId: `pyusd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        data: paymentData
      };
    } catch (error) {
      logger.error('Consumer payment failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get PYUSD market data for risk calculations
  async getPyusdMarketData() {
    try {
      const contract = this.getPyusdContract();
      const totalSupply = await contract.totalSupply();
      
      return {
        totalSupply: totalSupply.toString(),
        decimals: 6,
        symbol: 'PYUSD',
        name: 'PayPal USD',
        type: 'regulated_stablecoin',
        issuer: 'PayPal',
        backed_by: 'USD_reserves'
      };
    } catch (error) {
      logger.error('Failed to get PYUSD market data:', error);
      return null;
    }
  }
}

module.exports = PaypalUsdService;