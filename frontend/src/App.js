import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Box } from '@mui/material';
import { io } from 'socket.io-client';

import Dashboard from './pages/Dashboard';
import TokenDetails from './pages/TokenDetails';
import Alerts from './pages/Alerts';
import Navigation from './components/Navigation';
import RealTimeUpdates from './components/RealTimeUpdates';

function App() {
  const [socket, setSocket] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to SafeGuard backend');
    });

    newSocket.on('tokenUpdate', (tokenData) => {
      setTokens(prev => {
        const existing = prev.find(t => t.address === tokenData.address);
        if (existing) {
          return prev.map(t => t.address === tokenData.address ? tokenData : t);
        }
        return [tokenData, ...prev.slice(0, 99)];
      });
    });

    newSocket.on('highRiskAlert', (alertData) => {
      setAlerts(prev => [alertData, ...prev.slice(0, 49)]);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <Router>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" sx={{ backgroundColor: '#1a1a1a' }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#00e676' }}>
              🛡️ SafeGuard
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#666' }}>
              ETHOnline 2025
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Navigation />
        
        <Container maxWidth="xl" sx={{ mt: 2 }}>
          <Routes>
            <Route path="/" element={<Dashboard tokens={tokens} alerts={alerts} />} />
            <Route path="/token/:address" element={<TokenDetails />} />
            <Route path="/alerts" element={<Alerts alerts={alerts} />} />
          </Routes>
        </Container>
        
        <RealTimeUpdates socket={socket} />
      </Box>
    </Router>
  );
}

export default App;