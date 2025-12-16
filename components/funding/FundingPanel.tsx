'use client';

import React, { useState } from 'react';
import { Paper, Typography, Box, Button, Chip, Divider } from '@mui/material';
import { useGameState } from '../game/GameStateProvider';
import { InvestorRelations } from './InvestorRelations';
import { FundingTimeline } from './FundingTimeline';
import { formatCurrency, formatPercentage, formatFundingRoundType } from '@/utils/formatting';
import { FundingOffer, FundingRoundType } from '@/types/funding';
import { AlertModal } from '../ui/AlertModal';
import { getRevenueRequirement } from '@/lib/fundingSystem';

export function FundingPanel() {
  const { gameState, startFundraising, acceptFundingOffer } = useGameState();
  const { funding } = gameState;
  const { activeRound, totalEquity, totalRaised } = funding;
  const [alert, setAlert] = useState<{ title: string; message: string } | null>(null);

  const investorInterest = activeRound?.investorInterest || 0;

  const handleStartFundraising = (roundType: FundingRoundType) => {
    if (activeRound) {
      setAlert({
        title: 'Active Round',
        message: 'You already have an active funding round!',
      });
      return;
    }
    
    // Check revenue requirements
    const revenueReq = getRevenueRequirement(roundType);
    if (revenueReq > 0 && gameState.monthlyRevenue < revenueReq) {
      setAlert({
        title: 'Revenue Requirement Not Met',
        message: `You need at least ${formatCurrency(revenueReq)}/month revenue to raise a ${formatFundingRoundType(roundType)} round. Your current revenue is ${formatCurrency(gameState.monthlyRevenue)}/month.`,
      });
      return;
    }
    
    // Check if previous rounds are completed
    const completedRounds = funding.rounds.filter(r => r.status === 'completed');
    const roundOrder: FundingRoundType[] = ['seed', 'seriesA', 'seriesB', 'seriesC', 'seriesD'];
    const roundIndex = roundOrder.indexOf(roundType);
    
    if (roundIndex > 0 && completedRounds.length === 0) {
      setAlert({
        title: 'Previous Round Required',
        message: `You must complete a Seed round before raising ${formatFundingRoundType(roundType)}.`,
      });
      return;
    }
    
    if (completedRounds.length > 0) {
      const lastRound = completedRounds[completedRounds.length - 1];
      const lastRoundIndex = roundOrder.indexOf(lastRound.roundType);
      if (roundIndex > lastRoundIndex + 1) {
        setAlert({
          title: 'Cannot Skip Rounds',
          message: `You must complete ${formatFundingRoundType(roundOrder[roundIndex - 1])} before raising ${formatFundingRoundType(roundType)}.`,
        });
        return;
      }
    }
    
    const success = startFundraising(roundType);
    if (!success) {
      setAlert({
        title: 'Fundraising Failed',
        message: 'Unable to start fundraising round. Check revenue requirements and previous rounds.',
      });
    }
  };

  const handleAcceptOffer = (offerId: string) => {
    if (acceptFundingOffer(offerId)) {
      setAlert({
        title: 'Funding Accepted',
        message: 'Funding accepted! Cash added to your balance.',
      });
    }
  };

  return (
    <>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Funding & Investors
        </Typography>
        
        <InvestorRelations
          investorInterest={investorInterest}
          totalEquity={totalEquity}
          totalRaised={totalRaised}
        />
        
        {(funding.rounds.length > 0 || activeRound) && (
          <>
            <Divider sx={{ my: 3 }} />
            <FundingTimeline />
          </>
        )}
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Start Fundraising
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {(['seed', 'seriesA', 'seriesB', 'seriesC', 'seriesD'] as FundingRoundType[]).map((roundType) => {
              const revenueReq = getRevenueRequirement(roundType);
              const canAfford = revenueReq === 0 || gameState.monthlyRevenue >= revenueReq;
              
              // Check if previous rounds are completed
              const completedRounds = funding.rounds.filter(r => r.status === 'completed');
              const roundOrder: FundingRoundType[] = ['seed', 'seriesA', 'seriesB', 'seriesC', 'seriesD'];
              const roundIndex = roundOrder.indexOf(roundType);
              
              let disabled = !!activeRound;
              let disabledReason = '';
              
              if (roundIndex > 0 && completedRounds.length === 0) {
                disabled = true;
                disabledReason = 'Complete Seed round first';
              } else if (completedRounds.length > 0) {
                const lastRound = completedRounds[completedRounds.length - 1];
                const lastRoundIndex = roundOrder.indexOf(lastRound.roundType);
                if (roundIndex > lastRoundIndex + 1) {
                  disabled = true;
                  disabledReason = `Complete ${formatFundingRoundType(roundOrder[roundIndex - 1])} first`;
                }
              }
              
              if (!canAfford && !disabled) {
                disabled = true;
                disabledReason = `Need ${formatCurrency(revenueReq)}/mo revenue`;
              }
              
              return (
                <Button
                  key={roundType}
                  onClick={() => handleStartFundraising(roundType)}
                  disabled={disabled}
                  variant="outlined"
                  sx={{ justifyContent: 'flex-start' }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Typography>
                      Start {formatFundingRoundType(roundType)} Round
                      {revenueReq > 0 && (
                        <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                          (Requires {formatCurrency(revenueReq)}/mo)
                        </Typography>
                      )}
                    </Typography>
                    {disabled && disabledReason && (
                      <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                        {disabledReason}
                      </Typography>
                    )}
                  </Box>
                </Button>
              );
            })}
          </Box>
        </Box>
        
        {activeRound && (
          <Box sx={{ mb: 3 }}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Active Funding Round: {formatFundingRoundType(activeRound.roundType)}
              </Typography>
              <Chip 
                label={activeRound.status} 
                color={activeRound.status === 'completed' ? 'success' : 'primary'}
                variant="outlined"
              />
            </Box>
            
            {activeRound.offers.length > 0 ? (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Funding Offers
                </Typography>
                {activeRound.offers.map((offer: FundingOffer) => (
                  <Paper key={offer.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        {formatCurrency(offer.amount)} Investment
                      </Typography>
                      <Chip
                        label={`${formatPercentage(offer.equityPercent / 100)} Equity`}
                        color="secondary"
                        variant="outlined"
                      />
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Valuation:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(offer.valuation)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Equity:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatPercentage(offer.equityPercent / 100)}
                        </Typography>
                      </Box>
                      {offer.requirements && offer.requirements.length > 0 && (
                        <Box sx={{ mt: 1.5, pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            Requirements:
                          </Typography>
                          {offer.requirements.map((req, idx) => (
                            <Chip
                              key={idx}
                              label={req}
                              size="small"
                              color="warning"
                              variant="outlined"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                    
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      onClick={() => handleAcceptOffer(offer.id)}
                    >
                      Accept Offer
                    </Button>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Waiting for investor offers... (Check back in a month)
              </Typography>
            )}
          </Box>
        )}
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