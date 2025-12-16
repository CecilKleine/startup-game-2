'use client';

import React, { useState } from 'react';
import { 
  Paper, Typography, Box, Button, Chip, Divider, 
  Select, MenuItem, FormControl, InputLabel, LinearProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import { useGameState } from '../game/GameStateProvider';
import { formatCurrency, formatPercentage } from '@/utils/formatting';
import { AlertModal } from '../ui/AlertModal';
import { EmployeeRole, RoleSubclass } from '@/types/employee';

const HIRING_SEARCH_DURATION = 60; // 2 months = 60 days

export function HiringPanel() {
  const { gameState, hireEmployee, startHiringSearch, cancelHiringSearch } = useGameState();
  const { activeHiringSearches } = gameState.team;
  const [alert, setAlert] = useState<{ title: string; message: string } | null>(null);
  const [newSearchOpen, setNewSearchOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<EmployeeRole>('engineer');
  const [selectedSubclass, setSelectedSubclass] = useState<string>('');
  const [selectedRecruiter, setSelectedRecruiter] = useState<string>('founder');

  // Get available recruiters (founder/player and CTO)
  const availableRecruiters = [
    { id: 'founder', name: 'You (Founder)' },
    ...gameState.team.employees
      .filter(e => e.role === 'cto' || e.role === 'cofounder')
      .map(e => ({ id: e.id, name: e.name }))
  ];

  const handleStartSearch = () => {
    // Check if trying to hire CTO when one already exists
    if ((selectedRole === 'cto' || selectedRole === 'cofounder') && gameState.team.employees.some(e => e.role === 'cto' || e.role === 'cofounder')) {
      setAlert({
        title: 'Co-Founder Already Exists',
        message: 'You already have a co-founder/CTO. You can only have one.',
      });
      return;
    }

    if ((selectedRole === 'engineer' || selectedRole === 'designer') && !selectedSubclass) {
      setAlert({
        title: 'Subclass Required',
        message: 'Please select a subclass for engineers or designers.',
      });
      return;
    }

    const subclass = selectedSubclass ? (selectedSubclass as RoleSubclass) : undefined;
    const success = startHiringSearch(selectedRole, subclass, selectedRecruiter);
    
    if (success) {
      setNewSearchOpen(false);
      setSelectedRole('engineer');
      setSelectedSubclass('');
      setSelectedRecruiter('founder');
    } else {
      setAlert({
        title: 'Failed to Start Search',
        message: 'Recruiter may be too busy (max 2 active searches) or invalid selection.',
      });
    }
  };

  const handleHire = (candidateId: string, searchId: string) => {
    const search = activeHiringSearches.find(s => s.id === searchId);
    const candidate = search?.candidates.find(c => c.id === candidateId);
    if (!candidate) return;
    
    // Co-founders don't have hiring costs (they invest equity instead)
    const isCofounder = candidate.role === 'cto' || candidate.role === 'cofounder';
    
    if (!isCofounder) {
      // Check office capacity for regular employees
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
    }
    
    const success = hireEmployee(candidateId, searchId);
    if (!success) {
      if (isCofounder) {
        setAlert({
          title: 'Hiring Failed',
          message: 'Unable to hire co-founder. You may already have one or not have enough equity available.',
        });
      } else {
        setAlert({
          title: 'Hiring Failed',
          message: 'Unable to hire this candidate. Check office capacity or funds.',
        });
      }
    }
  };

  const handleCancelSearch = (searchId: string) => {
    cancelHiringSearch(searchId);
  };

  const getRoleDisplayName = (role: EmployeeRole, subclass?: RoleSubclass): string => {
    if (role === 'cto' || role === 'cofounder') {
      return 'Co-Founder/CTO';
    }
    if (role === 'engineer' && subclass) {
      return subclass === 'frontend' ? 'Frontend Engineer' : 'Backend Engineer';
    }
    if (role === 'designer' && subclass) {
      return subclass === 'product' ? 'Product Designer' : 'Visual Designer';
    }
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const getRecruiterName = (recruiterId: string): string => {
    if (recruiterId === 'founder') return 'You (Founder)';
    const recruiter = gameState.team.employees.find(e => e.id === recruiterId);
    return recruiter?.name || 'Unknown';
  };

  return (
    <>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Active Hiring Searches
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => setNewSearchOpen(true)}
            disabled={availableRecruiters.length === 0}
          >
            Start New Search
          </Button>
        </Box>

        {activeHiringSearches.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No active hiring searches. Start a new search to begin recruiting.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {activeHiringSearches
              .filter(s => s.status === 'active')
              .map((search) => {
                const daysElapsed = gameState.currentTime - search.startedAt;
                const daysRemaining = Math.max(0, HIRING_SEARCH_DURATION - daysElapsed);
                const progress = Math.min(100, (daysElapsed / HIRING_SEARCH_DURATION) * 100);

                return (
                  <Paper key={search.id} variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {getRoleDisplayName(search.role, search.roleSubclass)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Recruiter: {getRecruiterName(search.recruiterId)}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleCancelSearch(search.id)}
                      >
                        Cancel
                      </Button>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Progress: {Math.round(progress)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {Math.ceil(daysRemaining)} days remaining
                        </Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 1 }} />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Candidates Found: {search.candidates.length}
                    </Typography>

                    {search.candidates.length > 0 ? (
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mt: 2 }}>
                        {search.candidates.map((candidate) => {
                          const hiringCost = 3000 + candidate.expectedSalary;
                          const canAfford = gameState.money >= hiringCost;
                          
                          return (
                            <Paper key={candidate.id} variant="outlined" sx={{ p: 1.5 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="body2" fontWeight="bold">
                                  {candidate.name}
                                </Typography>
                                <Chip 
                                  label={candidate.experienceLevel} 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined"
                                />
                              </Box>
                              
                              <Box sx={{ mb: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="caption" color="text.secondary">Salary:</Typography>
                                  <Typography variant="caption" fontWeight="bold">
                                    {formatCurrency(candidate.expectedSalary)}/mo
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="caption" color="text.secondary">Productivity:</Typography>
                                  <Typography variant="caption" fontWeight="bold">
                                    {formatPercentage(candidate.productivity)}
                                  </Typography>
                                </Box>
                                {(candidate.role === 'cto' || candidate.role === 'cofounder') && (
                                  <Box sx={{ mb: 0.5 }}>
                                    <Typography variant="caption" color="info.main" sx={{ fontStyle: 'italic' }}>
                                      Will receive equity (varies by join date)
                                    </Typography>
                                  </Box>
                                )}
                                <Divider sx={{ my: 0.5 }} />
                                {(candidate.role !== 'cto' && candidate.role !== 'cofounder') && (
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="caption" color="text.secondary">Cost:</Typography>
                                    <Typography variant="caption" fontWeight="bold">
                                      {formatCurrency(hiringCost)}
                                    </Typography>
                                  </Box>
                                )}
                                {(candidate.role === 'cto' || candidate.role === 'cofounder') && (
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="caption" color="text.secondary">Cost:</Typography>
                                    <Typography variant="caption" fontWeight="bold" color="info.main">
                                      Equity Only
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                              
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                fullWidth
                                onClick={() => handleHire(candidate.id, search.id)}
                                disabled={
                                  (candidate.role !== 'cto' && candidate.role !== 'cofounder') &&
                                  (!canAfford || gameState.team.employees.length >= gameState.offices.totalCapacity)
                                }
                              >
                                {(candidate.role === 'cto' || candidate.role === 'cofounder')
                                  ? 'Hire as Co-Founder'
                                  : gameState.team.employees.length >= gameState.offices.totalCapacity 
                                    ? 'Office Full' 
                                    : canAfford 
                                      ? 'Hire' 
                                      : 'Insufficient Funds'}
                              </Button>
                            </Paper>
                          );
                        })}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Candidates will appear as the search progresses...
                      </Typography>
                    )}
                  </Paper>
                );
              })}
          </Box>
        )}
      </Paper>

      {/* New Search Dialog */}
      <Dialog open={newSearchOpen} onClose={() => setNewSearchOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Start New Hiring Search</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={selectedRole}
                label="Role"
                onChange={(e) => {
                  setSelectedRole(e.target.value as EmployeeRole);
                  setSelectedSubclass(''); // Reset subclass when role changes
                }}
              >
                <MenuItem value="cto">Co-Founder/CTO</MenuItem>
                <MenuItem value="engineer">Engineer</MenuItem>
                <MenuItem value="designer">Designer</MenuItem>
                <MenuItem value="sales">Sales</MenuItem>
                <MenuItem value="marketing">Marketing</MenuItem>
                <MenuItem value="operations">Operations</MenuItem>
              </Select>
            </FormControl>

            {selectedRole === 'engineer' && (
              <FormControl fullWidth required>
                <InputLabel>Subclass</InputLabel>
                <Select
                  value={selectedSubclass}
                  label="Subclass"
                  onChange={(e) => {
                    setSelectedSubclass(e.target.value);
                  }}
                >
                  <MenuItem value="frontend">Frontend</MenuItem>
                  <MenuItem value="backend">Backend</MenuItem>
                </Select>
              </FormControl>
            )}
            {selectedRole === 'designer' && (
              <FormControl fullWidth required>
                <InputLabel>Subclass</InputLabel>
                <Select
                  value={selectedSubclass}
                  label="Subclass"
                  onChange={(e) => {
                    setSelectedSubclass(e.target.value);
                  }}
                >
                  <MenuItem value="product">Product Designer</MenuItem>
                  <MenuItem value="visual">Visual Designer</MenuItem>
                </Select>
              </FormControl>
            )}

            <FormControl fullWidth>
              <InputLabel>Recruiter</InputLabel>
              <Select
                value={selectedRecruiter}
                label="Recruiter"
                onChange={(e) => setSelectedRecruiter(e.target.value)}
              >
                {availableRecruiters.map(recruiter => (
                  <MenuItem key={recruiter.id} value={recruiter.id}>
                    {recruiter.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="body2" color="text.secondary">
              The search will take 2 months (60 days). Candidates will trickle in over time (1-2 per week).
              {(selectedRole === 'cto' || selectedRole === 'cofounder') && (
                <Box component="span" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
                  Co-founder candidates will receive equity based on when they join (no cash cost).
                </Box>
              )}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewSearchOpen(false)}>Cancel</Button>
          <Button onClick={handleStartSearch} variant="contained">Start Search</Button>
        </DialogActions>
      </Dialog>

      <AlertModal
        isOpen={!!alert}
        title={alert?.title || ''}
        message={alert?.message || ''}
        onClose={() => setAlert(null)}
      />
    </>
  );
}
