import { GameState } from '@/types/game';
import { ProductState, Feature, FeatureComponent } from '@/types/product';
import { calculateBurnRate, calculateRunway, calculateMonthlyExpenses, calculateTeamProductivity, calculateCustomerAcquisitions, calculateChurnRate, calculateRevenueFromCustomers } from './calculations';
import { updateProductSystem } from './productSystem';
import { updateEventSystem } from './eventSystem';
import { updateFundingSystem } from './fundingSystem';
import { getProductTemplate } from '@/types/productTemplates';
import { isNewMonth, isNewWeek, getCurrentGameDate } from '@/utils/dateUtils';
import { generateComponentsForFeature } from '@/utils/componentGenerator';

export class GameEngine {
  private state: GameState;
  private realTimeAccumulator: number = 0;
  private lastDay: number = -1;
  private lastWeekDays: number = -1;
  private lastMonthDays: number = -1;

  constructor(initialState: GameState) {
    this.state = { ...initialState };
  }

  getState(): GameState {
    return { ...this.state };
  }

  tick(deltaTime: number): void {
    if (this.state.isPaused || this.state.gameOver) {
      return;
    }

    // Advance game time
    const gameTimeDelta = (deltaTime / 1000) * this.state.gameSpeed; // Convert ms to seconds, apply speed
    this.realTimeAccumulator += gameTimeDelta;
    
    // Game time advances in days (1 real second = 1 game day at 1x speed)
    const previousGameTime = this.state.currentTime;
    const newGameTime = this.state.currentTime + this.realTimeAccumulator;
    const currentDay = Math.floor(newGameTime);
    
    // Detect boundaries using real calendar dates
    const newDay = currentDay !== this.lastDay;
    const newWeek = isNewWeek(this.state.startDate, previousGameTime, newGameTime);
    const newMonth = isNewMonth(this.state.startDate, previousGameTime, newGameTime);

    // Update game time
    this.state.currentTime = newGameTime;

    // Process scheduled events
    this.processScheduledEvents();

    // Daily updates
    if (newDay) {
      this.updateDailySystems();
      this.lastDay = currentDay;
    }

    // Weekly updates
    if (newWeek) {
      this.updateWeeklySystems();
      this.lastWeekDays = newGameTime;
    }

    // Monthly updates (critical cycle)
    if (newMonth) {
      this.updateMonthlySystems();
      this.lastMonthDays = newGameTime;
    }

    // Continuous updates
    this.updateContinuousSystems();

    // Check random events
    if (newDay) {
      this.checkRandomEvents();
    }

    // Check game over
    this.checkGameOver();

    // Reset accumulator
    this.realTimeAccumulator = 0;
  }

  private updateDailySystems(): void {
    // Update product development progress (only if not paused and time is advancing)
    if (!this.state.isPaused) {
      this.state.product = updateProductSystem(this.state.product, this.state.team);
    }
    
    // Process queued player actions (hiring, funding, etc.)
    // This would be handled by actions from UI
    
    // Update UI indicators
    this.updateFinancialMetrics();
  }

  private updateWeeklySystems(): void {
    // Calculate weekly burn rate
    this.updateFinancialMetrics();
    
    // Update team morale/productivity modifiers (simplified for MVP)
    // Team productivity already calculated in financial metrics
  }

  private updateMonthlySystems(): void {
    // 0. Customer Lifecycle (must happen before revenue calculation)
    this.updateCustomerLifecycle();
    
    // 1. Financial Processing
    this.state.money = this.state.money - this.state.monthlyExpenses + this.state.monthlyRevenue;
    this.updateFinancialMetrics();
    
    // Update revenue history after calculating revenue
    this.updateRevenueHistory();

    // 2. Team Updates
    // Process pending hires (onboarding completion)
    this.state.team.employees.forEach(emp => {
      const daysSinceHire = this.state.currentTime - emp.hireDate;
      if (!emp.onboardingComplete && daysSinceHire >= 14) {
        emp.onboardingComplete = true;
      }
    });

    // 3. Product Updates (handled in daily, but milestones checked monthly)
    this.checkProductMilestones();

    // 4. Funding Updates
    if (this.state.funding.activeRound) {
      this.state.funding = updateFundingSystem(this.state.funding, this.state);
    }

    // 5. Event System
    this.state.events = updateEventSystem(this.state.events, this.state);
  }

