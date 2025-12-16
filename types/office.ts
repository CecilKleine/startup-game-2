export type OfficeTier = 'coworking' | 'small' | 'medium' | 'large';

export interface Office {
  id: string;
  tier: OfficeTier;
  capacity: number; // Maximum number of employees
  monthlyCost: number; // Monthly rent/expense
  name: string;
  description: string;
}

export interface OfficeState {
  offices: Office[];
  totalCapacity: number;
  totalMonthlyCost: number;
}

export const OFFICE_TIERS: Record<OfficeTier, { name: string; capacity: number; monthlyCost: number; description: string }> = {
  coworking: {
    name: 'Coworking Space',
    capacity: 5,
    monthlyCost: 1000,
    description: 'Shared workspace for up to 5 people. Perfect for early stage startups.',
  },
  small: {
    name: 'Small Office',
    capacity: 10,
    monthlyCost: 3000,
    description: 'Small private office space for up to 10 team members.',
  },
  medium: {
    name: 'Medium Office',
    capacity: 25,
    monthlyCost: 8000,
    description: 'Comfortable office space for a growing team of up to 25 people.',
  },
  large: {
    name: 'Large Office',
    capacity: 50,
    monthlyCost: 20000,
    description: 'Spacious office complex for large teams of up to 50 people.',
  },
};

