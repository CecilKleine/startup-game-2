import { FundingState, FundingOffer, FundingRoundType } from '@/types/funding';
import { GameState } from '@/types/game';
import { ProductMilestone } from '@/types/product';
import { calculateValuation } from './calculations';
import { getProductTemplate } from '@/types/productTemplates';

export function updateFundingSystem(funding: FundingState, gameState: GameState): FundingState {
  const updated = { ...funding };
  
  // Process active funding round
  if (updated.activeRound && updated.activeRound.status === 'inProgress') {
    const round = updated.activeRound;
    const daysSinceStart = gameState.currentTime - round.startedAt;
    
    // Generate multiple offers after some time (realistic: 1-5 offers depending on interest)
    if (daysSinceStart >= 30 && round.offers.length === 0) {
      // Generate 1-5 offers based on investor interest
      const numOffers = Math.max(1, Math.min(5, Math.ceil(round.investorInterest * 5)));
      
      for (let i = 0; i < numOffers; i++) {
        // Vary investor interest slightly for each offer (±10%)
        const variedInterest = Math.max(0, Math.min(1, round.investorInterest + (Math.random() - 0.5) * 0.2));
        const offer = generateFundingOffer(round.roundType, variedInterest, gameState, i);
        round.offers.push(offer);
      }
      
      // Sort offers by best terms (higher amount, lower equity)
      round.offers.sort((a, b) => {
        const scoreA = a.amount / a.equityPercent;
        const scoreB = b.amount / b.equityPercent;
        return scoreB - scoreA;
      });
    }
    
    // Round expires after 4 months if no offer accepted
    if (daysSinceStart >= 120 && round.offers.length > 0) {
      // Check if any offers expired
      round.offers = round.offers.filter(offer => {
        return !offer.expiresAt || gameState.currentTime < offer.expiresAt;
      });
      
      if (round.offers.length === 0) {
        round.status = 'failed';
        updated.activeRound = null;
      }
    }
  }
  
  return updated;
}

/**
 * Get revenue requirement for a funding round (Series A and above)
 */
export function getRevenueRequirement(roundType: FundingRoundType): number {
  switch (roundType) {
    case 'seed':
      return 0; // No revenue requirement for seed
    case 'seriesA':
      return 10000; // $10k/month MRR
    case 'seriesB':
      return 100000; // $100k/month MRR
    case 'seriesC':
      return 500000; // $500k/month MRR
    case 'seriesD':
      return 2000000; // $2M/month MRR
    default:
      return 0;
  }
}

