import { EventState, GameEvent } from '@/types/events';
import { GameState } from '@/types/game';

export function updateEventSystem(events: EventState, gameState: GameState): EventState {
  const updated = { ...events };
  
  // Generate random events (1-3 per month, probability-based)
  const daysSinceLastEvent = gameState.currentTime - updated.lastEventTime;
  const shouldGenerateEvent = daysSinceLastEvent >= 10 && Math.random() < 0.3;
  
  if (shouldGenerateEvent && updated.pendingEvents.length < 3) {
    const newEvent = generateRandomEvent(gameState);
    if (newEvent) {
      updated.pendingEvents.push(newEvent);
      updated.lastEventTime = gameState.currentTime;
    }
  }
  
  // Remove expired events
  updated.pendingEvents = updated.pendingEvents.filter(event => {
    if (event.expiresAt && gameState.currentTime > event.expiresAt) {
      return false;
    }
    return true;
  });
  
  return updated;
}

function generateRandomEvent(gameState: GameState): GameEvent | null {
  // Check if co-founder exists and roll for rare co-founder event (5% chance)
  const hasCofounder = gameState.team.employees.some(e => e.role === 'cto' || e.role === 'cofounder');
  if (hasCofounder && Math.random() < 0.05) {
    return generateCoFounderEvent(gameState);
  }

  const eventTypes = [
    generateHiringEvent,
    generateProductEvent,
    generateFinancialEvent,
    generateMarketEvent,
  ];
  
  const generator = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  return generator(gameState);
}

function generateHiringEvent(gameState: GameState): GameEvent {
  const events = [
    {
      id: `event-${Date.now()}-1`,
      type: 'team' as const,
      title: 'Tech Talent Market Crash',
      description: 'Due to market conditions, hiring costs have dropped significantly. Great time to hire!',
      options: [
        {
          id: 'hire-now',
          label: 'Hire Aggressively',
          description: 'Take advantage of low costs',
          effects: [
            {
              type: 'expense' as const,
              value: -0.2, // 20% reduction in hiring costs for 2 months
              description: 'Hiring costs reduced 20% for 2 months',
            },
          ],
        },
        {
          id: 'wait',
          label: 'Wait',
          description: 'Keep current strategy',
          effects: [],
        },
      ],
      triggeredAt: gameState.currentTime,
      expiresAt: gameState.currentTime + 7,
    },
    {
      id: `event-${Date.now()}-2`,
      type: 'team' as const,
      title: 'Key Employee Competing Offer',
      description: 'One of your key employees received a competing offer. They want a raise or they\'ll leave.',
      options: [
        {
          id: 'give-raise',
          label: 'Give Raise',
          description: 'Increase salary by $2k/month to retain them',
          effects: [
            {
              type: 'expense' as const,
              value: 2000,
              description: 'Monthly expenses increased by $2k',
            },
          ],
        },
        {
          id: 'let-go',
          label: 'Let Them Go',
          description: 'Accept the productivity loss',
          effects: [
            {
              type: 'product' as const,
              value: -5,
              description: 'Product development slowed',
            },
          ],
        },
      ],
      triggeredAt: gameState.currentTime,
      expiresAt: gameState.currentTime + 3,
    },
  ];
  
  return events[Math.floor(Math.random() * events.length)];
}

function generateProductEvent(gameState: GameState): GameEvent {
  return {
    id: `event-${Date.now()}-3`,
    type: 'product',
    title: 'Technical Breakthrough',
    description: 'Your team made a significant technical breakthrough!',
    options: [
      {
        id: 'boost',
        label: 'Apply Breakthrough',
        description: 'Accelerate product development',
        effects: [
          {
            type: 'product',
            value: 5,
            description: 'Product progress increased by 5%',
          },
        ],
      },
    ],
    triggeredAt: gameState.currentTime,
    expiresAt: gameState.currentTime + 1,
  };
}

function generateFinancialEvent(gameState: GameState): GameEvent {
  if (gameState.runway < 3) {
    return {
      id: `event-${Date.now()}-4`,
      type: 'financial',
      title: 'Emergency Funding Opportunity',
      description: 'An angel investor offers emergency funding at unfavorable terms due to your low runway.',
      options: [
        {
          id: 'take-emergency',
          label: 'Take Emergency Funding',
          description: 'Get $100k at 15% equity (poor terms)',
          effects: [
            {
              type: 'money',
              value: 100000,
              description: 'Received $100k',
            },
          ],
        },
        {
          id: 'decline',
          label: 'Decline',
          description: 'Try to survive without it',
          effects: [],
        },
      ],
      triggeredAt: gameState.currentTime,
      expiresAt: gameState.currentTime + 2,
    };
  }
  
  return {
    id: `event-${Date.now()}-5`,
    type: 'financial',
    title: 'Unexpected Expense',
    description: 'An unexpected legal fee of $5,000 is due.',
    options: [
      {
        id: 'pay',
        label: 'Pay It',
        description: 'Pay the fee',
        effects: [
          {
            type: 'money',
            value: -5000,
            description: 'Paid $5,000',
          },
        ],
      },
    ],
    triggeredAt: gameState.currentTime,
    expiresAt: gameState.currentTime + 1,
  };
}

