'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  IconButton,
  Divider,
  Alert,
} from '@mui/material';
import { useGameState } from '../game/GameStateProvider';
import { Feature, FeatureRequirements } from '@/types/product';
import { Employee } from '@/types/employee';
import { formatPercentage } from '@/utils/formatting';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';

interface FeatureTeamAssignmentProps {
  feature: Feature;
  open: boolean;
  onClose: () => void;
}

export function FeatureTeamAssignment({ feature, open, onClose }: FeatureTeamAssignmentProps) {
  const { gameState, assignEmployeeToFeature, unassignEmployeeFromFeature, autoAssignTeams } = useGameState();
  const { employees } = gameState.team;
  const [showAutoAssign, setShowAutoAssign] = useState(false);

  const assignedEmployees = feature.assignedTeam.employeeIds
    .map(id => employees.find(e => e.id === id))
    .filter((e): e is Employee => e !== undefined);

  const availableEmployees = employees.filter(e => 
    e.onboardingComplete && 
    !feature.assignedTeam.employeeIds.includes(e.id)
  );

  const requirements = feature.requirements;

  // Check if requirements are met
  // CTOs count as both frontend AND backend
  const ctoCount = assignedEmployees.filter(e => e.role === 'cto' || e.role === 'cofounder').length;
  const currentFrontend = assignedEmployees.filter(e => 
    e.role === 'engineer' && e.roleSubclass === 'frontend'
  ).length + ctoCount;
  const currentBackend = assignedEmployees.filter(e => 
    e.role === 'engineer' && e.roleSubclass === 'backend'
  ).length + ctoCount;
  const currentProduct = assignedEmployees.filter(e => 
    e.role === 'designer' && e.roleSubclass === 'product'
  ).length;
  const currentVisual = assignedEmployees.filter(e => 
    e.role === 'designer' && e.roleSubclass === 'visual'
  ).length;

  const needsFrontend = (requirements.requiredEngineers.frontend || 0) - currentFrontend;
  const needsBackend = (requirements.requiredEngineers.backend || 0) - currentBackend;
  const needsProduct = (requirements.requiredDesigners.product || 0) - currentProduct;
  const needsVisual = (requirements.requiredDesigners.visual || 0) - currentVisual;

  const requirementsMet = needsFrontend <= 0 && needsBackend <= 0 && needsProduct <= 0 && needsVisual <= 0;

  const handleAssign = (employeeId: string) => {
    assignEmployeeToFeature(employeeId, feature.id);
  };

  const handleUnassign = (employeeId: string) => {
    unassignEmployeeFromFeature(employeeId, feature.id);
  };

  const handleAutoAssign = () => {
    autoAssignTeams();
    setShowAutoAssign(true);
    setTimeout(() => setShowAutoAssign(false), 3000);
  };

  const getRoleDisplayName = (employee: Employee): string => {
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

  const meetsSeniority = (employee: Employee): boolean => {
    const seniorityOrder = { junior: 0, mid: 1, senior: 2 };
    return seniorityOrder[employee.experienceLevel] >= seniorityOrder[requirements.minSeniority];
  };

  const getMatchingEmployees = (role: 'engineer' | 'designer', subclass?: 'frontend' | 'backend' | 'product' | 'visual') => {
    return availableEmployees.filter(e => {
      if (role === 'engineer') {
        // CTOs match both frontend and backend requirements
        if (e.role === 'cto' || e.role === 'cofounder') {
          return meetsSeniority(e);
        }
        return e.role === 'engineer' && 
               (!subclass || e.roleSubclass === subclass) &&
               meetsSeniority(e);
      } else {
        return e.role === 'designer' && 
               (!subclass || e.roleSubclass === subclass) &&
               meetsSeniority(e);
      }
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Assign Team: {feature.name}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Requirements */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              Requirements
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
              <Typography variant="body2">
                Minimum Seniority: <Chip label={requirements.minSeniority} size="small" />
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {requirements.requiredEngineers.frontend ? (
                  <Chip 
                    label={`${requirements.requiredEngineers.frontend} Frontend Engineer${requirements.requiredEngineers.frontend > 1 ? 's' : ''}`}
                    color={needsFrontend > 0 ? 'error' : 'success'}
                    size="small"
                  />
                ) : null}
                {requirements.requiredEngineers.backend ? (
                  <Chip 
                    label={`${requirements.requiredEngineers.backend} Backend Engineer${requirements.requiredEngineers.backend > 1 ? 's' : ''}`}
                    color={needsBackend > 0 ? 'error' : 'success'}
                    size="small"
                  />
                ) : null}
                {requirements.requiredDesigners.product ? (
                  <Chip 
                    label={`${requirements.requiredDesigners.product} Product Designer${requirements.requiredDesigners.product > 1 ? 's' : ''}`}
                    color={needsProduct > 0 ? 'error' : 'success'}
                    size="small"
                  />
                ) : null}
                {requirements.requiredDesigners.visual ? (
                  <Chip 
                    label={`${requirements.requiredDesigners.visual} Visual Designer${requirements.requiredDesigners.visual > 1 ? 's' : ''}`}
                    color={needsVisual > 0 ? 'error' : 'success'}
                    size="small"
                  />
                ) : null}
              </Box>
              {requirementsMet && (
                <Alert severity="success" sx={{ mt: 1 }}>
                  All requirements met!
                </Alert>
              )}
            </Box>
          </Paper>

          {/* Assigned Team */}
          <Box>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              Assigned Team ({assignedEmployees.length})
            </Typography>
            {assignedEmployees.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No employees assigned. Assign a team to start development.
              </Typography>
            ) : (
              <List>
                {assignedEmployees.map((employee, index) => (
                  <React.Fragment key={employee.id}>
                    <ListItem
                      secondaryAction={
                        <IconButton edge="end" onClick={() => handleUnassign(employee.id)}>
                          <PersonRemoveIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={employee.name}
                        secondary={
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                            <Chip label={getRoleDisplayName(employee)} size="small" variant="outlined" />
                            <Chip label={employee.experienceLevel} size="small" />
                            <Typography variant="caption" color="text.secondary">
                              {formatPercentage(employee.productivity)} productivity
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < assignedEmployees.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>

          {/* Available Employees */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Available Employees
              </Typography>
              <Button size="small" variant="outlined" onClick={handleAutoAssign}>
                Auto-Assign
              </Button>
            </Box>
            {showAutoAssign && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Auto-assignment completed! Check assigned team above.
              </Alert>
            )}
            {availableEmployees.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No available employees. All employees are assigned or onboarding.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Frontend Engineers */}
                {needsFrontend > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      Frontend Engineers Needed ({needsFrontend})
                    </Typography>
                    <List dense>
                      {getMatchingEmployees('engineer', 'frontend').map(employee => (
                        <ListItem
                          key={employee.id}
                          secondaryAction={
                            <IconButton edge="end" onClick={() => handleAssign(employee.id)}>
                              <PersonAddIcon />
                            </IconButton>
                          }
                        >
                          <ListItemText
                            primary={employee.name}
                            secondary={
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                                <Chip label={employee.experienceLevel} size="small" />
                                <Typography variant="caption" color="text.secondary">
                                  {formatPercentage(employee.productivity)} productivity
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Backend Engineers */}
                {needsBackend > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      Backend Engineers Needed ({needsBackend})
                    </Typography>
                    <List dense>
                      {getMatchingEmployees('engineer', 'backend').map(employee => (
                        <ListItem
                          key={employee.id}
                          secondaryAction={
                            <IconButton edge="end" onClick={() => handleAssign(employee.id)}>
                              <PersonAddIcon />
                            </IconButton>
                          }
                        >
                          <ListItemText
                            primary={employee.name}
                            secondary={
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                                <Chip label={employee.experienceLevel} size="small" />
                                <Typography variant="caption" color="text.secondary">
                                  {formatPercentage(employee.productivity)} productivity
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Product Designers */}
                {needsProduct > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      Product Designers Needed ({needsProduct})
                    </Typography>
                    <List dense>
                      {getMatchingEmployees('designer', 'product').map(employee => (
                        <ListItem
                          key={employee.id}
                          secondaryAction={
                            <IconButton edge="end" onClick={() => handleAssign(employee.id)}>
                              <PersonAddIcon />
                            </IconButton>
                          }
                        >
                          <ListItemText
                            primary={employee.name}
                            secondary={
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                                <Chip label={employee.experienceLevel} size="small" />
                                <Typography variant="caption" color="text.secondary">
                                  {formatPercentage(employee.productivity)} productivity
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Visual Designers */}
                {needsVisual > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      Visual Designers Needed ({needsVisual})
                    </Typography>
                    <List dense>
                      {getMatchingEmployees('designer', 'visual').map(employee => (
                        <ListItem
                          key={employee.id}
                          secondaryAction={
                            <IconButton edge="end" onClick={() => handleAssign(employee.id)}>
                              <PersonAddIcon />
                            </IconButton>
                          }
                        >
                          <ListItemText
                            primary={employee.name}
                            secondary={
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                                <Chip label={employee.experienceLevel} size="small" />
                                <Typography variant="caption" color="text.secondary">
                                  {formatPercentage(employee.productivity)} productivity
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Other available employees */}
                {availableEmployees.filter(e => {
                  const isEngineer = (e.role === 'engineer' || e.role === 'cto') && 
                                    (!needsFrontend || e.roleSubclass !== 'frontend') &&
                                    (!needsBackend || e.roleSubclass !== 'backend');
                  const isDesigner = e.role === 'designer' &&
                                    (!needsProduct || e.roleSubclass !== 'product') &&
                                    (!needsVisual || e.roleSubclass !== 'visual');
                  return !isEngineer && !isDesigner;
                }).length > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      Other Available
                    </Typography>
                    <List dense>
                      {availableEmployees.filter(e => {
                        const isEngineer = (e.role === 'engineer' || e.role === 'cto') && 
                                          (!needsFrontend || e.roleSubclass !== 'frontend') &&
                                          (!needsBackend || e.roleSubclass !== 'backend');
                        const isDesigner = e.role === 'designer' &&
                                          (!needsProduct || e.roleSubclass !== 'product') &&
                                          (!needsVisual || e.roleSubclass !== 'visual');
                        return !isEngineer && !isDesigner;
                      }).map(employee => (
                        <ListItem
                          key={employee.id}
                          secondaryAction={
                            <IconButton edge="end" onClick={() => handleAssign(employee.id)}>
                              <PersonAddIcon />
                            </IconButton>
                          }
                        >
                          <ListItemText
                            primary={employee.name}
                            secondary={
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                                <Chip label={getRoleDisplayName(employee)} size="small" variant="outlined" />
                                <Chip label={employee.experienceLevel} size="small" />
                                <Typography variant="caption" color="text.secondary">
                                  {formatPercentage(employee.productivity)} productivity
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
