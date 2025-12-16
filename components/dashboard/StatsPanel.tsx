'use client';

import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useGameState } from '../game/GameStateProvider';
import { formatCurrency, formatRunway, formatDate } from '@/utils/formatting';
import { WeekCounter } from './WeekCounter';
import { calculateCompanyValuation } from '@/lib/calculations';

export function StatsPanel() {
  const { gameState } = useGameState();
  
  const runwayColor = gameState.runway > 6 ? 'success.main' : gameState.runway > 3 ? 'warning.main' : 'error.main';
  
  // Calculate company valuation
  const valuation = calculateCompanyValuation(
    gameState.money,
    gameState.burnRate,
    gameState.monthlyRevenue,
    gameState.revenueHistory
  );

  const StatCard = ({ label, value, color, children }: { label: string; value: string; color?: string; children?: React.ReactNode }) => (
    <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      <Typography variant="h6" sx={{ color: color || 'text.primary', fontWeight: 'bold' }}>
        {value}
      </Typography>
      {children}
    </Paper>
  );

      return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          <StatCard label="Date" value={formatDate(gameState.startDate, gameState.currentTime)}>
            <WeekCounter startDateISO={gameState.startDate} daysElapsed={gameState.currentTime} />
          </StatCard>
          <StatCard label="Cash" value={formatCurrency(gameState.money)} color="success.main">
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Valuation: {formatCurrency(valuation)}
            </Typography>
          </StatCard>
          <StatCard label="Runway" value={formatRunway(gameState.runway)} color={runwayColor} />
          <StatCard label="Customers" value={gameState.customers.totalCustomers.toLocaleString()} color="info.main" />
          <StatCard label="Monthly Revenue" value={formatCurrency(gameState.monthlyRevenue)} color="success.main" />
          <StatCard label="Burn Rate" value={formatCurrency(gameState.burnRate)} />
        </Box>
      );
}