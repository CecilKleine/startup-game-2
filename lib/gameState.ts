import { GameState } from '@/types/game';
import { TeamState } from '@/types/employee';
import { ProductState, Feature, FeatureComponent } from '@/types/product';
import { FundingState } from '@/types/funding';
import { EventState } from '@/types/events';
import { OfficeState, OFFICE_TIERS, OfficeTier } from '@/types/office';
import { CustomerState } from '@/types/customers';
import { getProductTemplate } from '@/types/productTemplates';
import { generateComponentsForFeature } from '@/utils/componentGenerator';

export interface InitialGameConfig {
  startingMoney: number;
  difficulty: 'easy' | 'medium' | 'hard';
  selectedProductId?: string; // Product template ID from productTemplates.ts
}

export function createInitialGameState(config: InitialGameConfig): GameState {
  const initialTeam: TeamState = {
    employees: [],
    candidatePool: generateInitialCandidates(),
    totalMonthlySalary: 0,
    totalProductivity: 0,
  };

  // Initialize product from template if provided, otherwise use default
  let initialProduct: ProductState;
  if (config.selectedProductId) {
    const template = getProductTemplate(config.selectedProductId);
    if (template) {
      // Convert feature templates to game features with components
      const features: Feature[] = template.features.map(ft => {
        // Generate components for this feature
        const componentTemplates = ft.components && ft.components.length > 0 
          ? ft.components 
          : generateComponentsForFeature(ft.id, ft.name, ft.baseComplexity);
        
        const components: FeatureComponent[] = componentTemplates.map(ct => ({
          id: ct.id,
          name: ct.name,
          progress: 0,
          baseComplexity: ct.baseComplexity,
          estimatedDays: ct.estimatedDays,
        }));
        
        return {
          id: ft.id,
          name: ft.name,
          description: ft.description,
          progress: 0,
          priority: ft.priority,
          baseComplexity: ft.baseComplexity,
          components,
          unlocksCapability: ft.unlocksCapability,
        };
      });
      
      initialProduct = {
        overallProgress: 0,
        currentMilestone: 'idea',
        features,
        maturity: 0,
        quality: 0.5,
        productMarketFit: 0,
        productTemplateId: template.id,
      };
    } else {
      // Fallback to default if template not found
      initialProduct = createDefaultProduct();
    }
  } else {
    // No product selected yet - use minimal default
    initialProduct = createDefaultProduct();
  }

  const initialFunding: FundingState = {
    rounds: [],
    activeRound: null,
    totalEquity: 100,
    totalRaised: 0,
  };

  const initialEvents: EventState = {
    pendingEvents: [],
    eventHistory: [],
    lastEventTime: 0,
  };

  // Initialize offices - start with coworking space
  const initialOffices: OfficeState = {
    offices: [
      {
        id: 'office-1',
        tier: 'coworking',
        capacity: OFFICE_TIERS.coworking.capacity,
        monthlyCost: OFFICE_TIERS.coworking.monthlyCost,
        name: OFFICE_TIERS.coworking.name,
        description: OFFICE_TIERS.coworking.description,
      },
    ],
    totalCapacity: OFFICE_TIERS.coworking.capacity,
    totalMonthlyCost: OFFICE_TIERS.coworking.monthlyCost,
  };

  // Initialize customers
  const initialCustomers: CustomerState = {
    totalCustomers: 0,
    monthlyAcquisitions: 0,
    monthlyChurn: 0,
  };

  // Start from today's date
  const startDate = new Date();
  
  return {
    money: config.startingMoney,
    monthlyExpenses: 2000 + initialOffices.totalMonthlyCost, // Base overhead + office costs
    monthlyRevenue: 0,
    revenueHistory: [], // Start with empty revenue history
    burnRate: 2000,
    runway: config.startingMoney / 2000,
    currentTime: 0,
    startDate: startDate.toISOString(),
    team: initialTeam,
    product: initialProduct,
    funding: initialFunding,
    events: initialEvents,
    offices: initialOffices,
    customers: initialCustomers,
    isPaused: true,
    gameSpeed: 1,
    gameOver: false,
  };
}

function generateInitialCandidates() {
  // Generate a pool of initial candidates
  const roles: Array<'engineer' | 'designer' | 'sales' | 'marketing'> = ['engineer', 'designer', 'sales', 'marketing'];
  const candidates = [];
  
  for (let i = 0; i < 8; i++) {
    const role = roles[Math.floor(Math.random() * roles.length)];
    const experience = ['junior', 'mid', 'senior'][Math.floor(Math.random() * 3)] as 'junior' | 'mid' | 'senior';
    
    let salary, productivity;
    switch (experience) {
      case 'junior':
        salary = role === 'engineer' ? 6000 : role === 'designer' ? 5000 : 4000;
        productivity = 0.5 + Math.random() * 0.2;
        break;
      case 'mid':
        salary = role === 'engineer' ? 10000 : role === 'designer' ? 8000 : 6000;
        productivity = 0.7 + Math.random() * 0.2;
        break;
      case 'senior':
        salary = role === 'engineer' ? 14000 : role === 'designer' ? 11000 : 9000;
        productivity = 0.85 + Math.random() * 0.15;
        break;
    }
    
    candidates.push({
      id: `candidate-${i}`,
      name: generateRandomName(),
      role,
      expectedSalary: salary,
      productivity,
      experienceLevel: experience,
    });
  }
  
  return candidates;
}

function createDefaultProduct(): ProductState {
  const defaultComponents: FeatureComponent[] = generateComponentsForFeature('core', 'Core Functionality', 5).map(ct => ({
    id: ct.id,
    name: ct.name,
    progress: 0,
    baseComplexity: ct.baseComplexity,
    estimatedDays: ct.estimatedDays,
  }));
  
  return {
    overallProgress: 0,
    currentMilestone: 'idea',
    features: [
      {
        id: 'core',
        name: 'Core Functionality',
        description: 'Basic product features',
        progress: 0,
        priority: 1,
        baseComplexity: 5,
        components: defaultComponents,
      },
    ],
    maturity: 0,
    quality: 0.5,
    productMarketFit: 0,
  };
}

function generateRandomName(): string {
  const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}
