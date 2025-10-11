import React from 'react';
import { useParams } from 'react-router-dom';
import { Paper, Typography, Box } from '@mui/material';

const TokenDetails = () => {
  const { address } = useParams();

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, color: '#00e676' }}>
        Token Analysis
      </Typography>
      
      <Paper sx={{ p: 3, backgroundColor: '#1a1a1a' }}>
        <Typography variant="h6" sx={{ color: '#00e676', mb: 2 }}>
          Token Address: {address}
        </Typography>
        
        <Typography sx={{ color: '#666' }}>
          Detailed token analysis will be implemented here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default TokenDetails;