import { Feature } from './product';

export interface ProductTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  features: FeatureTemplate[];
  estimatedComplexity: number; // 1-5 scale
  revenuePotential: number; // Multiplier for revenue calculations (1.0-2.0)
}

export interface ComponentTemplate {
  id: string;
  name: string;
  baseComplexity: number; // 1-10 scale
  estimatedDays: number; // Estimated development days for this component
}

export interface FeatureTemplate {
  id: string;
  name: string;
  description: string;
  baseComplexity: number; // Affects development time (1-10 scale) - overall feature complexity
  components?: ComponentTemplate[]; // Components that make up this feature (optional, will be generated if not provided)
  unlocksCapability?: string; // e.g., "revenue", "analytics", "mobile"
  priority: number; // Default priority order
}

export const PRODUCT_TEMPLATES: ProductTemplate[] = [
  {
    id: 'crm-platform',
    name: 'CRM Platform',
    description: 'Customer relationship management with AI-powered insights and sales automation',
    category: 'CRM',
    estimatedComplexity: 4,
    revenuePotential: 1.4,
    features: [
      {
        id: 'auth',
        name: 'User Authentication & Profiles',
        description: 'Secure login, user profiles, and role-based access control',
        baseComplexity: 3,
        priority: 1,
      },
      {
        id: 'contacts',
        name: 'Contact Management',
        description: 'Centralized database for managing customer contacts and interactions',
        baseComplexity: 4,
        priority: 2,
      },
      {
        id: 'pipeline',
        name: 'Sales Pipeline Tracking',
        description: 'Visual sales funnel with deal stages and forecasting',
        baseComplexity: 5,
        priority: 3,
      },
      {
        id: 'email',
        name: 'Email Integration',
        description: 'Sync emails with contacts and track communication history',
        baseComplexity: 5,
        priority: 4,
      },
      {
        id: 'ai-scoring',
        name: 'AI-Powered Lead Scoring',
        description: 'Machine learning model to automatically score and prioritize leads',
        baseComplexity: 7,
        priority: 5,
        unlocksCapability: 'analytics',
      },
      {
        id: 'reporting',
        name: 'Reporting Dashboard',
        description: 'Analytics and insights on sales performance and customer data',
        baseComplexity: 4,
        priority: 6,
        unlocksCapability: 'analytics',
      },
      {
        id: 'api',
        name: 'API Integration',
        description: 'RESTful API for third-party integrations and custom workflows',
        baseComplexity: 6,
        priority: 7,
      },
      {
        id: 'mobile',
        name: 'Mobile App',
        description: 'Native mobile apps for iOS and Android',
        baseComplexity: 8,
        priority: 8,
        unlocksCapability: 'mobile',
      },
    ],
  },
  {
    id: 'project-management',
    name: 'Project Management Tool',
    description: 'Team collaboration platform with task management, automation, and real-time updates',
    category: 'Productivity',
    estimatedComplexity: 3,
    revenuePotential: 1.2,
    features: [
      {
        id: 'auth',
        name: 'User Authentication & Teams',
        description: 'Team member accounts and organization management',
        baseComplexity: 3,
        priority: 1,
      },
      {
        id: 'tasks',
        name: 'Task Management',
        description: 'Create, assign, and track tasks with due dates and priorities',
        baseComplexity: 4,
        priority: 2,
      },
      {
        id: 'boards',
        name: 'Kanban Boards',
        description: 'Visual project boards with drag-and-drop task organization',
        baseComplexity: 4,
        priority: 3,
      },
      {
        id: 'collaboration',
        name: 'Real-time Collaboration',
        description: 'Live updates, comments, and notifications for team coordination',
        baseComplexity: 5,
        priority: 4,
      },
      {
        id: 'automation',
        name: 'Workflow Automation',
        description: 'Automate repetitive tasks with custom rules and triggers',
        baseComplexity: 6,
        priority: 5,
        unlocksCapability: 'automation',
      },
      {
        id: 'time-tracking',
        name: 'Time Tracking & Reports',
        description: 'Track time spent on tasks and generate productivity reports',
        baseComplexity: 4,
        priority: 6,
        unlocksCapability: 'analytics',
      },
      {
        id: 'integrations',
        name: 'Third-party Integrations',
        description: 'Connect with Slack, GitHub, Jira, and other tools',
        baseComplexity: 5,
        priority: 7,
      },
      {
        id: 'mobile',
        name: 'Mobile Apps',
        description: 'iOS and Android apps for on-the-go project management',
        baseComplexity: 7,
        priority: 8,
        unlocksCapability: 'mobile',
      },
    ],
  },
  {
    id: 'analytics-dashboard',
    name: 'Data Analytics Dashboard',
    description: 'Business intelligence platform with real-time reporting, data visualization, and predictive analytics',
    category: 'Analytics',
    estimatedComplexity: 5,
    revenuePotential: 1.6,
    features: [
      {
        id: 'auth',
        name: 'Enterprise Authentication',
        description: 'SSO, multi-factor authentication, and advanced security',
        baseComplexity: 4,
        priority: 1,
      },
      {
        id: 'data-connectors',
        name: 'Data Source Connectors',
        description: 'Connect to databases, APIs, and cloud services for data ingestion',
        baseComplexity: 6,
        priority: 2,
      },
      {
        id: 'visualization',
        name: 'Data Visualization',
        description: 'Interactive charts, graphs, and custom dashboard builder',
        baseComplexity: 5,
        priority: 3,
      },
      {
        id: 'real-time',
        name: 'Real-time Reporting',
        description: 'Live data updates and streaming analytics',
        baseComplexity: 6,
        priority: 4,
        unlocksCapability: 'analytics',
      },
      {
        id: 'predictive',
        name: 'Predictive Analytics',
        description: 'AI-powered forecasting and trend analysis',
        baseComplexity: 8,
        priority: 5,
        unlocksCapability: 'analytics',
      },
      {
        id: 'alerts',
        name: 'Custom Alerts & Notifications',
        description: 'Set up automated alerts for data anomalies and thresholds',
        baseComplexity: 4,
        priority: 6,
      },
      {
        id: 'export',
        name: 'Export & Sharing',
        description: 'Export reports, schedule emails, and share dashboards',
        baseComplexity: 3,
        priority: 7,
      },
      {
        id: 'api',
        name: 'Analytics API',
        description: 'Programmatic access to analytics data and custom integrations',
        baseComplexity: 7,
        priority: 8,
      },
    ],
  },
  {
    id: 'ai-chatbot',
    name: 'AI Chatbot Platform',
    description: 'Intelligent customer service automation with natural language processing and machine learning',
    category: 'AI',
    estimatedComplexity: 5,
    revenuePotential: 1.5,
    features: [
      {
        id: 'chat-interface',
        name: 'Chat Interface',
        description: 'Web and widget-based chat interface for customer conversations',
        baseComplexity: 3,
        priority: 1,
      },
      {
        id: 'nlp',
        name: 'Natural Language Processing',
        description: 'Understand and respond to customer queries in natural language',
        baseComplexity: 7,
        priority: 2,
      },
      {
        id: 'knowledge-base',
        name: 'Knowledge Base Integration',
        description: 'Connect to documentation and FAQ databases for accurate responses',
        baseComplexity: 5,
        priority: 3,
      },
      {
        id: 'multi-channel',
        name: 'Multi-channel Support',
        description: 'Deploy chatbots across website, mobile app, and messaging platforms',
        baseComplexity: 5,
        priority: 4,
      },
      {
        id: 'analytics',
        name: 'Conversation Analytics',
        description: 'Track metrics, sentiment analysis, and performance insights',
        baseComplexity: 4,
        priority: 5,
        unlocksCapability: 'analytics',
      },
      {
        id: 'training',
        name: 'Custom AI Training',
        description: 'Train AI models on your specific data and use cases',
        baseComplexity: 8,
        priority: 6,
      },
      {
        id: 'sso',
        name: 'Enterprise SSO',
        description: 'Single sign-on integration for enterprise customers',
        baseComplexity: 5,
        priority: 7,
      },
      {
        id: 'api',
        name: 'API & Integrations',
        description: 'REST API for custom integrations and CRM connections',
        baseComplexity: 6,
        priority: 8,
      },
    ],
  },
  {
    id: 'hr-management',
    name: 'HR Management System',
    description: 'Comprehensive employee lifecycle management with payroll, benefits, and performance tracking',
    category: 'HR',
    estimatedComplexity: 4,
    revenuePotential: 1.3,
    features: [
      {
        id: 'employee-db',
        name: 'Employee Database',
        description: 'Centralized employee profiles with documents and information management',
        baseComplexity: 3,
        priority: 1,
      },
      {
        id: 'onboarding',
        name: 'Onboarding Workflows',
        description: 'Automated onboarding processes and document collection',
        baseComplexity: 4,
        priority: 2,
      },
      {
        id: 'time-off',
        name: 'Time & Attendance',
        description: 'Time tracking, PTO management, and attendance monitoring',
        baseComplexity: 4,
        priority: 3,
      },
      {
        id: 'performance',
        name: 'Performance Reviews',
        description: '360-degree reviews, goal tracking, and feedback management',
        baseComplexity: 5,
        priority: 4,
        unlocksCapability: 'analytics',
      },
      {
        id: 'payroll',
        name: 'Payroll Integration',
        description: 'Calculate salaries, taxes, and integrate with payroll providers',
        baseComplexity: 6,
        priority: 5,
        unlocksCapability: 'revenue',
      },
      {
        id: 'benefits',
        name: 'Benefits Administration',
        description: 'Manage health insurance, retirement plans, and employee benefits',
        baseComplexity: 5,
        priority: 6,
      },
      {
        id: 'reporting',
        name: 'HR Analytics Dashboard',
        description: 'Insights on workforce trends, turnover, and productivity metrics',
        baseComplexity: 4,
        priority: 7,
        unlocksCapability: 'analytics',
      },
      {
        id: 'mobile',
        name: 'Employee Mobile App',
        description: 'Mobile app for employees to access HR information and services',
        baseComplexity: 6,
        priority: 8,
        unlocksCapability: 'mobile',
      },
    ],
  },
];

export function getProductTemplate(id: string): ProductTemplate | undefined {
  return PRODUCT_TEMPLATES.find(template => template.id === id);
}