  private updateContinuousSystems(): void {
    // Real-time clocks and displays updated via React state
    // Player input processed via action handlers
    // Progress indicators updated via React state
  }

  private updateFinancialMetrics(): void {
    // Recalculate expenses
    this.state.monthlyExpenses = calculateMonthlyExpenses(this.state.team.employees, this.state.offices.totalMonthlyCost);
    
    // Get product category from template
    const productTemplate = this.state.product.productTemplateId 
      ? getProductTemplate(this.state.product.productTemplateId)
      : null;
    const productCategory = productTemplate?.category || 'Productivity';
    
    // Calculate revenue from customers
    this.state.monthlyRevenue = calculateRevenueFromCustomers(
      this.state.customers.totalCustomers,
      this.state.product.currentMilestone,
      productCategory
    );

    // Recalculate burn rate and runway
    this.state.burnRate = calculateBurnRate(this.state.monthlyExpenses, this.state.monthlyRevenue);
    this.state.runway = calculateRunway(this.state.money, this.state.burnRate);

    // Update team stats
    this.state.team.totalMonthlySalary = this.state.team.employees.reduce((sum, e) => sum + e.salary, 0);
    this.state.team.totalProductivity = calculateTeamProductivity(this.state.team.employees);
  }

  private updateRevenueHistory(): void {
    // Add current month's revenue to history (keeps last 12 months)
    this.state.revenueHistory.push(this.state.monthlyRevenue);
    if (this.state.revenueHistory.length > 12) {
      this.state.revenueHistory.shift(); // Remove oldest month if more than 12
    }
  }

  private checkProductMilestones(): void {
    // Milestones are now calculated in updateProductSystem based on feature completion
    // This method is kept for compatibility but milestone calculation happens in productSystem.ts
    // No action needed here - stages are updated automatically when features are updated
  }

  private updateCustomerLifecycle(): void {
    // Get product category from template
    const productTemplate = this.state.product.productTemplateId 
      ? getProductTemplate(this.state.product.productTemplateId)
      : null;
    const productCategory = productTemplate?.category || 'Productivity';
    
    // Count active sales and marketing employees
    const salesCount = this.state.team.employees.filter(e => e.role === 'sales' && e.onboardingComplete).length;
    const marketingCount = this.state.team.employees.filter(e => e.role === 'marketing' && e.onboardingComplete).length;
    
    // 1. Calculate new customer acquisitions
    const monthlyAcquisitions = calculateCustomerAcquisitions(
      this.state.product.currentMilestone,
      productCategory,
      this.state.product.productMarketFit,
      salesCount,
      marketingCount
    );
    this.state.customers.monthlyAcquisitions = monthlyAcquisitions;
    
    // 2. Calculate churn (customers lost)
    const churnRate = calculateChurnRate(this.state.product.currentMilestone);
    const customersLost = Math.round(this.state.customers.totalCustomers * churnRate);
    this.state.customers.monthlyChurn = customersLost;
    
    // 3. Update total customer count
    this.state.customers.totalCustomers = Math.max(0, this.state.customers.totalCustomers + monthlyAcquisitions - customersLost);
  }

  private processScheduledEvents(): void {
    // Process events scheduled for current time
    const now = this.state.currentTime;
    this.state.events.pendingEvents = this.state.events.pendingEvents.filter(event => {
      if (event.expiresAt && now > event.expiresAt) {
        // Event expired, remove it
        return false;
      }
      return true;
    });
  }

  private checkRandomEvents(): void {
    // Simple random event generation (1-3 events per month)
    const daysSinceLastEvent = this.state.currentTime - this.state.events.lastEventTime;
    if (daysSinceLastEvent >= 10 && Math.random() < 0.3) {
      // Generate a random event (simplified for MVP)
      // Full event system implemented in eventSystem.ts
      this.state.events.lastEventTime = this.state.currentTime;
    }
  }

