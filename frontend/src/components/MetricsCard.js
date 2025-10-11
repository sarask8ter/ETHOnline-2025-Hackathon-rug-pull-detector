import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

const MetricsCard = ({ title, value, icon, color = '#00e676' }) => {
  return (
    <Paper 
      sx={{ 
        p: 2, 
        backgroundColor: '#1a1a1a',
        border: `1px solid ${color}30`,
        borderRadius: 2
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h4" sx={{ color, fontWeight: 'bold' }}>
            {value}
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            {title}
          </Typography>
        </Box>
        <Box sx={{ color, opacity: 0.7 }}>
          {icon}
        </Box>
      </Box>
    </Paper>
  );
};

export default MetricsCard;