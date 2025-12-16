export type EmployeeRole = 'engineer' | 'designer' | 'sales' | 'marketing' | 'operations' | 'cofounder' | 'cto';
export type EngineerSubclass = 'frontend' | 'backend';
export type DesignerSubclass = 'product' | 'visual';
export type RoleSubclass = EngineerSubclass | DesignerSubclass;

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  roleSubclass?: RoleSubclass; // For engineers and designers
  salary: number; // Monthly salary
  productivity: number; // 0-1 rating
  hireDate: number; // Game time when hired
  onboardingComplete: boolean;
  equityPercent?: number; // For co-founders
  assignedFeatureId?: string; // Feature this employee is assigned to
  experienceLevel: 'junior' | 'mid' | 'senior'; // Experience level
}

export interface Candidate {
  id: string;
  name: string;
  role: EmployeeRole;
  roleSubclass?: RoleSubclass; // For engineers and designers
  expectedSalary: number;
  productivity: number; // 0-1 rating
  experienceLevel: 'junior' | 'mid' | 'senior';
}

export interface HiringSearch {
  id: string;
  role: EmployeeRole;
  roleSubclass?: RoleSubclass; // Required for engineers and designers
  recruiterId: string; // Employee ID handling the search (founder or CTO)
  startedAt: number; // Game time when search started
  candidates: Candidate[]; // Generated candidates (empty initially, trickle in over 2 months)
  status: 'active' | 'completed';
}

export interface TeamState {
  employees: Employee[];
  candidatePool: Candidate[]; // Legacy - will be phased out in favor of hiring searches
  activeHiringSearches: HiringSearch[];
  totalMonthlySalary: number;
  totalProductivity: number;
}
