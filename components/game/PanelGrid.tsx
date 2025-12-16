'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { PanelCard, PanelType } from './PanelCard';

export type { PanelType };
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BuildIcon from '@mui/icons-material/Build';
import GroupIcon from '@mui/icons-material/Group';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BusinessIcon from '@mui/icons-material/Business';
import { useGameState } from './GameStateProvider';

interface PanelGridProps {
  onPanelClick: (panelType: PanelType) => void;
}

export function PanelGrid({ onPanelClick }: PanelGridProps) {
  const { gameState } = useGameState();

  const panels = [
    {
      type: 'finance' as PanelType,
      title: 'Finance',
      description: 'Manage your cash flow, expenses, and financial health',
      icon: <AccountBalanceIcon sx={{ fontSize: 32 }} />,
      badge: `$${Math.round(gameState.money / 1000)}k`,
      badgeColor: 'success' as const,
    },
    {
      type: 'product' as PanelType,
      title: 'Product',
      description: 'Track development progress and manage your product roadmap',
      icon: <BuildIcon sx={{ fontSize: 32 }} />,
      badge: `${Math.round(gameState.product.overallProgress)}%`,
      badgeColor: 'primary' as const,
    },
    {
      type: 'team' as PanelType,
      title: 'Team',
      description: 'Hire employees and manage your team',
      icon: <GroupIcon sx={{ fontSize: 32 }} />,
      badge: `${gameState.team.employees.length} members`,
      badgeColor: 'info' as const,
    },
    {
      type: 'funding' as PanelType,
      title: 'Funding',
      description: 'Raise capital and manage investor relations',
      icon: <TrendingUpIcon sx={{ fontSize: 32 }} />,
      badge: `${gameState.funding.totalRaised > 0 ? `$${Math.round(gameState.funding.totalRaised / 1000)}k` : 'No funding'}`,
      badgeColor: 'warning' as const,
    },
    {
      type: 'offices' as PanelType,
      title: 'Offices',
      description: 'Manage office space and capacity',
      icon: <BusinessIcon sx={{ fontSize: 32 }} />,
      badge: `${gameState.team.employees.length}/${gameState.offices.totalCapacity}`,
      badgeColor: gameState.team.employees.length >= gameState.offices.totalCapacity ? 'error' as const : 'secondary' as const,
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(5, 1fr)',
        },
        gap: 3,
        mt: 2,
      }}
    >
      {panels.map((panel) => (
        <PanelCard
          key={panel.type}
          title={panel.title}
          description={panel.description}
          icon={panel.icon}
          badge={panel.badge}
          badgeColor={panel.badgeColor}
          onClick={() => onPanelClick(panel.type)}
        />
      ))}
    </Box>
  );
}