function generateMarketEvent(gameState: GameState): GameEvent {
  return {
    id: `event-${Date.now()}-6`,
    type: 'market',
    title: 'Market Opportunity',
    description: 'A large enterprise customer is interested, but needs a custom feature built.',
    options: [
      {
        id: 'build-feature',
        label: 'Build Custom Feature',
        description: 'Spend 1 month dev time, get $50k contract',
        effects: [
          {
            type: 'product',
            value: -10, // Delay other features
            description: 'Other features delayed',
          },
          {
            type: 'money',
            value: 50000,
            description: 'Received $50k contract',
          },
        ],
      },
      {
        id: 'decline',
        label: 'Decline',
        description: 'Focus on core product',
        effects: [],
      },
    ],
    triggeredAt: gameState.currentTime,
    expiresAt: gameState.currentTime + 5,
  };
}

function generateCoFounderEvent(gameState: GameState): GameEvent {
  const cofounder = gameState.team.employees.find(e => e.role === 'cto' || e.role === 'cofounder');
  if (!cofounder) return generateHiringEvent(gameState); // Fallback if somehow no co-founder

  const events = [
    {
      id: `event-cofounder-${Date.now()}-1`,
      type: 'team' as const,
      title: 'Co-Founder Wants More Equity',
      description: `${cofounder.name} feels they deserve more equity given their contributions. They're asking for an additional 5% equity.`,
      options: [
        {
          id: 'give-equity',
          label: 'Grant Additional Equity',
          description: `Give ${cofounder.name} 5% more equity`,
          effects: [
            {
              type: 'expense' as const,
              value: 0, // Equity doesn't affect expenses, handled separately
              description: `${cofounder.name} now has ${(cofounder.equityPercent || 0) + 5}% equity`,
            },
          ],
        },
        {
          id: 'refuse',
          label: 'Refuse',
          description: 'Risk relationship damage',
          effects: [
            {
              type: 'product' as const,
              value: -10,
              description: 'Productivity decreased due to conflict',
            },
          ],
        },
      ],
      triggeredAt: gameState.currentTime,
      expiresAt: gameState.currentTime + 5,
    },
    {
      id: `event-cofounder-${Date.now()}-2`,
      type: 'team' as const,
      title: 'Co-Founder Considering Leaving',
      description: `${cofounder.name} has received an offer from another startup. They want either a significant raise ($3k/month) or more equity (3%) to stay.`,
      options: [
        {
          id: 'give-raise',
          label: 'Give Raise',
          description: `Increase ${cofounder.name}'s salary by $3k/month`,
          effects: [
            {
              type: 'expense' as const,
              value: 3000,
              description: 'Monthly expenses increased by $3k',
            },
          ],
        },
        {
          id: 'give-equity',
          label: 'Give More Equity',
          description: `Give ${cofounder.name} 3% more equity`,
          effects: [
            {
              type: 'expense' as const,
              value: 0,
              description: `${cofounder.name} now has ${(cofounder.equityPercent || 0) + 3}% equity`,
            },
          ],
        },
        {
          id: 'let-leave',
          label: 'Let Them Leave',
          description: 'Accept the loss of your co-founder',
          effects: [
            {
              type: 'product' as const,
              value: -20,
              description: 'Major productivity loss from losing co-founder',
            },
          ],
        },
      ],
      triggeredAt: gameState.currentTime,
      expiresAt: gameState.currentTime + 3,
    },
    {
      id: `event-cofounder-${Date.now()}-3`,
      type: 'team' as const,
      title: 'Co-Founder Conflict',
      description: `You and ${cofounder.name} have a disagreement about product direction. This is affecting team morale and productivity.`,
      options: [
        {
          id: 'compromise',
          label: 'Find Compromise',
          description: 'Spend time resolving the conflict',
          effects: [
            {
              type: 'product' as const,
              value: -5,
              description: 'Product development slowed while resolving conflict',
            },
          ],
        },
        {
          id: 'stand-ground',
          label: 'Stand Your Ground',
          description: 'Risk further conflict',
          effects: [
            {
              type: 'product' as const,
              value: -15,
              description: 'Productivity significantly decreased',
            },
          ],
        },
      ],
      triggeredAt: gameState.currentTime,
      expiresAt: gameState.currentTime + 2,
    },
    {
      id: `event-cofounder-${Date.now()}-4`,
      type: 'product' as const,
      title: 'Co-Founder Wants to Pivot',
      description: `${cofounder.name} believes the current product direction is wrong and wants to pivot to a different market. This would reset significant progress.`,
      options: [
        {
          id: 'pivot',
          label: 'Pivot',
          description: 'Reset product progress but potentially find better market fit',
          effects: [
            {
              type: 'product' as const,
              value: -30,
              description: 'Product progress reset due to pivot',
            },
          ],
        },
        {
          id: 'stay-course',
          label: 'Stay the Course',
          description: 'Continue with current direction',
          effects: [
            {
              type: 'product' as const,
              value: -5,
              description: 'Minor productivity loss from disagreement',
            },
          ],
        },
      ],
      triggeredAt: gameState.currentTime,
      expiresAt: gameState.currentTime + 7,
    },
  ];

  return events[Math.floor(Math.random() * events.length)];
}
