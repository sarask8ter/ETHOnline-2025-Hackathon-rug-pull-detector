# SafeGuard - Rug-Pull Early Warning System

**ETHOnline 2025 Hackathon Submission**

## Overview

SafeGuard is an early warning system that monitors newly created ERC-20 tokens and provides real-time risk scores to detect potential rug pulls before they happen. Using on-chain data analysis and machine learning heuristics, SafeGuard helps protect users from token scams.

## Features

- **Real-time Token Monitoring**: Watches for new ERC-20 token deployments
- **Risk Scoring**: ML-powered analysis of rug-pull indicators
- **Early Warning Alerts**: Immediate notifications for high-risk tokens
- **Interactive Dashboard**: Real-time visualization of token risk scores
- **Historical Analysis**: Track patterns and learn from past incidents

## Key Detection Signals

- **Ownership Analysis**: Renounced vs retained ownership patterns
- **Liquidity Monitoring**: Sudden liquidity drains and pool manipulations
- **Trading Patterns**: Unusual volume spikes and whale movements
- **Contract Analysis**: Honeypot detection and hidden functions
- **Social Signals**: Community engagement and development activity

## Tech Stack

- **Backend**: Node.js, Express, Socket.io
- **Blockchain**: Ethers.js, Alchemy/Infura RPC
- **ML/Analytics**: TensorFlow.js, custom heuristics
- **Frontend**: React, Chart.js, Material-UI
- **Database**: MongoDB, Redis (caching)
- **Deployment**: Docker, AWS/Vercel

## Quick Start

```bash
# Clone and setup
git clone <repo-url>
cd safeguard-detector

# Backend setup
cd backend
npm install
cp .env.example .env
# Add your RPC URLs and API keys
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
npm start
```

## Project Structure

```
safeguard-detector/
├── backend/          # Node.js API and blockchain monitoring
├── frontend/         # React dashboard
├── contracts/        # Solidity detector contracts (optional)
├── docs/            # Documentation and research
└── README.md
```

## Demo

Visit our live demo at: [Coming Soon]

## Team

Built with ❤️ for ETHOnline 2025

## License

MIT License