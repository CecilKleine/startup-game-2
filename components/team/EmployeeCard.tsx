'use client';

import React from 'react';
import { Paper, Typography, Box, Chip, Button, Divider } from '@mui/material';
import { Employee } from '@/types/employee';
import { formatCurrency, formatPercentage } from '@/utils/formatting';
import { useGameState } from '../game/GameStateProvider';

interface EmployeeCardProps {
  employee: Employee;
  onFire: (id: string) => void;
}

const roleColors: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'default' | 'info'> = {
  engineer: 'primary',
  designer: 'secondary',
  sales: 'success',
  marketing: 'warning',
  operations: 'default',
  cto: 'info',
  cofounder: 'info',
};

export function EmployeeCard({ employee, onFire }: EmployeeCardProps) {
  const { gameState } = useGameState();
  
  const getRoleDisplayName = (): string => {
    if (employee.role === 'engineer' && employee.roleSubclass) {
      return employee.roleSubclass === 'frontend' ? 'Frontend Engineer' : 'Backend Engineer';
    }
    if (employee.role === 'designer' && employee.roleSubclass) {
      return employee.roleSubclass === 'product' ? 'Product Designer' : 'Visual Designer';
    }
    if (employee.role === 'cto' || employee.role === 'cofounder') {
      return employee.role.toUpperCase();
    }
    return employee.role.charAt(0).toUpperCase() + employee.role.slice(1);
  };

  const assignedFeature = employee.assignedFeatureId
    ? gameState.product.features.find(f => f.id === employee.assignedFeatureId)
    : null;

  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          {employee.name}
        </Typography>
        <Chip 
          label={getRoleDisplayName()} 
          size="small"
          color={roleColors[employee.role] || 'default'}
        />
      </Box>
      
      <Divider sx={{ my: 1 }} />
      
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary">Salary:</Typography>
          <Typography variant="body2" fontWeight="bold">
            {formatCurrency(employee.salary)}/mo
          </Typography>
        </Box>
        {employee.equityPercent && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">Equity:</Typography>
            <Typography variant="body2" fontWeight="bold" color="info.main">
              {employee.equityPercent}%
            </Typography>
          </Box>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary">Productivity:</Typography>
          <Typography variant="body2" fontWeight="bold">
            {formatPercentage(employee.productivity)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary">Experience:</Typography>
          <Chip label={employee.experienceLevel} size="small" variant="outlined" />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary">Status:</Typography>
          <Chip
            label={employee.onboardingComplete ? 'Productive' : 'Onboarding...'}
            size="small"
            color={employee.onboardingComplete ? 'success' : 'warning'}
            variant="outlined"
          />
        </Box>
        {assignedFeature ? (
          <Box sx={{ mt: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Assigned to:
            </Typography>
            <Typography variant="caption" fontWeight="bold">
              {assignedFeature.name}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ mt: 1 }}>
            <Chip label="Available" size="small" color="default" variant="outlined" />
          </Box>
        )}
      </Box>
      
      <Button
        variant="contained"
        color="error"
        fullWidth
        onClick={() => onFire(employee.id)}
        disabled={employee.role === 'cto' || employee.role === 'cofounder'}
      >
        {employee.role === 'cto' || employee.role === 'cofounder' ? 'Cannot Fire Co-Founder' : 'Fire Employee'}
      </Button>
    </Paper>
  );
}