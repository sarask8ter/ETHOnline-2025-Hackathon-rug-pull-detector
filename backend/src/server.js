require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

const tokenRoutes = require('./controllers/tokenController');
const alertRoutes = require('./controllers/alertController');
const TokenWatcher = require('./services/TokenWatcher');
const RiskAnalyzer = require('./services/RiskAnalyzer');
const logger = require('./utils/logger');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/tokens', tokenRoutes);
app.use('/api/alerts', alertRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/safeguard')
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((error) => {
    logger.error('MongoDB connection error:', error);
  });

const tokenWatcher = new TokenWatcher();
const riskAnalyzer = new RiskAnalyzer();

tokenWatcher.on('newToken', async (tokenData) => {
  logger.info(`New token detected: ${tokenData.address}`);
  
  const riskScore = await riskAnalyzer.analyzeToken(tokenData);
  
  const enrichedData = {
    ...tokenData,
    riskScore,
    timestamp: new Date()
  };
  
  io.emit('tokenUpdate', enrichedData);
  
  if (riskScore > 70) {
    io.emit('highRiskAlert', enrichedData);
    logger.warn(`High risk token detected: ${tokenData.address} (Score: ${riskScore})`);
  }
});

io.on('connection', (socket) => {
  logger.info('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected:', socket.id);
  });
});

tokenWatcher.start();

server.listen(PORT, () => {
  logger.info(`SafeGuard backend running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  tokenWatcher.stop();
  server.close(() => {
    process.exit(0);
  });
});