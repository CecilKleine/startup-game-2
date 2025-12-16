'use client';

import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { StatsPanel } from './StatsPanel';
import { GameEngine } from '../game/GameEngine';
import { GameMenu } from '../game/GameMenu';

interface DashboardProps {
  onNewGame?: () => void;
}

export function Dashboard({ onNewGame }: DashboardProps) {
  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 0 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          SaaSimulator
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <GameEngine />
          {onNewGame && <GameMenu onNewGame={onNewGame} />}
        </Box>
      </Box>
      <StatsPanel />
    </Paper>
  );
}
