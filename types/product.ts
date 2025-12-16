export type ProductMilestone = 'idea' | 'mvp' | 'validated' | 'growing' | 'mature';

export interface FeatureComponent {
  id: string;
  name: string;
  progress: number; // 0-100
  baseComplexity: number; // 1-10 scale, affects development speed for this component
  estimatedDays: number; // Estimated development time in days (for reference)
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  progress: number; // 0-100 (calculated from components)
  priority: number;
  baseComplexity: number; // 1-10 scale, overall feature complexity
  components: FeatureComponent[]; // Individual components that make up this feature
  unlocksCapability?: string; // e.g., "revenue", "mobile", etc.
}

export interface ProductState {
  overallProgress: number; // 0-100
  currentMilestone: ProductMilestone;
  features: Feature[];
  maturity: number; // 0-1, affects revenue potential
  quality: number; // 0-1, affects user adoption
  productMarketFit: number; // 0-1 score
  productTemplateId?: string; // Reference to the selected product template
}
