# SafeGuard - ETHOnline 2025 Hackathon Implementation Guide

## Project Overview

SafeGuard is a real-time rug-pull detection system that monitors newly deployed ERC-20 tokens and provides risk scores based on on-chain analysis and machine learning heuristics.

## 48-Hour Sprint Implementation

### ✅ Completed Features

1. **Real-time Token Monitoring**
   - Event-driven blockchain monitoring using Ethers.js
   - Automatic detection of new ERC-20 token deployments
   - Real-time data streaming via Socket.io

2. **Risk Analysis Engine**
   - Ownership concentration analysis
   - Liquidity risk assessment
   - Honeypot detection mechanisms
   - Suspicious transfer pattern analysis
   - Contract verification checks
   - Social signal analysis framework

3. **Interactive Dashboard**
   - Real-time token feed with risk scores
   - Risk distribution visualization
   - High-risk alert system
   - Responsive Material-UI design

4. **Backend Infrastructure**
   - Node.js/Express API server
   - MongoDB for data persistence
   - Redis for caching
   - Comprehensive logging system
   - Docker containerization

### 🎯 Demo Scenarios

#### Safe Token Example
```javascript
{
  name: "SafeToken",
  ownership: "renounced",
  creatorHolding: "15%",
  liquidityLocked: true,
  riskScore: 25
}
```

#### Scam Token Example
```javascript
{
  name: "RugToken",
  ownership: "active",
  creatorHolding: "95%",
  honeypotDetected: true,
  riskScore: 95
}
```

## Technical Architecture

### Blockchain Integration
- **Chain Support**: Polygon (Mumbai testnet for demo)
- **RPC Provider**: Alchemy/Infura integration
- **Event Monitoring**: Real-time block scanning
- **Contract Analysis**: ERC-20 standard validation

### Risk Scoring Algorithm

```
Risk Score = Weighted Sum of:
- Ownership Concentration (25%)
- Liquidity Risk (20%)
- Honeypot Detection (25%)
- Suspicious Transfers (15%)
- Contract Verification (10%)
- Social Signals (5%)
```

### Detection Signals

1. **Ownership Red Flags**
   - Creator holds >70% of tokens
   - Non-renounced ownership
   - Hidden admin functions

2. **Liquidity Warnings**
   - Low trading volume
   - Large whale movements
   - Sudden liquidity drains

3. **Honeypot Indicators**
   - Transfer function failures
   - Missing ERC-20 functions
   - Blacklist mechanisms

## Quick Start for Judges

```bash
# Clone and setup
cd safeguard-detector

# Using Docker (Recommended)
docker-compose up

# Or manual setup
cd backend && npm install && npm run dev
cd frontend && npm install && npm start

# Visit http://localhost:3000
```

## Research Foundation

Based on recent academic research on rug-pull detection:
- On-chain feature extraction for fraud detection
- Machine learning approaches for DeFi security
- Real-time blockchain monitoring techniques

## Future Roadmap

- Advanced ML models (Random Forest, Neural Networks)
- Cross-chain support (Ethereum, BSC, Arbitrum)
- Community reporting and validation
- Professional API for DeFi platforms
- Mobile app for instant alerts

## Team Impact

This project addresses a critical DeFi security challenge, potentially saving users millions in rug-pull losses through early detection and education.

---

**Built with ❤️ for ETHOnline 2025**