/**
 * Helper function to generate components for a feature based on its complexity
 * This creates a realistic breakdown of work items
 */

import { ComponentTemplate } from '@/types/productTemplates';

export function generateComponentsForFeature(
  featureId: string,
  featureName: string,
  baseComplexity: number
): ComponentTemplate[] {
  // Component definitions for each feature
  const componentDefinitions: Record<string, ComponentTemplate[]> = {
    'auth': [
      { id: 'auth-1', name: 'User Registration', baseComplexity: 2, estimatedDays: 3 },
      { id: 'auth-2', name: 'Login & Session Management', baseComplexity: 3, estimatedDays: 4 },
      { id: 'auth-3', name: 'Password Reset Flow', baseComplexity: 2, estimatedDays: 3 },
      { id: 'auth-4', name: 'Role-Based Access Control', baseComplexity: 4, estimatedDays: 5 },
      { id: 'auth-5', name: 'User Profile Management', baseComplexity: 2, estimatedDays: 3 },
    ],
    'contacts': [
      { id: 'contacts-1', name: 'Contact Database Schema', baseComplexity: 3, estimatedDays: 4 },
      { id: 'contacts-2', name: 'CRUD Operations', baseComplexity: 3, estimatedDays: 4 },
      { id: 'contacts-3', name: 'Contact Search & Filtering', baseComplexity: 4, estimatedDays: 5 },
      { id: 'contacts-4', name: 'Contact Import/Export', baseComplexity: 4, estimatedDays: 5 },
      { id: 'contacts-5', name: 'Contact History Tracking', baseComplexity: 3, estimatedDays: 4 },
    ],
    'pipeline': [
      { id: 'pipeline-1', name: 'Deal Stage Management', baseComplexity: 3, estimatedDays: 4 },
      { id: 'pipeline-2', name: 'Visual Pipeline Board', baseComplexity: 5, estimatedDays: 6 },
      { id: 'pipeline-3', name: 'Deal Value Tracking', baseComplexity: 2, estimatedDays: 3 },
      { id: 'pipeline-4', name: 'Sales Forecasting', baseComplexity: 6, estimatedDays: 7 },
      { id: 'pipeline-5', name: 'Pipeline Analytics', baseComplexity: 4, estimatedDays: 5 },
    ],
    'email': [
      { id: 'email-1', name: 'Email API Integration', baseComplexity: 5, estimatedDays: 6 },
      { id: 'email-2', name: 'Email Sync Service', baseComplexity: 6, estimatedDays: 7 },
      { id: 'email-3', name: 'Thread Management', baseComplexity: 4, estimatedDays: 5 },
      { id: 'email-4', name: 'Email Templates', baseComplexity: 3, estimatedDays: 4 },
      { id: 'email-5', name: 'Email Tracking', baseComplexity: 4, estimatedDays: 5 },
    ],
    'ai-scoring': [
      { id: 'ai-scoring-1', name: 'Data Collection Pipeline', baseComplexity: 5, estimatedDays: 6 },
      { id: 'ai-scoring-2', name: 'Feature Engineering', baseComplexity: 6, estimatedDays: 7 },
      { id: 'ai-scoring-3', name: 'ML Model Training', baseComplexity: 7, estimatedDays: 8 },
      { id: 'ai-scoring-4', name: 'Scoring API', baseComplexity: 5, estimatedDays: 6 },
      { id: 'ai-scoring-5', name: 'Model Monitoring & Retraining', baseComplexity: 6, estimatedDays: 7 },
    ],
    'reporting': [
      { id: 'reporting-1', name: 'Data Aggregation Layer', baseComplexity: 4, estimatedDays: 5 },
      { id: 'reporting-2', name: 'Dashboard Framework', baseComplexity: 5, estimatedDays: 6 },
      { id: 'reporting-3', name: 'Chart Components', baseComplexity: 4, estimatedDays: 5 },
      { id: 'reporting-4', name: 'Custom Report Builder', baseComplexity: 6, estimatedDays: 7 },
      { id: 'reporting-5', name: 'Report Export', baseComplexity: 3, estimatedDays: 4 },
    ],
    'api': [
      { id: 'api-1', name: 'REST API Design', baseComplexity: 4, estimatedDays: 5 },
      { id: 'api-2', name: 'Authentication & Authorization', baseComplexity: 5, estimatedDays: 6 },
      { id: 'api-3', name: 'API Endpoints', baseComplexity: 5, estimatedDays: 6 },
      { id: 'api-4', name: 'Rate Limiting', baseComplexity: 4, estimatedDays: 5 },
      { id: 'api-5', name: 'API Documentation', baseComplexity: 3, estimatedDays: 4 },
    ],
    'mobile': [
      { id: 'mobile-1', name: 'Mobile App Architecture', baseComplexity: 5, estimatedDays: 6 },
      { id: 'mobile-2', name: 'Core UI Components', baseComplexity: 4, estimatedDays: 5 },
      { id: 'mobile-3', name: 'API Integration', baseComplexity: 4, estimatedDays: 5 },
      { id: 'mobile-4', name: 'Offline Support', baseComplexity: 6, estimatedDays: 7 },
      { id: 'mobile-5', name: 'Push Notifications', baseComplexity: 5, estimatedDays: 6 },
    ],
    // Project Management Tool components
    'projects': [
      { id: 'projects-1', name: 'Project Structure', baseComplexity: 3, estimatedDays: 4 },
      { id: 'projects-2', name: 'Project CRUD', baseComplexity: 3, estimatedDays: 4 },
      { id: 'projects-3', name: 'Project Templates', baseComplexity: 4, estimatedDays: 5 },
      { id: 'projects-4', name: 'Project Settings', baseComplexity: 2, estimatedDays: 3 },
    ],
    'tasks': [
      { id: 'tasks-1', name: 'Task Management System', baseComplexity: 4, estimatedDays: 5 },
      { id: 'tasks-2', name: 'Task Dependencies', baseComplexity: 5, estimatedDays: 6 },
      { id: 'tasks-3', name: 'Task Filtering & Sorting', baseComplexity: 3, estimatedDays: 4 },
      { id: 'tasks-4', name: 'Bulk Task Operations', baseComplexity: 4, estimatedDays: 5 },
    ],
    'collaboration': [
      { id: 'collab-1', name: 'Real-time Collaboration Engine', baseComplexity: 7, estimatedDays: 8 },
      { id: 'collab-2', name: 'Comments System', baseComplexity: 4, estimatedDays: 5 },
      { id: 'collab-3', name: 'Mentions & Notifications', baseComplexity: 5, estimatedDays: 6 },
      { id: 'collab-4', name: 'Activity Feed', baseComplexity: 4, estimatedDays: 5 },
    ],
    'gantt': [
      { id: 'gantt-1', name: 'Gantt Chart Rendering', baseComplexity: 6, estimatedDays: 7 },
      { id: 'gantt-2', name: 'Timeline Calculations', baseComplexity: 5, estimatedDays: 6 },
      { id: 'gantt-3', name: 'Interactive Editing', baseComplexity: 6, estimatedDays: 7 },
      { id: 'gantt-4', name: 'Resource Allocation', baseComplexity: 5, estimatedDays: 6 },
    ],
    // Analytics Dashboard components
    'data-connections': [
      { id: 'data-1', name: 'Data Source Connectors', baseComplexity: 6, estimatedDays: 7 },
      { id: 'data-2', name: 'Data Pipeline', baseComplexity: 6, estimatedDays: 7 },
      { id: 'data-3', name: 'Data Transformation', baseComplexity: 5, estimatedDays: 6 },
      { id: 'data-4', name: 'Connection Management UI', baseComplexity: 4, estimatedDays: 5 },
    ],
    'visualizations': [
      { id: 'viz-1', name: 'Chart Library Integration', baseComplexity: 4, estimatedDays: 5 },
      { id: 'viz-2', name: 'Custom Chart Types', baseComplexity: 5, estimatedDays: 6 },
      { id: 'viz-3', name: 'Interactive Features', baseComplexity: 5, estimatedDays: 6 },
      { id: 'viz-4', name: 'Chart Customization', baseComplexity: 4, estimatedDays: 5 },
    ],
    'sql-query': [
      { id: 'sql-1', name: 'SQL Query Builder UI', baseComplexity: 6, estimatedDays: 7 },
      { id: 'sql-2', name: 'Query Execution Engine', baseComplexity: 7, estimatedDays: 8 },
      { id: 'sql-3', name: 'Query Validation', baseComplexity: 5, estimatedDays: 6 },
      { id: 'sql-4', name: 'Query History', baseComplexity: 3, estimatedDays: 4 },
    ],
    // AI Chatbot components
    'chat-interface': [
      { id: 'chat-1', name: 'Chat UI Components', baseComplexity: 4, estimatedDays: 5 },
      { id: 'chat-2', name: 'Real-time Messaging', baseComplexity: 5, estimatedDays: 6 },
      { id: 'chat-3', name: 'Message History', baseComplexity: 3, estimatedDays: 4 },
      { id: 'chat-4', name: 'File Attachments', baseComplexity: 4, estimatedDays: 5 },
    ],
    'nlp': [
      { id: 'nlp-1', name: 'Intent Recognition', baseComplexity: 7, estimatedDays: 8 },
      { id: 'nlp-2', name: 'Entity Extraction', baseComplexity: 6, estimatedDays: 7 },
      { id: 'nlp-3', name: 'Context Management', baseComplexity: 6, estimatedDays: 7 },
      { id: 'nlp-4', name: 'Multi-language Support', baseComplexity: 5, estimatedDays: 6 },
    ],
    'bot-builder': [
      { id: 'builder-1', name: 'Flow Designer UI', baseComplexity: 6, estimatedDays: 7 },
      { id: 'builder-2', name: 'Node System', baseComplexity: 5, estimatedDays: 6 },
      { id: 'builder-3', name: 'Conditional Logic', baseComplexity: 5, estimatedDays: 6 },
      { id: 'builder-4', name: 'Testing Environment', baseComplexity: 4, estimatedDays: 5 },
    ],
    // HR Management components
    'employee-db': [
      { id: 'emp-1', name: 'Employee Database Schema', baseComplexity: 4, estimatedDays: 5 },
      { id: 'emp-2', name: 'Employee Profiles', baseComplexity: 3, estimatedDays: 4 },
      { id: 'emp-3', name: 'Directory & Search', baseComplexity: 3, estimatedDays: 4 },
      { id: 'emp-4', name: 'Org Chart', baseComplexity: 5, estimatedDays: 6 },
    ],
    'time-tracking': [
      { id: 'time-1', name: 'Time Entry System', baseComplexity: 4, estimatedDays: 5 },
      { id: 'time-2', name: 'Timesheet Management', baseComplexity: 4, estimatedDays: 5 },
      { id: 'time-3', name: 'Approval Workflow', baseComplexity: 5, estimatedDays: 6 },
      { id: 'time-4', name: 'Time Reports', baseComplexity: 4, estimatedDays: 5 },
    ],
    'performance': [
      { id: 'perf-1', name: 'Goal Setting System', baseComplexity: 4, estimatedDays: 5 },
      { id: 'perf-2', name: 'Review Templates', baseComplexity: 3, estimatedDays: 4 },
      { id: 'perf-3', name: '360 Feedback', baseComplexity: 5, estimatedDays: 6 },
      { id: 'perf-4', name: 'Performance Analytics', baseComplexity: 5, estimatedDays: 6 },
    ],
  };

  // If we have a predefined set, use it
  if (componentDefinitions[featureId]) {
    return componentDefinitions[featureId];
  }

  // Otherwise, generate generic components based on complexity
  const numComponents = Math.max(3, Math.min(6, Math.ceil(baseComplexity / 1.5)));
  const components: ComponentTemplate[] = [];
  
  for (let i = 0; i < numComponents; i++) {
    const componentComplexity = Math.max(2, Math.min(8, baseComplexity + (i - numComponents / 2) * 0.5));
    components.push({
      id: `${featureId}-comp-${i + 1}`,
      name: `${featureName} - Component ${i + 1}`,
      baseComplexity: Math.round(componentComplexity * 10) / 10,
      estimatedDays: Math.ceil(componentComplexity * 1.2),
    });
  }
  
  return components;
}

