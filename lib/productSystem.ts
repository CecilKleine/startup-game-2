import { ProductState, ProductMilestone } from '@/types/product';
import { TeamState } from '@/types/employee';
import { calculateTeamProductivity } from './calculations';

export function updateProductSystem(product: ProductState, team: TeamState): ProductState {
  const updated = { ...product };
  
  // Calculate development speed based on team productivity
  const teamProductivity = calculateTeamProductivity(team.employees);
  
  // Engineers contribute most to development
  const engineerCount = team.employees.filter(e => e.role === 'engineer' && e.onboardingComplete).length;
  
  // Base productivity multiplier from team (0.5 to 1.15 typically)
  const productivityMultiplier = 0.5 + (teamProductivity * 0.1);
  
  // Get all features with incomplete components, sorted by priority
  const activeFeatures = updated.features
    .filter(f => f.progress < 100)
    .sort((a, b) => a.priority - b.priority);
  
  if (activeFeatures.length > 0 && engineerCount > 0) {
    // Primary feature - work on its components
    const primaryFeature = activeFeatures[0];
    const incompleteComponents = primaryFeature.components.filter(c => c.progress < 100);
    
    if (incompleteComponents.length > 0) {
      // Focus on the first incomplete component
      const activeComponent = incompleteComponents[0];
      
      // Calculate realistic progress based on estimatedDays
      // With 1 engineer at 100% productivity, a component should take its estimatedDays
      // More engineers = faster, but with diminishing returns (2 engineers ~= 1.7x speed, 3 engineers ~= 2.2x speed)
      const engineerEfficiency = engineerCount > 1 
        ? 1 + (engineerCount - 1) * 0.7 // Diminishing returns: 2 engineers = 1.7x, 3 = 2.4x, 4 = 3.1x
        : 1;
      
      // Daily progress = (100% / estimatedDays) * engineerEfficiency * productivityMultiplier
      // Complexity already baked into estimatedDays, but we can add a small adjustment for very high complexity
      const complexityAdjustment = activeComponent.baseComplexity > 8 ? 0.9 : 1.0; // Slight slowdown for very complex tasks
      
      const baseDailyProgress = (100 / activeComponent.estimatedDays) * engineerEfficiency * productivityMultiplier * complexityAdjustment;
      
      // Primary component gets 85% of effort
      activeComponent.progress = Math.min(100, activeComponent.progress + (baseDailyProgress * 0.85));
      
      // Secondary component in same feature gets a bit of progress if we have enough engineers
      if (incompleteComponents.length > 1 && engineerCount >= 2) {
        const secondaryComponent = incompleteComponents[1];
        const secondaryEngineerEfficiency = engineerCount > 2 
          ? 1 + (engineerCount - 2) * 0.7 
          : 1;
        const secondaryComplexityAdjustment = secondaryComponent.baseComplexity > 8 ? 0.9 : 1.0;
        const secondaryDailyProgress = (100 / secondaryComponent.estimatedDays) * secondaryEngineerEfficiency * productivityMultiplier * secondaryComplexityAdjustment;
        secondaryComponent.progress = Math.min(100, secondaryComponent.progress + (secondaryDailyProgress * 0.15));
      }
    }
    
    // Secondary feature gets less attention if we have 3+ engineers
    if (activeFeatures.length > 1 && engineerCount >= 3) {
      const secondaryFeature = activeFeatures[1];
      const incompleteComponents = secondaryFeature.components.filter(c => c.progress < 100);
      if (incompleteComponents.length > 0) {
        const activeComponent = incompleteComponents[0];
        // Secondary feature uses engineers 3+ only
        const secondaryEngineerCount = Math.max(1, engineerCount - 2);
        const secondaryEngineerEfficiency = secondaryEngineerCount > 1 
          ? 1 + (secondaryEngineerCount - 1) * 0.7 
          : 1;
        const complexityAdjustment = activeComponent.baseComplexity > 8 ? 0.9 : 1.0;
        const secondaryDailyProgress = (100 / activeComponent.estimatedDays) * secondaryEngineerEfficiency * productivityMultiplier * complexityAdjustment;
        activeComponent.progress = Math.min(100, activeComponent.progress + (secondaryDailyProgress * 0.3));
      }
    }
    
    // Update feature progress based on component completion
    updated.features.forEach(feature => {
      if (feature.components.length > 0) {
        const totalComplexity = feature.components.reduce((sum, c) => sum + c.baseComplexity, 0);
        const weightedProgress = feature.components.reduce((sum, c) => sum + (c.progress * c.baseComplexity), 0);
        feature.progress = totalComplexity > 0 ? weightedProgress / totalComplexity : 0;
      }
    });
  }
  
  // Update overall progress based on feature completion (weighted by complexity)
  const totalComplexity = updated.features.reduce((sum, f) => sum + f.baseComplexity, 0);
  const weightedProgress = updated.features.reduce((sum, f) => sum + (f.progress * f.baseComplexity), 0);
  updated.overallProgress = totalComplexity > 0 ? weightedProgress / totalComplexity : 0;
  
  // Update maturity based on overall progress
  updated.maturity = Math.min(1, updated.overallProgress / 100);
  
  // Determine milestone based on completed features (hidden logic)
  updated.currentMilestone = calculateProductStage(updated.features);
  
  // Update product-market fit (simplified - improves with time and product quality)
  if (updated.maturity > 0.5) {
    updated.productMarketFit = Math.min(1, updated.productMarketFit + 0.001);
  }
  
  // Update quality based on designer count
  const designerCount = team.employees.filter(e => e.role === 'designer' && e.onboardingComplete).length;
  if (designerCount > 0) {
    updated.quality = Math.min(1, updated.quality + 0.0005);
  }
  
  return updated;
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
