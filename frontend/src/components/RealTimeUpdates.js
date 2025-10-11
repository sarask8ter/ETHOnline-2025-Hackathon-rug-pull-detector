import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, Box, Typography } from '@mui/material';

const RealTimeUpdates = ({ socket }) => {
  const [notification, setNotification] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    if (!socket) return;

    socket.on('connect', () => {
      setConnectionStatus('connected');
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    socket.on('tokenUpdate', (tokenData) => {
      if (tokenData.riskScore?.score >= 70) {
        setNotification({
          type: 'error',
          message: `🚨 High risk token detected: ${tokenData.name} (${tokenData.riskScore.score}% risk)`
        });
      } else {
        setNotification({
          type: 'info',
          message: `New token detected: ${tokenData.name} (${tokenData.riskScore?.score || 0}% risk)`
        });
      }
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('tokenUpdate');
    };
  }, [socket]);

  const handleClose = () => {
    setNotification(null);
  };

  return (
    <>
      <Box 
        sx={{ 
          position: 'fixed', 
          top: 70, 
          right: 20, 
          zIndex: 1000,
          backgroundColor: connectionStatus === 'connected' ? '#4caf50' : '#f44336',
          color: 'white',
          px: 2,
          py: 1,
          borderRadius: 1,
          fontSize: '0.8rem'
        }}
      >
        <Typography variant="caption">
          {connectionStatus === 'connected' ? '🟢 Live' : '🔴 Offline'}
        </Typography>
      </Box>

      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 8 }}
      >
        {notification && (
          <Alert 
            onClose={handleClose} 
            severity={notification.type}
            sx={{ 
              backgroundColor: notification.type === 'error' ? '#f44336' : '#00e676',
              color: 'white'
            }}
          >
            {notification.message}
          </Alert>
        )}
      </Snackbar>
    </>
  );
};

export default RealTimeUpdates;