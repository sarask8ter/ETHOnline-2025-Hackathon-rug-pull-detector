const axios = require('axios');
const logger = require('../utils/logger');

class EnvioIndexer {
  constructor() {
    this.baseUrl = 'https://api.envio.dev';
    this.indexedContracts = new Map();
  }

  // Index new token contracts for monitoring
  async indexTokenContract(contractAddress, chainId = 1) {
    try {
      const indexerConfig = {
        name: `token-monitor-${contractAddress.slice(-8)}`,
        chains: [chainId],
        contracts: [{
          address: contractAddress,
          abi: [
            'event Transfer(address indexed from, address indexed to, uint256 value)',
            'event Approval(address indexed owner, address indexed spender, uint256 value)'
          ],
          events: ['Transfer', 'Approval']
        }]
      };

      // Simulate indexer creation (in real implementation, would use Envio CLI/API)
      this.indexedContracts.set(contractAddress, {
        config: indexerConfig,
        startBlock: await this.getCurrentBlock(chainId),
        created: new Date()
      });

      logger.info(`Envio indexer created for contract: ${contractAddress}`);
      return true;
    } catch (error) {
      logger.error('Failed to create Envio indexer:', error);
      return false;
    }
  }

  // Query token transfer events using HyperSync
  async getTokenTransfers(contractAddress, fromBlock, toBlock, chainId = 1) {
    try {
      // Simulate HyperSync query (replace with actual Envio HyperSync client)
      const query = {
        from_block: fromBlock,
        to_block: toBlock,
        contracts: [contractAddress],
        events: ['Transfer'],
        limit: 1000
      };

      // Mock response - in real implementation, use Envio HyperSync client
      const mockTransfers = this.generateMockTransfers(contractAddress, fromBlock, toBlock);
      
      return {
        transfers: mockTransfers,
        totalCount: mockTransfers.length,
        source: 'envio_hypersync'
      };
    } catch (error) {
      logger.error('HyperSync query failed:', error);
      return { transfers: [], totalCount: 0 };
    }
  }

  // Analyze token activity using indexed data
  async analyzeTokenActivity(contractAddress, chainId = 1) {
    try {
      const currentBlock = await this.getCurrentBlock(chainId);
      const fromBlock = Math.max(0, currentBlock - 1000); // Last ~1000 blocks

      const transferData = await this.getTokenTransfers(
        contractAddress, 
        fromBlock, 
        currentBlock, 
        chainId
      );

      const uniqueTraders = new Set();
      let totalVolume = 0;
      let largeTransfers = 0;
      const hourlyActivity = new Map();

      transferData.transfers.forEach(transfer => {
        uniqueTraders.add(transfer.from);
        uniqueTraders.add(transfer.to);
        
        const value = BigInt(transfer.value);
        totalVolume += Number(value);
        
        if (value > BigInt('1000000000000000000')) { // > 1 ETH equivalent
          largeTransfers++;
        }

        const hour = Math.floor(transfer.timestamp / 3600);
        hourlyActivity.set(hour, (hourlyActivity.get(hour) || 0) + 1);
      });

      let riskScore = 0;
      let reasoning = [];

      // Low unique trader count = higher risk
      if (uniqueTraders.size < 5) {
        riskScore += 40;
        reasoning.push('Very few unique traders detected');
      } else if (uniqueTraders.size < 20) {
        riskScore += 20;
        reasoning.push('Limited trader diversity');
      } else {
        reasoning.push('Good trader diversity');
      }

      // High concentration of large transfers = risk
      if (largeTransfers > transferData.totalCount * 0.5) {
        riskScore += 30;
        reasoning.push('High concentration of large transfers');
      }

      // Activity pattern analysis
      const maxHourlyActivity = Math.max(...hourlyActivity.values());
      const avgHourlyActivity = Array.from(hourlyActivity.values())
        .reduce((a, b) => a + b, 0) / hourlyActivity.size;
      
      if (maxHourlyActivity > avgHourlyActivity * 5) {
        riskScore += 25;
        reasoning.push('Suspicious activity spikes detected');
      }

      return {
        factor: 'envio_activity_analysis',
        score: Math.min(riskScore, 100),
        reasoning,
        data: {
          uniqueTraders: uniqueTraders.size,
          totalTransfers: transferData.totalCount,
          largeTransfers,
          totalVolume: totalVolume.toString(),
          activityPattern: Object.fromEntries(hourlyActivity)
        }
      };
    } catch (error) {
      logger.error('Envio activity analysis failed:', error);
      return {
        factor: 'envio_activity_analysis',
        score: 50,
        reasoning: ['Activity analysis failed'],
        error: error.message
      };
    }
  }

  // Generate mock transfer data (replace with actual HyperSync data)
  generateMockTransfers(contractAddress, fromBlock, toBlock) {
    const transfers = [];
    const numTransfers = Math.floor(Math.random() * 50) + 10;

    for (let i = 0; i < numTransfers; i++) {
      transfers.push({
        from: `0x${Math.random().toString(16).slice(2, 42).padStart(40, '0')}`,
        to: `0x${Math.random().toString(16).slice(2, 42).padStart(40, '0')}`,
        value: (BigInt(Math.floor(Math.random() * 1000000)) * BigInt('1000000000000000000')).toString(),
        blockNumber: fromBlock + Math.floor(Math.random() * (toBlock - fromBlock)),
        timestamp: Date.now() - Math.floor(Math.random() * 86400000), // Within last day
        txHash: `0x${Math.random().toString(16).slice(2).padStart(64, '0')}`
      });
    }

    return transfers;
  }

  async getCurrentBlock(chainId) {
    // Mock current block number
    return 18000000 + Math.floor(Math.random() * 100000);
  }
}

module.exports = EnvioIndexer;