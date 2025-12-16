'use client';

import React, { useState } from 'react';
import { Paper, Typography, Box, Button, Chip, Card, CardContent, LinearProgress } from '@mui/material';
import { useGameState } from '../game/GameStateProvider';
import { formatCurrency } from '@/utils/formatting';
import { OFFICE_TIERS, OfficeTier } from '@/types/office';
import { AlertModal } from '../ui/AlertModal';

export function OfficesPanel() {
  const { gameState, purchaseOffice } = useGameState();
  const { offices, team } = gameState;
  const [alert, setAlert] = useState<{ title: string; message: string } | null>(null);

  const currentEmployees = team.employees.length;
  const capacityUsed = currentEmployees;
  const capacityPercent = offices.totalCapacity > 0 ? (capacityUsed / offices.totalCapacity) * 100 : 0;

  const handlePurchaseOffice = (tier: OfficeTier) => {
    const officeTier = OFFICE_TIERS[tier];
    const cost = officeTier.monthlyCost * 3; // 3 months upfront
    
    if (gameState.money < cost) {
      setAlert({
        title: 'Insufficient Funds',
        message: `You need ${formatCurrency(cost)} to purchase this office (3 months upfront).`,
      });
      return;
    }
    
    if (purchaseOffice(tier)) {
      setAlert({
        title: 'Office Purchased',
        message: `Successfully purchased ${officeTier.name}! Capacity increased by ${officeTier.capacity} employees.`,
      });
    } else {
      setAlert({
        title: 'Purchase Failed',
        message: 'Unable to purchase office. Please check your funds.',
      });
    }
  };

  return (
    <>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Offices & Workspace
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body1" fontWeight="medium">
              Total Capacity
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {capacityUsed} / {offices.totalCapacity} employees
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={capacityPercent} 
            sx={{ 
              height: 24, 
              borderRadius: 1,
              backgroundColor: capacityPercent >= 90 ? 'error.dark' : capacityPercent >= 75 ? 'warning.dark' : 'primary.dark',
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Monthly Office Cost: {formatCurrency(offices.totalMonthlyCost)}
            </Typography>
            <Typography variant="caption" color={capacityPercent >= 90 ? 'error.main' : capacityPercent >= 75 ? 'warning.main' : 'text.secondary'}>
              {offices.totalCapacity - capacityUsed} spots available
            </Typography>
          </Box>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
          Your Offices
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
          {offices.offices.map((office) => (
            <Box key={office.id}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {office.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {office.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">Capacity:</Typography>
                    <Typography variant="caption" fontWeight="bold">{office.capacity} employees</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">Monthly Cost:</Typography>
                    <Typography variant="caption" fontWeight="bold">{formatCurrency(office.monthlyCost)}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
          Purchase New Office
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
          {(Object.keys(OFFICE_TIERS) as OfficeTier[]).map((tier) => {
            const officeTier = OFFICE_TIERS[tier];
            const cost = officeTier.monthlyCost * 3;
            const canAfford = gameState.money >= cost;
            
            return (
              <Box key={tier}>
                <Card 
                  variant="outlined"
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    opacity: canAfford ? 1 : 0.6,
                  }}
                >
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" gutterBottom>
                      {officeTier.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                      {officeTier.description}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Capacity:</Typography>
                        <Typography variant="body2" fontWeight="bold">+{officeTier.capacity}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Monthly Cost:</Typography>
                        <Typography variant="body2" fontWeight="bold">{formatCurrency(officeTier.monthlyCost)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Purchase Cost:</Typography>
                        <Typography variant="body2" fontWeight="bold" color="primary.main">
                          {formatCurrency(cost)}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        (3 months upfront)
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handlePurchaseOffice(tier)}
                      disabled={!canAfford}
                      color={canAfford ? 'primary' : 'inherit'}
                    >
                      {canAfford ? 'Purchase Office' : 'Insufficient Funds'}
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            );
          })}
        </Box>
      </Paper>

      <AlertModal
        isOpen={!!alert}
        title={alert?.title || ''}
        message={alert?.message || ''}
        onClose={() => setAlert(null)}
      />
    </>
  );
}

