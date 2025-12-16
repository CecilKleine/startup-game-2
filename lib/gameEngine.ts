import { GameState } from '@/types/game';
import { ProductState, Feature, FeatureComponent } from '@/types/product';
import { calculateBurnRate, calculateRunway, calculateMonthlyExpenses, calculateTeamProductivity, calculateCustomerAcquisitions, calculateChurnRate, calculateRevenueFromCustomers } from './calculations';
import { updateProductSystem } from './productSystem';
import { updateEventSystem } from './eventSystem';
import { updateFundingSystem, getRevenueRequirement } from './fundingSystem';
import { getProductTemplate } from '@/types/productTemplates';
import { isNewMonth, isNewWeek, isWeekend, getCurrentGameDate, countWeekdaysInMonth, getDaysInMonth } from '@/utils/dateUtils';
import { generateComponentsForFeature } from '@/utils/componentGenerator';
import { generateFeatureRequirements } from './featureRequirements';
import { startHiringSearch, updateHiringSearches, completeHiringSearch } from './hiringSystem';
import { RoleSubclass, EmployeeRole } from '@/types/employee';
import { OFFICE_TIERS } from '@/types/office';

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
    // Update product development progress (only if not paused, time is advancing, and it's not a weekend)
    // Employees don't work on weekends
    if (!this.state.isPaused && !isWeekend(this.state.startDate, this.state.currentTime)) {
      this.state.product = updateProductSystem(this.state.product, this.state.team);
    }
    
    // Update hiring searches (generate candidates over time)
    this.state.team.activeHiringSearches = updateHiringSearches(
      this.state.team.activeHiringSearches,
      this.state.currentTime
    );
    
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
    // Employees don't work on weekends, so scale by weekday ratio
    const currentDate = getCurrentGameDate(this.state.startDate, this.state.currentTime);
    const weekdaysInMonth = countWeekdaysInMonth(currentDate);
    const daysInMonth = getDaysInMonth(currentDate);
    const weekdayRatio = daysInMonth > 0 ? weekdaysInMonth / daysInMonth : 1;
    
    const baseMonthlyAcquisitions = calculateCustomerAcquisitions(
      this.state.product.currentMilestone,
      productCategory,
      this.state.product.productMarketFit,
      salesCount,
      marketingCount
    );
    
    // Scale acquisitions by weekday ratio (employees only work weekdays)
    const monthlyAcquisitions = Math.round(baseMonthlyAcquisitions * weekdayRatio);
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

  hireEmployee(candidateId: string, searchId?: string): boolean {
    // Try to find candidate in active searches first, then fall back to candidate pool
    let candidate = null;
    let search = null;
    
    if (searchId) {
      search = this.state.team.activeHiringSearches.find(s => s.id === searchId);
      if (search) {
        candidate = search.candidates.find(c => c.id === candidateId);
      }
    }
    
    if (!candidate) {
      candidate = this.state.team.candidatePool.find(c => c.id === candidateId);
    }
    
    if (!candidate) return false;

    // Handle co-founder/CTO candidates differently - use hireCoFounder method
    if (candidate.role === 'cto' || candidate.role === 'cofounder') {
      // Check if co-founder already exists
      const existingCofounder = this.state.team.employees.find(e => e.role === 'cto' || e.role === 'cofounder');
      if (existingCofounder) {
        return false; // Already have a co-founder
      }

      // Calculate equity based on when they join
      const daysSinceStart = this.state.currentTime;
      let calculatedEquity: number;
      if (daysSinceStart <= 30) {
        calculatedEquity = 20 + Math.random() * 5; // 20-25%
      } else if (daysSinceStart <= 90) {
        calculatedEquity = 15 + Math.random() * 5; // 15-20%
      } else {
        calculatedEquity = 10 + Math.random() * 5; // 10-15%
      }
      calculatedEquity = Math.round(calculatedEquity * 10) / 10;

      // Check if player has enough equity
      if (this.state.funding.totalEquity - calculatedEquity < 0) {
        return false; // Not enough equity available
      }

      // No hiring cost for co-founders (they invest time/equity)
      const cofounder = {
        id: `cofounder-${Date.now()}`,
        name: candidate.name,
        role: 'cto' as const,
        salary: candidate.expectedSalary,
        productivity: candidate.productivity,
        hireDate: this.state.currentTime,
        onboardingComplete: true, // Co-founders start immediately productive
        equityPercent: calculatedEquity,
        experienceLevel: candidate.experienceLevel,
      };

      this.state.team.employees.push(cofounder);
      this.state.funding.cofounderEquity = calculatedEquity;
      this.state.funding.totalEquity -= calculatedEquity;
      
      // Remove from candidate pool or search
      if (search) {
        search.candidates = search.candidates.filter(c => c.id !== candidateId);
      } else {
        this.state.team.candidatePool = this.state.team.candidatePool.filter(c => c.id !== candidateId);
      }
      
      this.updateFinancialMetrics();
      return true;
    }

    // Regular employee hiring
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
      roleSubclass: candidate.roleSubclass,
      salary: candidate.expectedSalary,
      productivity: candidate.productivity,
      hireDate: this.state.currentTime,
      onboardingComplete: false,
      experienceLevel: candidate.experienceLevel,
    };

    this.state.team.employees.push(employee);
    
    // Remove from candidate pool or search
    if (search) {
      search.candidates = search.candidates.filter(c => c.id !== candidateId);
    } else {
      this.state.team.candidatePool = this.state.team.candidatePool.filter(c => c.id !== candidateId);
    }
    
    this.updateFinancialMetrics();
    return true;
  }

  startHiringSearch(role: EmployeeRole, subclass: RoleSubclass | undefined, recruiterId: string): boolean {
    // Check if trying to hire CTO when one already exists
    if (role === 'cto' || role === 'cofounder') {
      const existingCofounder = this.state.team.employees.find(e => e.role === 'cto' || e.role === 'cofounder');
      if (existingCofounder) {
        return false; // Already have a co-founder
      }
    }

    // Validate recruiter - only founder (player) or CTO can recruit
    const recruiter = this.state.team.employees.find(e => e.id === recruiterId);
    if (!recruiter) {
      // Player (founder) can always recruit (they don't have an employee record)
      // Check if it's a valid recruiter ID (could be 'founder' or similar)
      if (recruiterId !== 'founder') {
        return false;
      }
    } else {
      // Must be CTO/co-founder
      if (recruiter.role !== 'cto' && recruiter.role !== 'cofounder') {
        return false;
      }
    }

    // Validate role and subclass combination
    if ((role === 'engineer' || role === 'designer') && !subclass) {
      return false; // Engineers and designers require a subclass
    }
    if ((role !== 'engineer' && role !== 'designer') && subclass) {
      return false; // Other roles (except engineer/designer) don't have subclasses
    }

    // Check if recruiter is already handling too many searches (max 2)
    const activeSearchesByRecruiter = this.state.team.activeHiringSearches.filter(
      s => s.recruiterId === recruiterId && s.status === 'active'
    ).length;
    if (activeSearchesByRecruiter >= 2) {
      return false; // Recruiter is too busy
    }

    const search = startHiringSearch(role, subclass, recruiterId, this.state.currentTime);
    this.state.team.activeHiringSearches.push(search);
    return true;
  }

  cancelHiringSearch(searchId: string): boolean {
    const search = this.state.team.activeHiringSearches.find(s => s.id === searchId);
    if (!search || search.status === 'completed') {
      return false;
    }

    this.state.team.activeHiringSearches = this.state.team.activeHiringSearches.filter(
      s => s.id !== searchId
    );
    return true;
  }

  hireCoFounder(ctoName: string, equityPercent?: number): boolean {
    // Check if co-founder already exists
    const existingCofounder = this.state.team.employees.find(e => e.role === 'cofounder' || e.role === 'cto');
    if (existingCofounder) {
      return false; // Already have a co-founder
    }

    // Calculate equity based on when they join (earlier = more equity)
    // Day 0-30: 20-25%, Day 31-90: 15-20%, Day 91+: 10-15%
    let calculatedEquity = equityPercent;
    if (!calculatedEquity) {
      const daysSinceStart = this.state.currentTime;
      if (daysSinceStart <= 30) {
        calculatedEquity = 20 + Math.random() * 5; // 20-25%
      } else if (daysSinceStart <= 90) {
        calculatedEquity = 15 + Math.random() * 5; // 15-20%
      } else {
        calculatedEquity = 10 + Math.random() * 5; // 10-15%
      }
      calculatedEquity = Math.round(calculatedEquity * 10) / 10; // Round to 1 decimal
    }

    // Check if player has enough equity
    if (this.state.funding.totalEquity - calculatedEquity < 0) {
      return false; // Not enough equity available
    }

    // Co-founder salary (typically lower than market, but still substantial)
    const cofounderSalary = 8000 + Math.random() * 4000; // $8k-$12k/month

    const cofounder = {
      id: `cofounder-${Date.now()}`,
      name: ctoName,
      role: 'cto' as const,
      salary: cofounderSalary,
      productivity: 0.9 + Math.random() * 0.1, // High productivity (0.9-1.0)
      hireDate: this.state.currentTime,
      onboardingComplete: true, // Co-founders start immediately productive
      equityPercent: calculatedEquity,
      experienceLevel: 'senior' as const, // Co-founders are always senior
    };

    this.state.team.employees.push(cofounder);
    this.state.funding.cofounderEquity = calculatedEquity;
    this.state.funding.totalEquity -= calculatedEquity;
    
    this.updateFinancialMetrics();
    return true;
  }

  purchaseOffice(tier: 'coworking' | 'small' | 'medium' | 'large'): boolean {
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

    // Handle co-founder equity events specially
    if (event.id.startsWith('event-cofounder-')) {
      const cofounder = this.state.team.employees.find(e => e.role === 'cto' || e.role === 'cofounder');
      if (cofounder) {
        if (optionId === 'give-equity' && event.title.includes('More Equity')) {
          // Give 5% more equity
          const equityIncrease = 5;
          cofounder.equityPercent = (cofounder.equityPercent || 0) + equityIncrease;
          this.state.funding.cofounderEquity = cofounder.equityPercent;
          this.state.funding.totalEquity -= equityIncrease;
        } else if (optionId === 'give-equity' && event.title.includes('Considering Leaving')) {
          // Give 3% more equity
          const equityIncrease = 3;
          cofounder.equityPercent = (cofounder.equityPercent || 0) + equityIncrease;
          this.state.funding.cofounderEquity = cofounder.equityPercent;
          this.state.funding.totalEquity -= equityIncrease;
        } else if (optionId === 'give-raise' && event.title.includes('Considering Leaving')) {
          // Increase salary by $3k
          cofounder.salary += 3000;
        }
      }
    }

    // Apply effects
    option.effects.forEach(effect => {
      switch (effect.type) {
        case 'money':
          this.state.money += effect.value;
          break;
        case 'expense':
          // Modify employee salaries or expenses
          // For co-founder raise events, salary already updated above
          if (!event.id.startsWith('event-cofounder-') || optionId !== 'give-raise') {
            // Handle other expense effects here if needed
          }
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
        requirements: generateFeatureRequirements(ft.baseComplexity),
        assignedTeam: {
          employeeIds: [],
        },
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

  assignEmployeeToFeature(employeeId: string, featureId: string): boolean {
    const employee = this.state.team.employees.find(e => e.id === employeeId);
    const feature = this.state.product.features.find(f => f.id === featureId);
    
    if (!employee || !feature) return false;
    
    // Check if employee is already assigned to another feature
    if (employee.assignedFeatureId && employee.assignedFeatureId !== featureId) {
      // Unassign from previous feature
      const prevFeature = this.state.product.features.find(f => f.id === employee.assignedFeatureId);
      if (prevFeature) {
        prevFeature.assignedTeam.employeeIds = prevFeature.assignedTeam.employeeIds.filter(id => id !== employeeId);
      }
    }
    
    // Assign to new feature
    if (!feature.assignedTeam.employeeIds.includes(employeeId)) {
      feature.assignedTeam.employeeIds.push(employeeId);
    }
    employee.assignedFeatureId = featureId;
    
    return true;
  }

  unassignEmployeeFromFeature(employeeId: string, featureId: string): boolean {
    const feature = this.state.product.features.find(f => f.id === featureId);
    const employee = this.state.team.employees.find(e => e.id === employeeId);
    
    if (!feature || !employee) return false;
    
    feature.assignedTeam.employeeIds = feature.assignedTeam.employeeIds.filter(id => id !== employeeId);
    if (employee.assignedFeatureId === featureId) {
      employee.assignedFeatureId = undefined;
    }
    
    return true;
  }

  autoAssignTeams(): void {
    // Get all incomplete features sorted by priority
    const incompleteFeatures = this.state.product.features
      .filter(f => f.progress < 100)
      .sort((a, b) => a.priority - b.priority);
    
    // Get all available employees (not assigned or can be reassigned)
    const availableEmployees = this.state.team.employees.filter(e => e.onboardingComplete);
    
    // Track which employees are assigned
    const assignedEmployeeIds = new Set<string>();
    
    // For each feature, try to auto-assign employees matching requirements
    incompleteFeatures.forEach(feature => {
      const requirements = feature.requirements;
      const currentAssignments = feature.assignedTeam.employeeIds;
      
      // Count current assignments by type
      const assignedEngineers = currentAssignments
        .map(id => availableEmployees.find(e => e.id === id))
        .filter((e): e is typeof availableEmployees[0] => e !== undefined)
        .filter(e => e.role === 'engineer' || e.role === 'cto' || e.role === 'cofounder');
      
      // CTOs count as both frontend and backend
      const ctoCount = assignedEngineers.filter(e => e.role === 'cto' || e.role === 'cofounder').length;
      const frontendOnlyCount = assignedEngineers.filter(e => e.role === 'engineer' && e.roleSubclass === 'frontend').length;
      const backendOnlyCount = assignedEngineers.filter(e => e.role === 'engineer' && e.roleSubclass === 'backend').length;
      const currentFrontend = frontendOnlyCount + ctoCount;
      const currentBackend = backendOnlyCount + ctoCount;
      
      const currentDesigners = currentAssignments
        .map(id => availableEmployees.find(e => e.id === id))
        .filter((e): e is typeof availableEmployees[0] => e !== undefined)
        .filter(e => e.role === 'designer');
      
      const currentProduct = currentDesigners.filter(e => e.roleSubclass === 'product');
      const currentVisual = currentDesigners.filter(e => e.roleSubclass === 'visual');
      
      // Calculate what's needed for frontend and backend
      const neededFrontend = Math.max(0, (requirements.requiredEngineers.frontend || 0) - currentFrontend);
      const neededBackend = Math.max(0, (requirements.requiredEngineers.backend || 0) - currentBackend);
      
      // CTOs count as both frontend AND backend simultaneously
      // Assign CTOs first (they satisfy both requirements at once)
      // Assign up to the minimum of what's needed for frontend/backend
      const ctoNeeded = Math.min(neededFrontend, neededBackend);
      if (ctoNeeded > 0) {
        const ctoCandidates = availableEmployees
          .filter(e => 
            !assignedEmployeeIds.has(e.id) &&
            (e.role === 'cto' || e.role === 'cofounder') &&
            meetsSeniorityRequirement(e, requirements.minSeniority)
          )
          .sort((a, b) => b.productivity - a.productivity)
          .slice(0, ctoNeeded);
        
        ctoCandidates.forEach(emp => {
          this.assignEmployeeToFeature(emp.id, feature.id);
          assignedEmployeeIds.add(emp.id);
        });
      }
      
      // Recalculate after CTO assignments (CTOs count toward both)
      const updatedAssignedEngineers = feature.assignedTeam.employeeIds
        .map(id => availableEmployees.find(e => e.id === id))
        .filter((e): e is typeof availableEmployees[0] => e !== undefined)
        .filter(e => e.role === 'engineer' || e.role === 'cto' || e.role === 'cofounder');
      
      const updatedCtoCount = updatedAssignedEngineers.filter(e => e.role === 'cto' || e.role === 'cofounder').length;
      const updatedFrontendOnlyCount = updatedAssignedEngineers.filter(e => e.role === 'engineer' && e.roleSubclass === 'frontend').length;
      const updatedBackendOnlyCount = updatedAssignedEngineers.filter(e => e.role === 'engineer' && e.roleSubclass === 'backend').length;
      const updatedCurrentFrontend = updatedFrontendOnlyCount + updatedCtoCount;
      const updatedCurrentBackend = updatedBackendOnlyCount + updatedCtoCount;
      const stillNeededFrontend = Math.max(0, (requirements.requiredEngineers.frontend || 0) - updatedCurrentFrontend);
      const stillNeededBackend = Math.max(0, (requirements.requiredEngineers.backend || 0) - updatedCurrentBackend);
      
      // Fill remaining frontend slots with frontend engineers
      if (stillNeededFrontend > 0) {
        const frontendCandidates = availableEmployees
          .filter(e => 
            !assignedEmployeeIds.has(e.id) &&
            e.role === 'engineer' &&
            e.roleSubclass === 'frontend' &&
            meetsSeniorityRequirement(e, requirements.minSeniority)
          )
          .sort((a, b) => b.productivity - a.productivity)
          .slice(0, stillNeededFrontend);
        
        frontendCandidates.forEach(emp => {
          this.assignEmployeeToFeature(emp.id, feature.id);
          assignedEmployeeIds.add(emp.id);
        });
      }
      
      // Fill remaining backend slots with backend engineers
      if (stillNeededBackend > 0) {
        const backendCandidates = availableEmployees
          .filter(e => 
            !assignedEmployeeIds.has(e.id) &&
            e.role === 'engineer' &&
            e.roleSubclass === 'backend' &&
            meetsSeniorityRequirement(e, requirements.minSeniority)
          )
          .sort((a, b) => b.productivity - a.productivity)
          .slice(0, stillNeededBackend);
        
        backendCandidates.forEach(emp => {
          this.assignEmployeeToFeature(emp.id, feature.id);
          assignedEmployeeIds.add(emp.id);
        });
      }
      
      // Assign product designers if needed
      const neededProduct = (requirements.requiredDesigners.product || 0) - currentProduct.length;
      if (neededProduct > 0) {
        const productCandidates = availableEmployees
          .filter(e => 
            !assignedEmployeeIds.has(e.id) &&
            e.role === 'designer' &&
            e.roleSubclass === 'product' &&
            meetsSeniorityRequirement(e, requirements.minSeniority)
          )
          .sort((a, b) => b.productivity - a.productivity)
          .slice(0, neededProduct);
        
        productCandidates.forEach(emp => {
          this.assignEmployeeToFeature(emp.id, feature.id);
          assignedEmployeeIds.add(emp.id);
        });
      }
      
      // Assign visual designers if needed
      const neededVisual = (requirements.requiredDesigners.visual || 0) - currentVisual.length;
      if (neededVisual > 0) {
        const visualCandidates = availableEmployees
          .filter(e => 
            !assignedEmployeeIds.has(e.id) &&
            e.role === 'designer' &&
            e.roleSubclass === 'visual' &&
            meetsSeniorityRequirement(e, requirements.minSeniority)
          )
          .sort((a, b) => b.productivity - a.productivity)
          .slice(0, neededVisual);
        
        visualCandidates.forEach(emp => {
          this.assignEmployeeToFeature(emp.id, feature.id);
          assignedEmployeeIds.add(emp.id);
        });
      }
    });
  }

  private meetsSeniorityRequirement(employee: Employee, minSeniority: 'junior' | 'mid' | 'senior'): boolean {
    const seniorityOrder = { junior: 0, mid: 1, senior: 2 };
    return seniorityOrder[employee.experienceLevel] >= seniorityOrder[minSeniority];
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
