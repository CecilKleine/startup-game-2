'use client';

import React from 'react';
import { Paper, Typography, Box, Divider } from '@mui/material';
import { useGameState } from '../game/GameStateProvider';
import { formatCurrency, formatPercentage } from '@/utils/formatting';
import { ExpenseBreakdown } from './ExpenseBreakdown';
import { getProductTemplate } from '@/types/productTemplates';
import { getCategoryARPU, getMilestoneARPUMultiplier, getChurnRateByMilestone } from '@/lib/customerBenchmarks';

export function FinancePanel() {
  const { gameState } = useGameState();

  const StatCard = ({ label, value, color }: { label: string; value: string; color?: string }) => (
    <Paper elevation={2} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      <Typography 
        variant="h5" 
        sx={{ color: color || 'text.primary', fontWeight: 'bold' }}
      >
        {value}
      </Typography>
    </Paper>
  );

  // Calculate customer metrics
  const productTemplate = gameState.product.productTemplateId 
    ? getProductTemplate(gameState.product.productTemplateId)
    : null;
  const productCategory = productTemplate?.category || 'Productivity';
  
  const baseARPU = getCategoryARPU(productCategory);
  const arpuMultiplier = getMilestoneARPUMultiplier(gameState.product.currentMilestone);
  const currentARPU = baseARPU * arpuMultiplier;
  const churnRate = getChurnRateByMilestone(gameState.product.currentMilestone);
  
  const customerGrowth = gameState.customers.monthlyAcquisitions - gameState.customers.monthlyChurn;

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Financial Overview
      </Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        <StatCard label="Cash Balance" value={formatCurrency(gameState.money)} color="success.main" />
        <StatCard label="Monthly Revenue" value={formatCurrency(gameState.monthlyRevenue)} color="success.main" />
        <StatCard label="Monthly Expenses" value={formatCurrency(gameState.monthlyExpenses)} color="error.main" />
        <StatCard label="Burn Rate" value={formatCurrency(gameState.burnRate)} />
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Customer Metrics
      </Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        <StatCard label="Total Customers" value={gameState.customers.totalCustomers.toLocaleString()} color="info.main" />
        <StatCard 
          label="ARPU" 
          value={formatCurrency(currentARPU)} 
          color="primary.main"
        />
        <StatCard 
          label="Monthly Growth" 
          value={customerGrowth > 0 ? `+${customerGrowth}` : customerGrowth.toString()} 
          color={customerGrowth > 0 ? 'success.main' : 'error.main'}
        />
        <StatCard 
          label="Churn Rate" 
          value={formatPercentage(churnRate)} 
          color="warning.main"
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Customer Activity This Month
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Typography variant="body2">
            <strong>Acquisitions:</strong> {gameState.customers.monthlyAcquisitions}
          </Typography>
          <Typography variant="body2">
            <strong>Churned:</strong> {gameState.customers.monthlyChurn}
          </Typography>
        </Box>
      </Box>
      
      <ExpenseBreakdown />
    </Paper>
  );
}