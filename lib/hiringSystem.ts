import { HiringSearch, Candidate, EmployeeRole, RoleSubclass } from '@/types/employee';

const HIRING_SEARCH_DURATION = 60; // 2 months = 60 days
const CANDIDATE_GENERATION_INTERVAL = 7; // Generate candidates every 7 days (1-2 per week)

/**
 * Start a new hiring search
 */
export function startHiringSearch(
  role: EmployeeRole,
  roleSubclass: RoleSubclass | undefined,
  recruiterId: string,
  gameTime: number
): HiringSearch {
  return {
    id: `search-${Date.now()}-${Math.random()}`,
    role,
    roleSubclass,
    recruiterId,
    startedAt: gameTime,
    candidates: [],
    status: 'active',
  };
}

/**
 * Update hiring searches - generates candidates over 2 months
 * Candidates trickle in: 1-2 candidates per week
 */
export function updateHiringSearches(searches: HiringSearch[], gameTime: number): HiringSearch[] {
  return searches.map(search => {
    if (search.status === 'completed') {
      return search;
    }

    const daysElapsed = gameTime - search.startedAt;
    
    // Complete search after 60 days
    if (daysElapsed >= HIRING_SEARCH_DURATION) {
      return {
        ...search,
        status: 'completed' as const,
      };
    }

    // Generate candidates every 7 days
    const weeksElapsed = Math.floor(daysElapsed / CANDIDATE_GENERATION_INTERVAL);
    const expectedCandidates = weeksElapsed * 1.5; // Average 1.5 candidates per week
    
    // Generate 1-2 candidates per week
    if (search.candidates.length < expectedCandidates) {
      const candidatesToGenerate = Math.min(
        Math.floor(Math.random() * 2) + 1, // 1-2 candidates
        Math.ceil(expectedCandidates) - search.candidates.length
      );
      
      const newCandidates = generateCandidatesForRole(
        search.role,
        search.roleSubclass,
        candidatesToGenerate,
        search.candidates.length
      );
      
      return {
        ...search,
        candidates: [...search.candidates, ...newCandidates],
      };
    }

    return search;
  });
}

/**
 * Generate candidates for a specific role and subclass
 */
export function generateCandidatesForRole(
  role: EmployeeRole,
  subclass: RoleSubclass | undefined,
  count: number,
  existingCount: number = 0
): Candidate[] {
  const candidates: Candidate[] = [];
  
  for (let i = 0; i < count; i++) {
    const experienceLevel = getRandomExperienceLevel(role);
    const candidate = generateCandidate(role, subclass, experienceLevel, existingCount + i);
    candidates.push(candidate);
  }
  
  return candidates;
}

function generateCandidate(
  role: EmployeeRole,
  subclass: RoleSubclass | undefined,
  experienceLevel: 'junior' | 'mid' | 'senior',
  index: number
): Candidate {
  let salary: number;
  let productivity: number;
  let roleSubclass: RoleSubclass | undefined = subclass;

  // Co-founder/CTO candidates are always senior and have special attributes
  if (role === 'cto' || role === 'cofounder') {
    salary = 8000 + Math.random() * 4000; // $8k-$12k/month (co-founder salary range)
    productivity = 0.9 + Math.random() * 0.1; // High productivity (0.9-1.0)
    return {
      id: `candidate-${Date.now()}-${index}`,
      name: generateRandomName(),
      role: 'cto' as const,
      roleSubclass: undefined, // Co-founders don't have subclasses
      expectedSalary: Math.round(salary),
      productivity: Math.round(productivity * 100) / 100,
      experienceLevel: 'senior' as const, // Co-founders are always senior
    };
  }

  // Determine subclass if not provided (for engineers and designers)
  if ((role === 'engineer' || role === 'designer') && !subclass) {
    if (role === 'engineer') {
      roleSubclass = Math.random() > 0.5 ? 'frontend' : 'backend';
    } else {
      roleSubclass = Math.random() > 0.5 ? 'product' : 'visual';
    }
  }

  // Set salary and productivity based on role and experience
  switch (experienceLevel) {
    case 'junior':
      if (role === 'engineer') {
        salary = 6000 + Math.random() * 2000; // $6k-$8k
        productivity = 0.5 + Math.random() * 0.2; // 0.5-0.7
      } else if (role === 'designer') {
        salary = 5000 + Math.random() * 2000; // $5k-$7k
        productivity = 0.5 + Math.random() * 0.2; // 0.5-0.7
      } else {
        salary = 4000 + Math.random() * 2000; // $4k-$6k
        productivity = 0.5 + Math.random() * 0.2; // 0.5-0.7
      }
      break;
    case 'mid':
      if (role === 'engineer') {
        salary = 10000 + Math.random() * 3000; // $10k-$13k
        productivity = 0.7 + Math.random() * 0.2; // 0.7-0.9
      } else if (role === 'designer') {
        salary = 8000 + Math.random() * 3000; // $8k-$11k
        productivity = 0.7 + Math.random() * 0.2; // 0.7-0.9
      } else {
        salary = 6000 + Math.random() * 3000; // $6k-$9k
        productivity = 0.7 + Math.random() * 0.2; // 0.7-0.9
      }
      break;
    case 'senior':
      if (role === 'engineer') {
        salary = 14000 + Math.random() * 4000; // $14k-$18k
        productivity = 0.85 + Math.random() * 0.15; // 0.85-1.0
      } else if (role === 'designer') {
        salary = 11000 + Math.random() * 4000; // $11k-$15k
        productivity = 0.85 + Math.random() * 0.15; // 0.85-1.0
      } else {
        salary = 9000 + Math.random() * 4000; // $9k-$13k
        productivity = 0.85 + Math.random() * 0.15; // 0.85-1.0
      }
      break;
  }

  return {
    id: `candidate-${Date.now()}-${index}`,
    name: generateRandomName(),
    role,
    roleSubclass,
    expectedSalary: Math.round(salary),
    productivity: Math.round(productivity * 100) / 100,
    experienceLevel,
  };
}

function getRandomExperienceLevel(role?: EmployeeRole): 'junior' | 'mid' | 'senior' {
  // Co-founders are always senior
  if (role === 'cto' || role === 'cofounder') {
    return 'senior';
  }
  
  const rand = Math.random();
  if (rand < 0.4) return 'junior';
  if (rand < 0.8) return 'mid';
  return 'senior';
}

function generateRandomName(): string {
  const firstNames = [
    'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn',
    'Sam', 'Jamie', 'Cameron', 'Dakota', 'Skylar', 'Blake', 'Sage', 'River',
    'Phoenix', 'Rowan', 'Finley', 'Hayden', 'Reese', 'Drew', 'Logan', 'Noah'
  ];
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Jackson',
    'White', 'Harris', 'Martin', 'Thompson', 'Moore', 'Young', 'King', 'Lee'
  ];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

/**
 * Complete a hiring search (mark as completed)
 */
export function completeHiringSearch(search: HiringSearch): HiringSearch {
  return {
    ...search,
    status: 'completed',
  };
}
