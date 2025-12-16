import { ProductMilestone } from '@/types/product';

/**
 * Base ARPU (Average Revenue Per User) per month by product category
 * Values represent mature product pricing, scaled down for earlier milestones
 */
export const CATEGORY_ARPU: Record<string, number> = {
  'CRM': 120,          // $100-150/month (Salesforce/HubSpot tiers)
  'Productivity': 20,  // $15-25/month (Asana/Notion/Monday.com)
  'Analytics': 75,     // $50-100/month (Mixpanel/Amplitude)
  'AI': 100,           // $50-150/month (AI tools vary widely)
  'HR': 10,            // $5-15/month per employee (BambooHR/Gusto)
};

/**
 * Base customer acquisition rate per sales employee per month by category
 */
export const CATEGORY_ACQUISITION_RATE: Record<string, number> = {
  'CRM': 4,            // 3-5 customers/month (enterprise sales, longer cycles)
  'Productivity': 12,  // 10-15 customers/month (self-serve friendly)
  'Analytics': 6,      // 5-8 customers/month (mid-market focus)
  'AI': 5,             // 4-6 customers/month (complex product)
  'HR': 20,            // 15-25 customers/month (SMB focus, volume play)
};

/**
 * ARPU multiplier by product milestone
 * ARPU scales up as product matures
 */
export const MILESTONE_ARPU_MULTIPLIER: Record<ProductMilestone, number> = {
  'idea': 0,       // 0% (no revenue)
  'mvp': 0.5,      // 50% of base ARPU
  'validated': 0.7, // 70% of base ARPU
  'growing': 0.9,   // 90% of base ARPU
  'mature': 1.0,    // 100% of base ARPU
};

/**
 * Customer acquisition effectiveness by product milestone
 * Same logic as previous revenue system
 */
export const MILESTONE_ACQUISITION_MULTIPLIER: Record<ProductMilestone, number> = {
  'idea': 0,
  'mvp': 0.3,        // 30% effectiveness at MVP
  'validated': 0.6,  // 60% at validated
  'growing': 0.9,    // 90% at growing
  'mature': 1.0,     // 100% at mature
};

/**
 * Monthly churn rates by product milestone
 * Churn decreases as product matures and becomes more stable
 */
export const MILESTONE_CHURN_RATE: Record<ProductMilestone, number> = {
  'idea': 0,          // N/A (no customers)
  'mvp': 0.13,        // 13%/month (unstable product, 12-15% range)
  'validated': 0.07,  // 7%/month (better but not proven, 6-8% range)
  'growing': 0.04,    // 4%/month (product-market fit improving, 3-5% range)
  'mature': 0.015,    // 1.5%/month (stable, sticky product, 1-2% range)
};

/**
 * Get base ARPU for a product category
 */
export function getCategoryARPU(category: string): number {
  return CATEGORY_ARPU[category] || CATEGORY_ARPU['Productivity']; // Default to Productivity
}

/**
 * Get base acquisition rate for a product category
 */
export function getCategoryAcquisitionRate(category: string): number {
  return CATEGORY_ACQUISITION_RATE[category] || CATEGORY_ACQUISITION_RATE['Productivity'];
}

/**
 * Get ARPU multiplier for a milestone
 */
export function getMilestoneARPUMultiplier(milestone: ProductMilestone): number {
  return MILESTONE_ARPU_MULTIPLIER[milestone] || 0;
}

/**
 * Get acquisition multiplier for a milestone
 */
export function getMilestoneAcquisitionMultiplier(milestone: ProductMilestone): number {
  return MILESTONE_ACQUISITION_MULTIPLIER[milestone] || 0;
}

/**
 * Get churn rate for a milestone
 */
export function getChurnRateByMilestone(milestone: ProductMilestone): number {
  return MILESTONE_CHURN_RATE[milestone] || 0;
}

