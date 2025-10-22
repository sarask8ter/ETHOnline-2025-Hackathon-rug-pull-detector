const axios = require('axios');
const logger = require('../utils/logger');

class BlockscoutService {
  constructor() {
    this.baseUrl = 'https://eth.blockscout.com/api/v2';
    this.sdkConfig = {
      apiKey: process.env.BLOCKSCOUT_API_KEY || 'demo',
      network: 'ethereum'
    };
  }

  // Analyze contract using Blockscout API
  async analyzeContract(contractAddress) {
    try {
      const contractInfo = await this.getContractInfo(contractAddress);
      const transactions = await this.getContractTransactions(contractAddress);
      const verification = await this.checkContractVerification(contractAddress);

      let riskScore = 0;
      let reasoning = [];

      // Contract verification check
      if (!verification.isVerified) {
        riskScore += 50;
        reasoning.push('Contract source code not verified');
      } else {
        reasoning.push('Contract source code verified');
        
        // Check for suspicious patterns in verified code
        if (verification.sourceCode) {
          if (verification.sourceCode.includes('selfdestruct')) {
            riskScore += 30;
            reasoning.push('Contract contains self-destruct functionality');
          }
          
          if (verification.sourceCode.includes('onlyOwner') && 
              verification.sourceCode.split('onlyOwner').length > 5) {
            riskScore += 20;
            reasoning.push('High concentration of owner-only functions');
          }
        }
      }

      // Transaction pattern analysis
      if (transactions.length === 0) {
        riskScore += 40;
        reasoning.push('No transaction history found');
      } else {
        const recentTxs = transactions.filter(tx => 
          Date.now() - new Date(tx.timestamp).getTime() < 86400000 // Last 24 hours
        );

        if (recentTxs.length === 0 && transactions.length > 0) {
          riskScore += 25;
          reasoning.push('No recent transaction activity');
        }

        // Check for unusual gas usage patterns
        const avgGasUsed = transactions.reduce((sum, tx) => sum + (tx.gasUsed || 0), 0) / transactions.length;
        const highGasTxs = transactions.filter(tx => (tx.gasUsed || 0) > avgGasUsed * 3);
        
        if (highGasTxs.length > transactions.length * 0.3) {
          riskScore += 20;
          reasoning.push('High proportion of unusual gas usage transactions');
        }
      }

      // Contract creation analysis
      if (contractInfo.creator) {
        const creatorTxs = await this.getAddressTransactions(contractInfo.creator);
        if (creatorTxs.length > 100) {
          reasoning.push('Contract creator has extensive transaction history');
        } else if (creatorTxs.length < 5) {
          riskScore += 15;
          reasoning.push('Contract creator has limited transaction history');
        }
      }

      return {
        factor: 'blockscout_contract_analysis',
        score: Math.min(riskScore, 100),
        reasoning,
        data: {
          isVerified: verification.isVerified,
          transactionCount: transactions.length,
          creator: contractInfo.creator,
          creationTx: contractInfo.creationTx,
          contractType: this.detectContractType(verification.sourceCode)
        }
      };
    } catch (error) {
      logger.error('Blockscout analysis failed:', error);
      return {
        factor: 'blockscout_contract_analysis',
        score: 50,
        reasoning: ['Contract analysis failed'],
        error: error.message
      };
    }
  }

  async getContractInfo(address) {
    try {
      // Mock response - replace with actual Blockscout SDK call
      return {
        creator: `0x${Math.random().toString(16).slice(2, 42).padStart(40, '0')}`,
        creationTx: `0x${Math.random().toString(16).slice(2).padStart(64, '0')}`,
        balance: '0',
        isContract: true
      };
    } catch (error) {
      logger.error('Failed to get contract info:', error);
      return {};
    }
  }

  async getContractTransactions(address, limit = 50) {
    try {
      // Mock response - replace with actual Blockscout API call
      const transactions = [];
      const numTxs = Math.floor(Math.random() * limit);

      for (let i = 0; i < numTxs; i++) {
        transactions.push({
          hash: `0x${Math.random().toString(16).slice(2).padStart(64, '0')}`,
          from: `0x${Math.random().toString(16).slice(2, 42).padStart(40, '0')}`,
          to: address,
          value: (Math.random() * 1000000000000000000).toString(),
          gasUsed: Math.floor(Math.random() * 500000) + 21000,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: Math.random() > 0.1 ? 'success' : 'failed'
        });
      }

      return transactions;
    } catch (error) {
      logger.error('Failed to get contract transactions:', error);
      return [];
    }
  }

  async checkContractVerification(address) {
    try {
      // Mock verification check - replace with actual Blockscout API call
      const isVerified = Math.random() > 0.3; // 70% chance of being verified
      
      let sourceCode = null;
      if (isVerified) {
        // Mock source code with common patterns
        const patterns = [
          'pragma solidity ^0.8.0;\ncontract Token {\n    mapping(address => uint256) public balanceOf;\n    function transfer(address to, uint256 amount) public {\n        balanceOf[msg.sender] -= amount;\n        balanceOf[to] += amount;\n    }\n}',
          'pragma solidity ^0.8.0;\ncontract SafeToken {\n    address public owner;\n    modifier onlyOwner() { require(msg.sender == owner); _; }\n    function mint(uint256 amount) public onlyOwner {\n        // mint logic\n    }\n}',
          'pragma solidity ^0.8.0;\ncontract RiskyToken {\n    function selfdestruct() public {\n        selfdestruct(payable(msg.sender));\n    }\n}'
        ];
        sourceCode = patterns[Math.floor(Math.random() * patterns.length)];
      }

      return {
        isVerified,
        sourceCode,
        compilerVersion: isVerified ? '0.8.19' : null
      };
    } catch (error) {
      logger.error('Failed to check contract verification:', error);
      return { isVerified: false };
    }
  }

  async getAddressTransactions(address, limit = 20) {
    try {
      // Mock response
      const transactions = [];
      const numTxs = Math.floor(Math.random() * limit * 2);

      for (let i = 0; i < numTxs; i++) {
        transactions.push({
          hash: `0x${Math.random().toString(16).slice(2).padStart(64, '0')}`,
          timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      }

      return transactions;
    } catch (error) {
      logger.error('Failed to get address transactions:', error);
      return [];
    }
  }

  detectContractType(sourceCode) {
    if (!sourceCode) return 'unverified';
    
    if (sourceCode.includes('ERC20') || sourceCode.includes('transfer')) return 'erc20';
    if (sourceCode.includes('ERC721') || sourceCode.includes('tokenId')) return 'nft';
    if (sourceCode.includes('proxy') || sourceCode.includes('implementation')) return 'proxy';
    if (sourceCode.includes('selfdestruct')) return 'self_destructible';
    
    return 'custom';
  }

  // MCP integration for AI analysis
  async getContractAnalysisForMCP(address) {
    try {
      const analysis = await this.analyzeContract(address);
      const contractInfo = await this.getContractInfo(address);
      
      return {
        address,
        riskScore: analysis.score,
        riskFactors: analysis.reasoning,
        verification: analysis.data.isVerified,
        contractType: analysis.data.contractType,
        creator: contractInfo.creator,
        summary: `Contract ${address} has a risk score of ${analysis.score}/100. ${analysis.reasoning.join('. ')}.`
      };
    } catch (error) {
      logger.error('MCP analysis failed:', error);
      return {
        address,
        error: error.message,
        summary: `Failed to analyze contract ${address}: ${error.message}`
      };
    }
  }
}

module.exports = BlockscoutService;