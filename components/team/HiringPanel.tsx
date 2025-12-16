'use client';

import React, { useState } from 'react';
import { Paper, Typography, Box, Button, Chip, Divider } from '@mui/material';
import { useGameState } from '../game/GameStateProvider';
import { formatCurrency, formatPercentage } from '@/utils/formatting';
import { AlertModal } from '../ui/AlertModal';

export function HiringPanel() {
  const { gameState, hireEmployee } = useGameState();
  const { candidatePool } = gameState.team;
  const [alert, setAlert] = useState<{ title: string; message: string } | null>(null);

  const handleHire = (candidateId: string) => {
    const candidate = candidatePool.find(c => c.id === candidateId);
    if (!candidate) return;
    
    // Check office capacity
    if (gameState.team.employees.length >= gameState.offices.totalCapacity) {
      setAlert({
        title: 'No Office Space',
        message: `You've reached your office capacity of ${gameState.offices.totalCapacity} employees. Purchase more office space to hire more people.`,
      });
      return;
    }
    
    const hiringCost = 3000 + candidate.expectedSalary;
    if (gameState.money < hiringCost) {
      setAlert({
        title: 'Insufficient Funds',
        message: 'Not enough money to hire this candidate!',
      });
      return;
    }
    
    const success = hireEmployee(candidateId);
    if (!success) {
      setAlert({
        title: 'Hiring Failed',
        message: 'Unable to hire this candidate. Check office capacity or funds.',
      });
    }
  };

  if (candidatePool.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">No Available Candidates</Typography>
        <Typography variant="body2" color="text.secondary">
          Candidates will refresh periodically.
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Available Candidates
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          {candidatePool.map((candidate) => {
            const hiringCost = 3000 + candidate.expectedSalary;
            const canAfford = gameState.money >= hiringCost;
            
            return (
              <Box key={candidate.id}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {candidate.name}
                    </Typography>
                    <Chip 
                      label={candidate.experienceLevel} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">Role:</Typography>
                      <Typography variant="body2" fontWeight="bold">{candidate.role}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">Expected Salary:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(candidate.expectedSalary)}/mo
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">Productivity:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {formatPercentage(candidate.productivity)}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Hiring Cost:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(hiringCost)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    onClick={() => handleHire(candidate.id)}
                    disabled={!canAfford || gameState.team.employees.length >= gameState.offices.totalCapacity}
                  >
                    {gameState.team.employees.length >= gameState.offices.totalCapacity 
                      ? 'Office Full' 
                      : canAfford 
                        ? 'Hire' 
                        : 'Insufficient Funds'}
                  </Button>
                </Paper>
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