import { GameState } from '@/types/game';
import { Employee } from '@/types/employee';
import { ProductMilestone } from '@/types/product';
import { getCategoryARPU, getCategoryAcquisitionRate, getMilestoneARPUMultiplier, getMilestoneAcquisitionMultiplier, getChurnRateByMilestone } from './customerBenchmarks';

export function calculateBurnRate(monthlyExpenses: number, monthlyRevenue: number): number {
  return Math.max(0, monthlyExpenses - monthlyRevenue);
}

export function calculateRunway(money: number, burnRate: number): number {
  if (burnRate <= 0) return Infinity;
  return money / burnRate;
}

export function calculateMonthlyExpenses(employees: Employee[], officeMonthlyCost: number, baseOverhead: number = 2000): number {
  const totalSalaries = employees.reduce((sum, emp) => sum + emp.salary, 0);
  return totalSalaries + officeMonthlyCost + baseOverhead;
}

export function calculateTeamProductivity(employees: Employee[]): number {
  const productiveEmployees = employees.filter(emp => emp.onboardingComplete);
  return productiveEmployees.reduce((sum, emp) => {
    const roleMultiplier = getRoleProductivityMultiplier(emp.role);
    return sum + (emp.productivity * roleMultiplier);
  }, 0);
}

function getRoleProductivityMultiplier(role: string): number {
  switch (role) {
    case 'engineer': return 1.0;
    case 'designer': return 0.7;
    case 'sales': return 0.5;
    case 'marketing': return 0.4;
    case 'operations': return 0.3;
    case 'cto': return 1.2; // CTO has high productivity multiplier
    case 'cofounder': return 1.2; // Co-founder has high productivity multiplier
    default: return 0.5;
  }
}

/**
 * Calculate customer acquisitions for the month
 * Based on sales team, marketing support, product stage, and category
 */
export function calculateCustomerAcquisitions(
  productStage: ProductMilestone,
  productCategory: string,
  productMarketFit: number,
  salesCount: number,
  marketingCount: number
): number {
  // Sales only effective from MVP stage onwards
  if (productStage === 'idea') return 0;
  
  // Base acquisition rate for this category
  const categoryBaseRate = getCategoryAcquisitionRate(productCategory);
  
  // Stage-based effectiveness multiplier
  const stageMultiplier = getMilestoneAcquisitionMultiplier(productStage);
  
  // Base acquisitions = category rate × sales count × stage multiplier
  const baseAcquisitions = categoryBaseRate * salesCount * stageMultiplier;
  
  // Marketing multiplier with cap (max 2 marketers per salesperson for full effect)
  const marketersPerSeller = salesCount > 0 ? marketingCount / salesCount : 0;
  const maxMarketingRatio = 2; // Cap at 2 marketers per seller
  const effectiveMarketingRatio = Math.min(marketersPerSeller, maxMarketingRatio);
  const marketingMultiplier = 1 + (effectiveMarketingRatio * 0.25); // Each marketer adds 25% up to 50% max
  
  // Product-market fit affects acquisition
  const marketFitMultiplier = 0.5 + (productMarketFit * 0.5);
  
  // Final monthly acquisitions
  const monthlyAcquisitions = baseAcquisitions * marketingMultiplier * marketFitMultiplier;
  
  return Math.round(monthlyAcquisitions);
}

/**
 * Get churn rate based on product milestone
 */
export function calculateChurnRate(productStage: ProductMilestone): number {
  return getChurnRateByMilestone(productStage);
}

/**
 * Calculate revenue from customers
 * Revenue = customers × ARPU (scaled by milestone)
 */
export function calculateRevenueFromCustomers(
  totalCustomers: number,
  productStage: ProductMilestone,
  productCategory: string
): number {
  if (productStage === 'idea' || totalCustomers === 0) return 0;
  
  // Get base ARPU for category
  const baseARPU = getCategoryARPU(productCategory);
  
  // Apply milestone multiplier
  const milestoneMultiplier = getMilestoneARPUMultiplier(productStage);
  const currentARPU = baseARPU * milestoneMultiplier;
  
  // Revenue = customers × ARPU
  return Math.round(totalCustomers * currentARPU);
}

export function calculateValuation(
  revenue: number,
  productMaturity: number,
  teamSize: number,
  growthTrajectory: number,
  productStage?: ProductMilestone
): number {
  const revenueMultiple = 10; // Standard SaaS multiple
  const revenueValue = revenue * revenueMultiple;
  const productValue = productMaturity * 500000;
  const teamValue = teamSize * 50000;
  const growthPremium = growthTrajectory * 1000000;
  
  // Stage-based valuation multiplier
  if (productStage) {
    const stageMultipliers: Record<ProductMilestone, number> = {
      'idea': 0.5,       // 50% of base valuation at idea
      'mvp': 0.7,       // 70% at MVP
      'validated': 0.9, // 90% at validated
      'growing': 1.1,   // 110% at growing (premium)
      'mature': 1.3     // 130% at mature (strong premium)
    };
    
    const stageMultiplier = stageMultipliers[productStage] || 0.5;
    return (revenueValue + productValue + teamValue + growthPremium) * stageMultiplier;
  }
  
  return revenueValue + productValue + teamValue + growthPremium;
}

/**
 * Calculate company valuation based on cash, burn rate, revenue, and revenue growth
 * Uses a more practical startup valuation model
 */
export function calculateCompanyValuation(
  cash: number,
  burnRate: number,
  currentRevenue: number,
  revenueHistory: number[]
): number {
  // Base valuation starts with cash
  let valuation = cash;
  
  // Add revenue-based valuation (ARR-based multiple)
  if (currentRevenue > 0) {
    const annualRevenue = currentRevenue * 12;
    
    // Calculate revenue growth rate over last 12 months
    let growthRate = 0;
    if (revenueHistory.length >= 2) {
      const oldestRevenue = revenueHistory[0];
      const newestRevenue = revenueHistory[revenueHistory.length - 1];
      if (oldestRevenue > 0) {
        growthRate = (newestRevenue - oldestRevenue) / oldestRevenue;
      }
    } else if (revenueHistory.length === 1 && revenueHistory[0] > 0) {
      // If we only have 1 month, use it as baseline
      growthRate = 0;
    }
    
    // Revenue multiple based on growth rate
    // Higher growth = higher multiple (3x to 15x ARR typical for SaaS)
    let revenueMultiple = 5; // Base 5x ARR
    if (growthRate > 0) {
      // For every 10% monthly growth, add 1x to the multiple (up to 15x)
      const growthMultiplier = Math.min(1 + (growthRate * 10), 3); // Max 3x multiplier
      revenueMultiple = 5 * growthMultiplier;
    }
    
    // Cap multiple at reasonable SaaS range
    revenueMultiple = Math.min(Math.max(revenueMultiple, 3), 15);
    
    valuation += annualRevenue * revenueMultiple;
  }
  
  // Factor in burn rate - high burn rate reduces valuation (runway risk)
  // Companies with positive cash flow (negative burn) get premium
  if (burnRate > 0) {
    const runwayMonths = cash / burnRate;
    // Reduce valuation if runway is less than 6 months (high risk)
    if (runwayMonths < 6) {
      const riskDiscount = Math.max(0.5, runwayMonths / 6); // 0.5x to 1.0x discount
      valuation *= riskDiscount;
    }
  } else {
    // Positive cash flow (negative burn) adds premium
    const profitMultiple = 1.2; // 20% premium for profitable companies
    valuation *= profitMultiple;
  }
  
  // Minimum valuation is at least cash on hand
  return Math.max(valuation, cash);
}
