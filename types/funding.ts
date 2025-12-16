export type FundingRoundType = 'seed' | 'seriesA' | 'seriesB' | 'seriesC' | 'seriesD';

export interface FundingOffer {
  id: string;
  roundType: FundingRoundType;
  amount: number;
  valuation: number;
  equityPercent: number;
  requirements?: string[];
  expiresAt: number; // Game time
}

export interface FundingRound {
  id: string;
  roundType: FundingRoundType;
  status: 'notStarted' | 'inProgress' | 'completed' | 'failed';
  startedAt: number;
  offers: FundingOffer[];
  investorInterest: number; // 0-1
}

export interface FundingState {
  rounds: FundingRound[];
  activeRound: FundingRound | null;
  totalEquity: number; // Player's equity percentage (starts at 100)
  totalRaised: number;
}
