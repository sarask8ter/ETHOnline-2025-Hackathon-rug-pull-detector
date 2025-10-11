import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  Typography,
  Box
} from '@mui/material';

const TokenList = ({ tokens }) => {
  const getRiskColor = (score) => {
    if (score >= 70) return '#f44336';
    if (score >= 40) return '#ff9800';
    return '#4caf50';
  };

  const getRiskLabel = (score) => {
    if (score >= 70) return 'HIGH RISK';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (tokens.length === 0) {
    return (
      <Typography sx={{ color: '#666', textAlign: 'center', py: 4 }}>
        No tokens detected yet. Monitoring blockchain for new deployments...
      </Typography>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: '#00e676', fontWeight: 'bold' }}>Token</TableCell>
            <TableCell sx={{ color: '#00e676', fontWeight: 'bold' }}>Address</TableCell>
            <TableCell sx={{ color: '#00e676', fontWeight: 'bold' }}>Risk Score</TableCell>
            <TableCell sx={{ color: '#00e676', fontWeight: 'bold' }}>Time</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tokens.map((token, index) => (
            <TableRow key={token.address || index}>
              <TableCell>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {token.name || 'Unknown'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {token.symbol || 'N/A'}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {formatAddress(token.address)}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={`${token.riskScore?.score || 0}% ${getRiskLabel(token.riskScore?.score || 0)}`}
                  size="small"
                  sx={{
                    backgroundColor: getRiskColor(token.riskScore?.score || 0),
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  {formatTime(token.timestamp)}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TokenList;