function generateFundingOffer(
  roundType: FundingRoundType,
  investorInterest: number,
  gameState: GameState,
  offerIndex: number = 0
): FundingOffer {
  const milestone = gameState.product.currentMilestone;
  
  // Get product template to consider complexity and revenue potential
  const productTemplate = gameState.product.productTemplateId 
    ? getProductTemplate(gameState.product.productTemplateId)
    : null;
  
  const productComplexity = productTemplate?.estimatedComplexity || 3; // 1-5 scale
  const revenuePotential = productTemplate?.revenuePotential || 1.0; // 1.0-2.0 multiplier
  
  // Milestone-based multipliers for funding amounts (higher milestone = more funding)
  const amountMultipliers: Record<ProductMilestone, number> = {
    'idea': 0.4,
    'mvp': 0.6,
    'validated': 0.85,
    'growing': 1.0,
    'mature': 1.15
  };
  
  // Milestone-based multipliers for equity (higher milestone = less equity required)
  const equityMultipliers: Record<ProductMilestone, number> = {
    'idea': 1.4,
    'mvp': 1.15,
    'validated': 1.0,
    'growing': 0.9,
    'mature': 0.85
  };
  
  const amountMultiplier = amountMultipliers[milestone] || 0.4;
  const equityMultiplier = equityMultipliers[milestone] || 1.4;
  
  // Product complexity affects funding (higher complexity = slightly more funding, slightly less equity)
  const complexityFactor = 0.9 + (productComplexity / 5) * 0.2; // 0.9 to 1.1
  
  // Revenue potential affects funding significantly
  const revenuePotentialFactor = 0.85 + (revenuePotential - 1.0) * 0.3; // 0.85 to 1.15
  
  const valuation = calculateValuation(
    gameState.monthlyRevenue,
    gameState.product.maturity,
    gameState.team.employees.length,
    gameState.product.productMarketFit,
    gameState.product.currentMilestone
  );
  
  // Base amounts and equity for each round type (more realistic ranges)
  let baseAmountRange: [number, number];
  let baseEquityRange: [number, number];
  
  if (roundType === 'seed') {
    // Seed: $250k - $2M, 15-25% equity (more realistic)
    baseAmountRange = [250000, 2000000];
    baseEquityRange = [15, 25];
  } else if (roundType === 'seriesA') {
    // Series A: $3M - $15M, 12-20% equity
    baseAmountRange = [3000000, 15000000];
    baseEquityRange = [12, 20];
  } else if (roundType === 'seriesB') {
    // Series B: $15M - $50M, 8-15% equity
    baseAmountRange = [15000000, 50000000];
    baseEquityRange = [8, 15];
  } else if (roundType === 'seriesC') {
    // Series C: $50M - $150M, 5-12% equity
    baseAmountRange = [50000000, 150000000];
    baseEquityRange = [5, 12];
  } else {
    // Series D: $100M - $300M, 3-8% equity
    baseAmountRange = [100000000, 300000000];
    baseEquityRange = [3, 8];
  }
  
  // Calculate base amount and equity based on investor interest
  const [minAmount, maxAmount] = baseAmountRange;
  const [maxEquity, minEquity] = baseEquityRange; // Higher interest = lower equity
  
  // Vary slightly between offers (better or worse terms)
  const offerVariation = (offerIndex / 5) * 0.15 - 0.075; // -7.5% to +7.5%
  const variedInterest = Math.max(0, Math.min(1, investorInterest + offerVariation));
  
  let baseAmount = minAmount + (variedInterest * (maxAmount - minAmount));
  let baseEquityPercent = maxEquity - (variedInterest * (maxEquity - minEquity));
  
  // Apply product-specific multipliers
  baseAmount = baseAmount * amountMultiplier * complexityFactor * revenuePotentialFactor;
  baseEquityPercent = baseEquityPercent * equityMultiplier;
  
  // Additional adjustments based on revenue (higher revenue = better terms)
  if (gameState.monthlyRevenue > 0) {
    const revenueBonus = Math.min(1.2, 1 + (gameState.monthlyRevenue / 100000) * 0.1); // Up to 20% bonus
    baseAmount *= revenueBonus;
    baseEquityPercent *= (1 / revenueBonus); // Less equity for revenue-generating companies
  }
  
  // Ensure realistic bounds
  let finalAmount: number;
  let finalEquityPercent: number;
  
  if (roundType === 'seed') {
    finalAmount = Math.max(200000, Math.min(2500000, baseAmount));
    finalEquityPercent = Math.max(12, Math.min(30, baseEquityPercent));
  } else if (roundType === 'seriesA') {
    finalAmount = Math.max(2500000, Math.min(18000000, baseAmount));
    finalEquityPercent = Math.max(8, Math.min(25, baseEquityPercent));
  } else if (roundType === 'seriesB') {
    finalAmount = Math.max(12000000, Math.min(60000000, baseAmount));
    finalEquityPercent = Math.max(5, Math.min(18, baseEquityPercent));
  } else if (roundType === 'seriesC') {
    finalAmount = Math.max(40000000, Math.min(180000000, baseAmount));
    finalEquityPercent = Math.max(3, Math.min(15, baseEquityPercent));
  } else {
    finalAmount = Math.max(80000000, Math.min(350000000, baseAmount));
    finalEquityPercent = Math.max(2, Math.min(10, baseEquityPercent));
  }
  
  // Requirements for the offer
  const requirements: string[] = [];
  if (roundType !== 'seed') {
    const revenueReq = getRevenueRequirement(roundType);
    if (revenueReq > 0) {
      requirements.push(`Minimum ${Math.round(revenueReq / 1000)}k/month revenue`);
    }
  }
  
  return {
    id: `offer-${Date.now()}-${offerIndex}`,
    roundType,
    amount: Math.round(finalAmount),
    valuation: Math.round(valuation),
    equityPercent: Math.round(finalEquityPercent * 10) / 10,
    requirements: requirements.length > 0 ? requirements : undefined,
    expiresAt: gameState.currentTime + 30, // Offer expires in 30 days
  };
}
