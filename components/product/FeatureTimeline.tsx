'use client';

import React from 'react';
import { Box, Typography, LinearProgress, Chip, Paper, Button, ButtonGroup, IconButton, Tooltip } from '@mui/material';
import { useGameState } from '../game/GameStateProvider';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

export function FeatureTimeline() {
  const { gameState, prioritizeFeature } = useGameState();
  const { features } = gameState.product;

  const sortedFeatures = [...features].sort((a, b) => a.priority - b.priority);

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Feature Roadmap
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
          {sortedFeatures.map((feature, index) => {
            const isComplete = feature.progress >= 100;
            const isActive = feature.progress > 0 && feature.progress < 100;
            
            return (
              <Box key={feature.id} sx={{ display: 'flex', gap: 2 }}>
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
                    backgroundColor: isComplete 
                      ? 'success.main' 
                      : isActive 
                        ? 'primary.main' 
                        : 'background.paper',
                    border: isComplete || isActive ? 'none' : '2px solid',
                    borderColor: 'divider',
                    zIndex: 2,
                  }}
                >
                  {isComplete ? (
                    <CheckCircleIcon sx={{ fontSize: 20, color: 'success.contrastText' }} />
                  ) : (
                    <RadioButtonUncheckedIcon 
                      sx={{ 
                        fontSize: 20, 
                        color: isActive ? 'primary.contrastText' : 'text.disabled' 
                      }} 
                    />
                  )}
                </Box>
                
                {/* Feature content */}
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    flex: 1, 
                    p: 2,
                    backgroundColor: isActive ? 'primary.dark' : 'background.paper',
                    transition: 'all 0.2s',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="subtitle2" 
                        fontWeight="bold"
                        sx={{ 
                          color: isComplete ? 'success.main' : 'text.primary',
                          mb: 0.5,
                        }}
                      >
                        {feature.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {feature.description}
                      </Typography>
                    </Box>
                    <Chip 
                      label={`Priority ${feature.priority}`} 
                      size="small" 
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  
                  {(isActive || !isComplete) && (
                    <Box sx={{ mt: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Overall Progress
                        </Typography>
                        <Typography variant="caption" fontWeight="bold">
                          {Math.round(feature.progress)}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={feature.progress} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 1,
                          backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        }}
                      />
                    </Box>
                  )}
                  
                  {/* Components list */}
                  {feature.components && feature.components.length > 0 && (
                    <Box sx={{ mt: 2, pl: 2, borderLeft: 2, borderColor: 'divider' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 'medium' }}>
                        Components ({feature.components.filter(c => c.progress >= 100).length}/{feature.components.length} complete)
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {feature.components.map((component) => {
                          const isComponentComplete = component.progress >= 100;
                          const isComponentActive = component.progress > 0 && component.progress < 100;
                          
                          return (
                            <Box key={component.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  backgroundColor: isComponentComplete 
                                    ? 'success.main' 
                                    : isComponentActive 
                                      ? 'primary.main' 
                                      : 'divider',
                                  flexShrink: 0,
                                }}
                              />
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      color: isComponentComplete ? 'success.main' : 'text.primary',
                                      fontWeight: isComponentActive ? 'medium' : 'normal',
                                    }}
                                  >
                                    {component.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {Math.round(component.progress)}%
                                  </Typography>
                                </Box>
                                {(isComponentActive || !isComponentComplete) && (
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={component.progress} 
                                    sx={{ 
                                      height: 4, 
                                      borderRadius: 1,
                                    }}
                                  />
                                )}
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  )}
                  
                  {isComplete && (
                    <Chip
                      label="Complete"
                      size="small"
                      color="success"
                      sx={{ mt: 1 }}
                    />
                  )}
                  
                  {/* Priority controls */}
                  {!isComplete && (
                    <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                      <Tooltip title="Increase Priority">
                        <IconButton
                          size="small"
                          onClick={() => prioritizeFeature(feature.id, Math.max(1, feature.priority - 1))}
                          disabled={feature.priority === 1}
                          sx={{ 
                            border: 1, 
                            borderColor: 'divider',
                            '&:hover': { borderColor: 'primary.main' },
                          }}
                        >
                          <ArrowUpwardIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Decrease Priority">
                        <IconButton
                          size="small"
                          onClick={() => prioritizeFeature(feature.id, feature.priority + 1)}
                          sx={{ 
                            border: 1, 
                            borderColor: 'divider',
                            '&:hover': { borderColor: 'primary.main' },
                          }}
                        >
                          <ArrowDownwardIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
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

