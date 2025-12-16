import { ProductState, ProductMilestone, Feature } from '@/types/product';
import { TeamState, Employee } from '@/types/employee';
import { calculateTeamProductivity } from './calculations';

export function updateProductSystem(product: ProductState, team: TeamState): ProductState {
  const updated = { ...product };
  
  // Get all features with incomplete components, sorted by priority
  const activeFeatures = updated.features
    .filter(f => f.progress < 100)
    .sort((a, b) => a.priority - b.priority);
  
  // Process each feature with assigned team
  activeFeatures.forEach(feature => {
    const assignedEmployees = feature.assignedTeam.employeeIds
      .map(id => team.employees.find(e => e.id === id))
      .filter((e): e is Employee => e !== undefined && e.onboardingComplete);
    
    if (assignedEmployees.length === 0) {
      return; // No assigned team, skip this feature
    }
    
    // Get engineers and designers from assigned team
    const assignedEngineers = assignedEmployees.filter(e => 
      e.role === 'engineer' || e.role === 'cto'
    );
    const assignedDesigners = assignedEmployees.filter(e => e.role === 'designer');
    
    // Calculate productivity for this feature's team
    const featureTeamProductivity = assignedEmployees.reduce((sum, emp) => {
      const roleMultiplier = getRoleProductivityMultiplier(emp.role);
      return sum + (emp.productivity * roleMultiplier);
    }, 0);
    
    // Base productivity multiplier from assigned team
    const productivityMultiplier = 0.5 + (featureTeamProductivity * 0.1);
    
    const incompleteComponents = feature.components.filter(c => c.progress < 100);
    
    if (incompleteComponents.length > 0 && assignedEngineers.length > 0) {
      // Focus on the first incomplete component
      const activeComponent = incompleteComponents[0];
      
      // Calculate engineer efficiency with diminishing returns
      const engineerEfficiency = assignedEngineers.length > 1 
        ? 1 + (assignedEngineers.length - 1) * 0.7
        : 1;
      
      // Complexity adjustment
      const complexityAdjustment = activeComponent.baseComplexity > 8 ? 0.9 : 1.0;
      
      // Daily progress based on assigned engineers
      const baseDailyProgress = (100 / activeComponent.estimatedDays) * engineerEfficiency * productivityMultiplier * complexityAdjustment;
      
      // Primary component gets most of the effort
      activeComponent.progress = Math.min(100, activeComponent.progress + (baseDailyProgress * 0.85));
      
      // Secondary component gets some progress if we have enough engineers
      if (incompleteComponents.length > 1 && assignedEngineers.length >= 2) {
        const secondaryComponent = incompleteComponents[1];
        const secondaryEngineerEfficiency = assignedEngineers.length > 2 
          ? 1 + (assignedEngineers.length - 2) * 0.7 
          : 1;
        const secondaryComplexityAdjustment = secondaryComponent.baseComplexity > 8 ? 0.9 : 1.0;
        const secondaryDailyProgress = (100 / secondaryComponent.estimatedDays) * secondaryEngineerEfficiency * productivityMultiplier * secondaryComplexityAdjustment;
        secondaryComponent.progress = Math.min(100, secondaryComponent.progress + (secondaryDailyProgress * 0.15));
      }
    }
    
    // Update feature progress based on component completion
    if (feature.components.length > 0) {
      const totalComplexity = feature.components.reduce((sum, c) => sum + c.baseComplexity, 0);
      const weightedProgress = feature.components.reduce((sum, c) => sum + (c.progress * c.baseComplexity), 0);
      feature.progress = totalComplexity > 0 ? weightedProgress / totalComplexity : 0;
    }
    
    // Update quality based on assigned designers
    if (assignedDesigners.length > 0) {
      updated.quality = Math.min(1, updated.quality + (0.0005 * assignedDesigners.length));
    }
  });
  
  // Update overall progress based on feature completion (weighted by complexity)
  const totalComplexity = updated.features.reduce((sum, f) => sum + f.baseComplexity, 0);
  const weightedProgress = updated.features.reduce((sum, f) => sum + (f.progress * f.baseComplexity), 0);
  updated.overallProgress = totalComplexity > 0 ? weightedProgress / totalComplexity : 0;
  
  // Update maturity based on overall progress
  updated.maturity = Math.min(1, updated.overallProgress / 100);
  
  // Determine milestone based on completed features
  updated.currentMilestone = calculateProductStage(updated.features);
  
  // Update product-market fit (simplified - improves with time and product quality)
  if (updated.maturity > 0.5) {
    updated.productMarketFit = Math.min(1, updated.productMarketFit + 0.001);
  }
  
  return updated;
}

function getRoleProductivityMultiplier(role: string): number {
  switch (role) {
    case 'engineer': return 1.0;
    case 'designer': return 0.7;
    case 'cto': return 1.2;
    case 'cofounder': return 1.2;
    default: return 0.5;
  }
}

// New function to calculate product stage based on completed features
function calculateProductStage(features: ProductState['features']): ProductMilestone {
  const completedFeatures = features.filter(f => f.progress >= 100);
  const totalFeatures = features.length;
  const completionRatio = totalFeatures > 0 ? completedFeatures.length / totalFeatures : 0;
  
  // Stage thresholds based on feature completion
  if (completionRatio < 0.2) return 'idea';        // 0-20% features
  if (completionRatio < 0.4) return 'mvp';        // 20-40% features
  if (completionRatio < 0.6) return 'validated';  // 40-60% features
  if (completionRatio < 0.8) return 'growing';    // 60-80% features
  return 'mature';                                 // 80-100% features
}
