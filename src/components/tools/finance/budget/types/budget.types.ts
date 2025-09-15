/**
 * budget.types.ts
 * Common interfaces and types for the Budget Planner modules
 * Shared across all budget-related components for consistency
 */

export interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
  tags?: string[];
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  priority: 'low' | 'medium' | 'high';
  icon?: string;
  completedAt?: string;
}

export interface BudgetSummary {
  totalIncome: number;
  totalExpenses: number;
  totalBudgeted: number;
  remaining: number;
  netIncome: number;
  savingsRate: number;
}

export interface MonthlyBudget {
  id: string;
  month: string;
  year: number;
  categories: BudgetCategory[];
  summary: BudgetSummary;
  savingsGoals?: SavingsGoal[];
}

export interface BudgetAlert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  message: string;
  categoryId?: string;
  severity: 'low' | 'medium' | 'high';
  title: string;
  suggestion?: string;
}

export interface OptimizationSuggestion {
  id: string;
  type: 'reduce' | 'reallocate' | 'save';
  message: string;
  potentialSaving?: number;
  title: string;
  priority: 'low' | 'medium' | 'high';
}

export interface PredefinedCategory {
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  suggestedBudget?: number;
}

export interface PredefinedGoal {
  name: string;
  targetAmount: number;
  monthsDuration: number;
  priority: 'low' | 'medium' | 'high';
  icon: string;
  description: string;
}

// Predefined categories with French context
export const PREDEFINED_CATEGORIES: PredefinedCategory[] = [
  { name: 'Salaire', icon: 'Wallet', color: '#10B981', type: 'income', suggestedBudget: 3000 },
  { name: 'Freelance', icon: 'TrendingUp', color: '#059669', type: 'income', suggestedBudget: 1000 },
  { name: 'Logement', icon: 'Home', color: '#EF4444', type: 'expense', suggestedBudget: 1200 },
  { name: 'Alimentation', icon: 'ShoppingCart', color: '#F59E0B', type: 'expense', suggestedBudget: 400 },
  { name: 'Transport', icon: 'Car', color: '#3B82F6', type: 'expense', suggestedBudget: 200 },
  { name: 'Loisirs', icon: 'Gamepad2', color: '#8B5CF6', type: 'expense', suggestedBudget: 300 },
  { name: 'Santé', icon: 'Heart', color: '#EC4899', type: 'expense', suggestedBudget: 150 },
  { name: 'Éducation', icon: 'GraduationCap', color: '#06B6D4', type: 'expense', suggestedBudget: 200 },
  { name: 'Voyages', icon: 'Plane', color: '#84CC16', type: 'expense', suggestedBudget: 500 },
  { name: 'Restaurants', icon: 'Coffee', color: '#F97316', type: 'expense', suggestedBudget: 250 },
  { name: 'Cadeaux', icon: 'Gift', color: '#E11D48', type: 'expense', suggestedBudget: 100 },
  // Enhanced French categories from improvement plan
  { name: 'Impôts', icon: 'Receipt', color: '#DC2626', type: 'expense', suggestedBudget: 800 },
  { name: 'Mutuelle', icon: 'Heart', color: '#059669', type: 'expense', suggestedBudget: 120 },
  { name: 'Cantine scolaire', icon: 'GraduationCap', color: '#0891B2', type: 'expense', suggestedBudget: 80 },
  { name: 'Abonnements (Netflix, Spotify)', icon: 'Gamepad2', color: '#7C3AED', type: 'expense', suggestedBudget: 45 },
  { name: 'Pharmacie', icon: 'Heart', color: '#DC2626', type: 'expense', suggestedBudget: 60 },
  { name: 'Coiffeur/Esthétique', icon: 'Heart', color: '#EC4899', type: 'expense', suggestedBudget: 80 },
  { name: 'Vêtements', icon: 'ShoppingCart', color: '#F59E0B', type: 'expense', suggestedBudget: 150 },
  { name: 'Électricité/Gaz', icon: 'Home', color: '#EF4444', type: 'expense', suggestedBudget: 120 },
  { name: 'Internet/Téléphone', icon: 'Home', color: '#3B82F6', type: 'expense', suggestedBudget: 65 },
  { name: 'Assurance habitation', icon: 'Home', color: '#059669', type: 'expense', suggestedBudget: 25 },
  { name: 'Assurance auto', icon: 'Car', color: '#059669', type: 'expense', suggestedBudget: 85 }
];

// Predefined savings goals with French context
export const PREDEFINED_GOALS: PredefinedGoal[] = [
  { name: 'Fonds d\'urgence', targetAmount: 5000, monthsDuration: 12, priority: 'high', icon: 'AlertTriangle', description: '3-6 mois de dépenses' },
  { name: 'Vacances d\'été', targetAmount: 2000, monthsDuration: 6, priority: 'medium', icon: 'Plane', description: 'Voyage de rêve' },
  { name: 'Nouvelle voiture', targetAmount: 15000, monthsDuration: 24, priority: 'medium', icon: 'Car', description: 'Véhicule fiable' },
  { name: 'Apport immobilier', targetAmount: 30000, monthsDuration: 36, priority: 'high', icon: 'Home', description: '10-20% du prix d\'achat' },
  { name: 'Mariage', targetAmount: 12000, monthsDuration: 18, priority: 'high', icon: 'Heart', description: 'Cérémonie et réception' },
  { name: 'Formation professionnelle', targetAmount: 3000, monthsDuration: 8, priority: 'medium', icon: 'GraduationCap', description: 'Développement de compétences' },
  { name: 'Équipement informatique', targetAmount: 2500, monthsDuration: 6, priority: 'low', icon: 'Gamepad2', description: 'Ordinateur et accessoires' },
  { name: 'Rénovation maison', targetAmount: 8000, monthsDuration: 15, priority: 'medium', icon: 'Home', description: 'Amélioration du logement' },
  { name: 'Voyage de noces', targetAmount: 4000, monthsDuration: 12, priority: 'medium', icon: 'Plane', description: 'Lune de miel inoubliable' },
  { name: 'Équipement sportif', targetAmount: 1500, monthsDuration: 4, priority: 'low', icon: 'Heart', description: 'Matériel de qualité' },
  { name: 'Investissement bourse', targetAmount: 10000, monthsDuration: 20, priority: 'medium', icon: 'TrendingUp', description: 'Capital d\'investissement' },
  { name: 'Cadeau anniversaire', targetAmount: 800, monthsDuration: 3, priority: 'low', icon: 'Gift', description: 'Surprise spéciale' },
  { name: 'Frais de santé', targetAmount: 2000, monthsDuration: 8, priority: 'high', icon: 'Heart', description: 'Soins non remboursés' },
  { name: 'Équipement cuisine', targetAmount: 1200, monthsDuration: 5, priority: 'low', icon: 'Coffee', description: 'Électroménager moderne' },
  { name: 'Weekend romantique', targetAmount: 600, monthsDuration: 2, priority: 'low', icon: 'Heart', description: 'Escapade à deux' },
  { name: 'Cours de langue', targetAmount: 1000, monthsDuration: 6, priority: 'medium', icon: 'GraduationCap', description: 'Apprentissage linguistique' },
  { name: 'Retraite anticipée', targetAmount: 50000, monthsDuration: 60, priority: 'high', icon: 'Target', description: 'Complément retraite' }
];