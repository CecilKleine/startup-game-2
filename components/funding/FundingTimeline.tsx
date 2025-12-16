'use client';

import React from 'react';
import { Box, Typography, Chip, Paper } from '@mui/material';
import { useGameState } from '../game/GameStateProvider';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { formatCurrency, formatFundingRoundType } from '@/utils/formatting';

export function FundingTimeline() {
  const { gameState } = useGameState();
  const { rounds, activeRound } = gameState.funding;

  // Combine completed rounds with active round for timeline
  const allRounds = [...rounds];
  if (activeRound && !rounds.find(r => r.id === activeRound.id)) {
    allRounds.push(activeRound);
  }

  // Sort rounds by start time (newest first for timeline top-to-bottom)
  const sortedRounds = [...allRounds].sort((a, b) => b.startedAt - a.startedAt);

  if (sortedRounds.length === 0) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Funding History
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No funding rounds yet. Start a seed round to begin fundraising.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Funding History
      </Typography>
      <Box sx={{ position: 'relative' }}>
        {/* Timeline line */}
        <Box
          sx={{
            position: 'absolute',
            left: 16,
            top: 0,
            bottom: 0,
            width: 2,
            backgroundColor: 'divider',
            zIndex: 0,
          }}
        />
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'relative', zIndex: 1 }}>
          {sortedRounds.map((round) => {
            const isCompleted = round.status === 'completed';
            const isActive = round.status === 'inProgress';
            const isFailed = round.status === 'failed';
            
            // Get the accepted offer amount if completed
            const completedOffer = isCompleted && round.offers.length > 0 
              ? round.offers[round.offers.length - 1] 
              : null;
            
            return (
              <Box key={round.id} sx={{ display: 'flex', gap: 2 }}>
                {/* Timeline dot */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    minWidth: 32,
                    borderRadius: '50%',
                    backgroundColor: isCompleted 
                      ? 'success.main' 
                      : isFailed
                        ? 'error.main'
                        : isActive 
                          ? 'warning.main' 
                          : 'background.paper',
                    border: !isCompleted && !isFailed && !isActive ? '2px solid' : 'none',
                    borderColor: 'divider',
                    zIndex: 2,
                  }}
                >
                  {isCompleted ? (
                    <CheckCircleIcon sx={{ fontSize: 20, color: 'success.contrastText' }} />
                  ) : isFailed ? (
                    <CancelIcon sx={{ fontSize: 20, color: 'error.contrastText' }} />
                  ) : (
                    <HourglassEmptyIcon 
                      sx={{ 
                        fontSize: 20, 
                        color: isActive ? 'warning.contrastText' : 'text.disabled' 
                      }} 
                    />
                  )}
                </Box>
                
                {/* Round content */}
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    flex: 1, 
                    p: 2,
                    backgroundColor: isActive ? 'warning.dark' : 'background.paper',
                    transition: 'all 0.2s',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="subtitle2" 
                        fontWeight="bold"
                        sx={{ 
                          color: isCompleted ? 'success.main' : isFailed ? 'error.main' : 'text.primary',
                          mb: 0.5,
                        }}
                      >
                        {formatFundingRoundType(round.roundType)} Round
                      </Typography>
                      {completedOffer ? (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Raised {formatCurrency(completedOffer.amount)} at {formatCurrency(completedOffer.valuation)} valuation
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {isActive ? 'In progress - waiting for offers' : isFailed ? 'Round failed' : 'Round completed'}
                        </Typography>
                      )}
                    </Box>
                    <Chip 
                      label={round.status === 'inProgress' ? 'Active' : round.status === 'completed' ? 'Completed' : 'Failed'} 
                      size="small" 
                      color={isCompleted ? 'success' : isFailed ? 'error' : 'warning'}
                      variant={isActive ? 'filled' : 'outlined'}
                    />
                  </Box>
                  
                  {completedOffer && (
                    <Box sx={{ mt: 1.5 }}>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Amount
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {formatCurrency(completedOffer.amount)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Equity
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {(completedOffer.equityPercent).toFixed(1)}%
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {isCompleted && (
                    <Chip
                      label="Completed"
                      size="small"
                      color="success"
                      sx={{ mt: 1 }}
                    />
                  )}
                </Paper>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

