import { Employee, TeamState } from './employee';
import { ProductState } from './product';
import { FundingState } from './funding';
import { EventState } from './events';
import { OfficeState } from './office';
import { CustomerState } from './customers';

export interface GameState {
  // Financial
  money: number;
  monthlyExpenses: number;
  monthlyRevenue: number;
  revenueHistory: number[]; // Last 12 months of revenue for growth calculation
  burnRate: number;
  runway: number; // Months until out of money
  
  // Time
  currentTime: number; // Game time in days elapsed
  startDate: string; // ISO date string of when the game started (real calendar date)
  
  // Systems
  team: TeamState;
  product: ProductState;
  funding: FundingState;
  events: EventState;
  offices: OfficeState;
  customers: CustomerState;
  
  // Game status
  isPaused: boolean;
  gameSpeed: number; // 1x, 2x, 4x
  gameOver: boolean;
  gameOverReason?: string;
}

export interface GameAction {
  type: 'hire' | 'fire' | 'prioritizeFeature' | 'startFundraising' | 'acceptFunding' | 'respondToEvent';
  payload: any;
}

export interface InitialGameConfig {
  startingMoney: number;
  difficulty: 'easy' | 'medium' | 'hard';
}