  private checkGameOver(): void {
    if (this.state.money <= 0 && this.state.runway <= 0) {
      this.state.gameOver = true;
      this.state.gameOverReason = 'Bankruptcy - You ran out of money!';
    }
  }

  // Action handlers
  setPaused(paused: boolean): void {
    this.state.isPaused = paused;
  }

  setGameSpeed(speed: number): void {
    this.state.gameSpeed = speed;
  }

  hireEmployee(candidateId: string): boolean {
    const candidate = this.state.team.candidatePool.find(c => c.id === candidateId);
    if (!candidate) return false;

    // Check office capacity
    if (this.state.team.employees.length >= this.state.offices.totalCapacity) {
      return false; // No office space available
    }

    const hiringCost = 3000 + candidate.expectedSalary; // Recruiting fee + first month
    if (this.state.money < hiringCost) return false;

    this.state.money -= hiringCost;

    const employee = {
      id: `emp-${Date.now()}`,
      name: candidate.name,
      role: candidate.role,
      salary: candidate.expectedSalary,
      productivity: candidate.productivity,
      hireDate: this.state.currentTime,
      onboardingComplete: false,
    };

    this.state.team.employees.push(employee);
    this.state.team.candidatePool = this.state.team.candidatePool.filter(c => c.id !== candidateId);
    this.updateFinancialMetrics();
    return true;
  }

  purchaseOffice(tier: 'coworking' | 'small' | 'medium' | 'large'): boolean {
    const { OFFICE_TIERS } = require('@/types/office');
    const officeTier = OFFICE_TIERS[tier];
    const cost = officeTier.monthlyCost * 3; // 3 months upfront payment
    
    if (this.state.money < cost) return false;
    
    this.state.money -= cost;
    
    const newOffice = {
      id: `office-${Date.now()}`,
      tier,
      capacity: officeTier.capacity,
      monthlyCost: officeTier.monthlyCost,
      name: officeTier.name,
      description: officeTier.description,
    };
    
    this.state.offices.offices.push(newOffice);
    this.state.offices.totalCapacity += officeTier.capacity;
    this.state.offices.totalMonthlyCost += officeTier.monthlyCost;
    
    this.updateFinancialMetrics();
    return true;
  }

  fireEmployee(employeeId: string): void {
    this.state.team.employees = this.state.team.employees.filter(e => e.id !== employeeId);
    this.updateFinancialMetrics();
  }

  prioritizeFeature(featureId: string, newPriority: number): void {
    const feature = this.state.product.features.find(f => f.id === featureId);
    if (!feature) return;
    
    // Clamp priority to valid range
    const minPriority = 1;
    const maxPriority = this.state.product.features.length;
    const targetPriority = Math.max(minPriority, Math.min(maxPriority, newPriority));
    
    // If priority didn't change, do nothing
    if (feature.priority === targetPriority) return;
    
    // Find the feature that currently has the target priority
    const featureToSwap = this.state.product.features.find(f => f.id !== featureId && f.priority === targetPriority);
    
    if (featureToSwap) {
      // Swap priorities
      const oldPriority = feature.priority;
      feature.priority = targetPriority;
      featureToSwap.priority = oldPriority;
    } else {
      // No feature at target priority, just update this feature
      feature.priority = targetPriority;
    }
    
    // Re-sort features by priority
    this.state.product.features.sort((a, b) => a.priority - b.priority);
  }

