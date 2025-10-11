import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, Tab, Box } from '@mui/material';
import { Dashboard, Security, Warning } from '@mui/icons-material';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (event, newValue) => {
    navigate(newValue);
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: '#1a1a1a' }}>
      <Tabs 
        value={location.pathname} 
        onChange={handleChange}
        sx={{
          '& .MuiTab-root': {
            color: '#666',
            '&.Mui-selected': {
              color: '#00e676'
            }
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#00e676'
          }
        }}
      >
        <Tab 
          icon={<Dashboard />} 
          label="Dashboard" 
          value="/" 
          iconPosition="start"
        />
        <Tab 
          icon={<Warning />} 
          label="Alerts" 
          value="/alerts" 
          iconPosition="start"
        />
      </Tabs>
    </Box>
  );
};

export default Navigation;