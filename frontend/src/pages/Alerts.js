import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import TokenList from '../components/TokenList';

const Alerts = ({ alerts }) => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, color: '#ff5722' }}>
        🚨 High-Risk Token Alerts
      </Typography>
      
      <Paper sx={{ p: 3, backgroundColor: '#1a1a1a' }}>
        {alerts.length > 0 ? (
          <TokenList tokens={alerts} />
        ) : (
          <Typography sx={{ color: '#666', textAlign: 'center', py: 8 }}>
            No high-risk alerts at this time. SafeGuard is monitoring...
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default Alerts;