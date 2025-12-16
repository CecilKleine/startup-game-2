'use client';

import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export type PanelType = 'finance' | 'product' | 'team' | 'funding' | 'offices';

interface PanelCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  onClick: () => void;
}

export function PanelCard({ title, description, icon, badge, badgeColor, onClick }: PanelCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
          borderColor: 'primary.main',
        },
        border: 1,
        borderColor: 'divider',
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          {icon && (
            <Box sx={{ color: 'primary.main', mb: 1 }}>
              {icon}
            </Box>
          )}
          {badge && (
            <Chip label={badge} color={badgeColor || 'primary'} size="small" />
          )}
        </Box>
        
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1, mb: 2 }}>
          {description}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', color: 'primary.main', mt: 'auto' }}>
          <Typography variant="caption" fontWeight="medium">
            View Details
          </Typography>
          <ArrowForwardIcon sx={{ ml: 0.5, fontSize: '1rem' }} />
        </Box>
      </CardContent>
    </Card>
  );
}