  startFundraising(roundType: 'seed' | 'seriesA' | 'seriesB' | 'seriesC' | 'seriesD'): boolean {
    if (this.state.funding.activeRound) return false;

    // Check revenue requirements for Series A and above
    if (roundType !== 'seed') {
      const { getRevenueRequirement } = require('./fundingSystem');
      const revenueRequirement = getRevenueRequirement(roundType);
      if (this.state.monthlyRevenue < revenueRequirement) {
        return false; // Revenue requirement not met
      }
    }

    // Check if previous rounds were completed (can't skip rounds)
    const completedRounds = this.state.funding.rounds.filter(r => r.status === 'completed');
    const lastCompletedRound = completedRounds[completedRounds.length - 1];
    
    const roundOrder: Array<'seed' | 'seriesA' | 'seriesB' | 'seriesC' | 'seriesD'> = ['seed', 'seriesA', 'seriesB', 'seriesC', 'seriesD'];
    const roundIndex = roundOrder.indexOf(roundType);
    
    if (roundIndex > 0 && !lastCompletedRound) {
      return false; // Can't start Series A+ without completing seed
    }
    
    if (lastCompletedRound) {
      const lastRoundIndex = roundOrder.indexOf(lastCompletedRound.roundType);
      if (roundIndex > lastRoundIndex + 1) {
        return false; // Can't skip rounds
      }
    }

    const round = {
      id: `round-${Date.now()}`,
      roundType,
      status: 'inProgress' as const,
      startedAt: this.state.currentTime,
      offers: [],
      investorInterest: this.calculateInvestorInterest(),
    };

    this.state.funding.activeRound = round;
    this.state.funding.rounds.push(round);
    return true;
  }

  acceptFundingOffer(offerId: string): boolean {
    const round = this.state.funding.activeRound;
    if (!round) return false;

    const offer = round.offers.find(o => o.id === offerId);
    if (!offer) return false;

    this.state.money += offer.amount;
    this.state.funding.totalEquity -= offer.equityPercent;
    this.state.funding.totalRaised += offer.amount;
    round.status = 'completed';
    this.state.funding.activeRound = null;
    this.updateFinancialMetrics();
    return true;
  }

  respondToEvent(eventId: string, optionId: string): void {
    const event = this.state.events.pendingEvents.find(e => e.id === eventId);
    if (!event) return;

    const option = event.options.find(o => o.id === optionId);
    if (!option) return;

    // Apply effects
    option.effects.forEach(effect => {
      switch (effect.type) {
        case 'money':
          this.state.money += effect.value;
          break;
        case 'expense':
          // Modify employee salaries or expenses
          break;
        case 'product':
          this.state.product.overallProgress = Math.max(0, Math.min(100, this.state.product.overallProgress + effect.value));
          break;
      }
    });

    // Move to history
    this.state.events.pendingEvents = this.state.events.pendingEvents.filter(e => e.id !== eventId);
    this.state.events.eventHistory.push(event);
    this.updateFinancialMetrics();
  }

  setProductFromTemplate(productId: string): void {
    const template = getProductTemplate(productId);
    if (!template) return;

    // Only allow setting product if it hasn't been set yet (productTemplateId is undefined)
    // or if we're at the very beginning (no progress)
    if (this.state.product.productTemplateId && this.state.product.overallProgress > 0) {
      return; // Product already selected and development started
    }

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

    this.state.product = {
      overallProgress: 0,
      currentMilestone: 'idea',
      features,
      maturity: 0,
      quality: 0.5,
      productMarketFit: 0,
      productTemplateId: template.id,
    };
  }

  private calculateInvestorInterest(): number {
    // Milestone-based multipliers (primary factor)
    const milestoneMultipliers: Record<string, number> = {
      'idea': 0.1,        // Very low interest - just an idea
      'mvp': 0.3,        // Some interest - proof of concept
      'validated': 0.6,  // Good interest - product validated
      'growing': 0.85,   // High interest - growing traction
      'mature': 1.0      // Maximum interest - mature product
    };
    
    const milestoneMultiplier = milestoneMultipliers[this.state.product.currentMilestone] || 0.1;
    
    // Additional factors
    const productProgressScore = this.state.product.overallProgress / 100;
    const teamScore = Math.min(1, this.state.team.employees.length / 10);
    const revenueScore = Math.min(1, this.state.monthlyRevenue / 50000);
    
    // Milestone is the primary factor (50%), then progress/team/revenue share the rest
    const baseInterest = milestoneMultiplier * 0.5 + 
                         (productProgressScore * 0.2 + teamScore * 0.15 + revenueScore * 0.15);
    
    // Cap at 1.0
    return Math.min(1.0, baseInterest);
  }
}
