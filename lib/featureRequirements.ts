import { FeatureRequirements } from '@/types/product';

/**
 * Generate feature requirements based on complexity
 * Low complexity (1-3): Junior/Mid, 1 engineer, 0-1 designer
 * Medium complexity (4-6): Mid/Senior, 1-2 engineers (mix of frontend/backend), 1 designer
 * High complexity (7-10): Senior, 2+ engineers (both frontend/backend), 1-2 designers (both types)
 */
export function generateFeatureRequirements(baseComplexity: number): FeatureRequirements {
  if (baseComplexity <= 3) {
    // Low complexity
    return {
      minSeniority: Math.random() > 0.5 ? 'junior' : 'mid',
      requiredEngineers: {
        frontend: Math.random() > 0.5 ? 1 : 0,
        backend: Math.random() > 0.5 ? 1 : 0,
      },
      requiredDesigners: {
        product: Math.random() > 0.7 ? 1 : 0,
        visual: 0,
      },
    };
  } else if (baseComplexity <= 6) {
    // Medium complexity
    const needsFrontend = Math.random() > 0.3;
    const needsBackend = Math.random() > 0.3;
    return {
      minSeniority: Math.random() > 0.3 ? 'mid' : 'senior',
      requiredEngineers: {
        frontend: needsFrontend ? 1 : 0,
        backend: needsBackend ? 1 : 0,
      },
      requiredDesigners: {
        product: Math.random() > 0.4 ? 1 : 0,
        visual: Math.random() > 0.6 ? 1 : 0,
      },
    };
  } else {
    // High complexity
    return {
      minSeniority: 'senior',
      requiredEngineers: {
        frontend: Math.ceil(baseComplexity / 4), // 2-3 frontend engineers
        backend: Math.ceil(baseComplexity / 4), // 2-3 backend engineers
      },
      requiredDesigners: {
        product: Math.random() > 0.3 ? 1 : 0,
        visual: Math.random() > 0.3 ? 1 : 0,
      },
    };
  }
}
