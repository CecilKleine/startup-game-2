'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { getCurrentGameDate } from '@/utils/dateUtils';

interface WeekCounterProps {
  startDateISO: string;
  daysElapsed: number;
}

export function WeekCounter({ startDateISO, daysElapsed }: WeekCounterProps) {
  const currentDate = getCurrentGameDate(startDateISO, daysElapsed);
  
  // Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayOfWeek = currentDate.getDay();
  // Convert to Monday = 0, Tuesday = 1, ..., Sunday = 6
  const mondayBasedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  // Day names starting with Monday
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const currentDayName = dayNames[mondayBasedDay];

  return (
    <Box sx={{ mt: 1.5 }}>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
        Week Progress
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
        {dayNames.map((day, index) => {
          const isActive = index === mondayBasedDay;
          const isPast = index < mondayBasedDay;
          
          return (
            <Box
              key={day}
              sx={{
                flex: 1,
                height: 8,
                borderRadius: 1,
                backgroundColor: isActive 
                  ? 'primary.main' 
                  : isPast 
                    ? 'primary.dark' 
                    : 'divider',
                transition: 'background-color 0.2s',
                border: '1px solid',
                borderColor: isActive 
                  ? 'primary.main' 
                  : isPast 
                    ? 'primary.dark' 
                    : 'divider',
              }}
              title={`${day}${isActive ? ' (Today)' : ''}`}
            />
          );
        })}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: 'center' }}>
        {currentDayName}
      </Typography>
    </Box>
  );
}

