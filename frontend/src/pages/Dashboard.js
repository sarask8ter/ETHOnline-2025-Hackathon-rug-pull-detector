import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import TokenList from '../components/TokenList';
import RiskChart from '../components/RiskChart';
import MetricsCard from '../components/MetricsCard';
import { Security, Warning, TrendingUp, Timeline } from '@mui/icons-material';

const Dashboard = ({ tokens, alerts }) => {
  const highRiskTokens = tokens.filter(t => t.riskScore?.score >= 70);
  const mediumRiskTokens = tokens.filter(t => t.riskScore?.score >= 40 && t.riskScore?.score < 70);
  const lowRiskTokens = tokens.filter(t => t.riskScore?.score < 40);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, color: '#00e676' }}>
        Real-Time Token Monitoring Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Tokens Monitored"
            value={tokens.length}
            icon={<Timeline />}
            color="#00e676"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="High Risk"
            value={highRiskTokens.length}
            icon={<Warning />}
            color="#f44336"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Medium Risk"
            value={mediumRiskTokens.length}
            icon={<Security />}
            color="#ff9800"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Low Risk"
            value={lowRiskTokens.length}
            icon={<TrendingUp />}
            color="#4caf50"
          />
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a' }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#00e676' }}>
              Recent Token Detections
            </Typography>
            <TokenList tokens={tokens.slice(0, 10)} />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a' }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#00e676' }}>
              Risk Distribution
            </Typography>
            <RiskChart 
              highRisk={highRiskTokens.length}
              mediumRisk={mediumRiskTokens.length}
              lowRisk={lowRiskTokens.length}
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a' }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#ff5722' }}>
              🚨 Recent High-Risk Alerts
            </Typography>
            {alerts.length > 0 ? (
              <TokenList tokens={alerts.slice(0, 5)} />
            ) : (
              <Typography sx={{ color: '#666', fontStyle: 'italic' }}>
                No high-risk tokens detected recently
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;