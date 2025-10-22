const { ethers } = require('ethers');
const EventEmitter = require('events');
const logger = require('../utils/logger');

class TokenWatcher extends EventEmitter {
  constructor() {
    super();
    this.provider = null;
    this.isRunning = false;
    this.watchedContracts = new Set();
  }

  async start() {
    try {
      this.provider = new ethers.JsonRpcProvider(
        process.env.ETHEREUM_RPC_URL || process.env.POLYGON_RPC_URL
      );
      
      await this.setupEventListeners();
      this.isRunning = true;
      logger.info('TokenWatcher started successfully');
    } catch (error) {
      logger.error('Failed to start TokenWatcher:', error);
    }
  }

  async setupEventListeners() {
    const erc20Interface = new ethers.Interface([
      'event Transfer(address indexed from, address indexed to, uint256 value)',
      'function name() view returns (string)',
      'function symbol() view returns (string)',
      'function totalSupply() view returns (uint256)',
      'function decimals() view returns (uint8)',
      'function owner() view returns (address)',
      'function balanceOf(address) view returns (uint256)'
    ]);

    this.provider.on('block', async (blockNumber) => {
      try {
        await this.scanBlockForNewTokens(blockNumber);
      } catch (error) {
        logger.error('Error scanning block:', error);
      }
    });

    logger.info('Event listeners setup complete');
  }

  async scanBlockForNewTokens(blockNumber) {
    try {
      const block = await this.provider.getBlock(blockNumber, true);
      
      if (!block || !block.transactions) return;

      for (const tx of block.transactions) {
        if (tx.to === null && tx.data && tx.data.length > 100) {
          await this.analyzeContractCreation(tx);
        }
      }
    } catch (error) {
      logger.error(`Error scanning block ${blockNumber}:`, error);
    }
  }

  async analyzeContractCreation(transaction) {
    try {
      const receipt = await this.provider.getTransactionReceipt(transaction.hash);
      
      if (!receipt || !receipt.contractAddress) return;

      const isERC20 = await this.isERC20Contract(receipt.contractAddress);
      
      if (isERC20) {
        const tokenData = await this.gatherTokenData(receipt.contractAddress, transaction);
        this.emit('newToken', tokenData);
      }
    } catch (error) {
      logger.debug('Contract analysis failed:', error.message);
    }
  }

  async isERC20Contract(address) {
    try {
      const contract = new ethers.Contract(address, [
        'function name() view returns (string)',
        'function symbol() view returns (string)',
        'function totalSupply() view returns (uint256)',
        'function decimals() view returns (uint8)'
      ], this.provider);

      await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.totalSupply(),
        contract.decimals()
      ]);

      return true;
    } catch (error) {
      return false;
    }
  }

  async gatherTokenData(address, transaction) {
    const contract = new ethers.Contract(address, [
      'function name() view returns (string)',
      'function symbol() view returns (string)',
      'function totalSupply() view returns (uint256)',
      'function decimals() view returns (uint8)',
      'function owner() view returns (address)',
      'function balanceOf(address) view returns (uint256)'
    ], this.provider);

    try {
      const [name, symbol, totalSupply, decimals] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.totalSupply(),
        contract.decimals()
      ]);

      let owner = null;
      try {
        owner = await contract.owner();
      } catch (e) {
        owner = transaction.from;
      }

      const creatorBalance = await contract.balanceOf(transaction.from);

      return {
        address,
        name,
        symbol,
        totalSupply: totalSupply.toString(),
        decimals,
        owner,
        creator: transaction.from,
        creatorBalance: creatorBalance.toString(),
        deploymentTx: transaction.hash,
        deploymentBlock: transaction.blockNumber,
        gasUsed: transaction.gasLimit.toString(),
        gasPrice: transaction.gasPrice.toString()
      };
    } catch (error) {
      logger.error('Error gathering token data:', error);
      throw error;
    }
  }

  stop() {
    if (this.provider) {
      this.provider.removeAllListeners();
    }
    this.isRunning = false;
    logger.info('TokenWatcher stopped');
  }
}

module.exports = TokenWatcher;