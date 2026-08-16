import { Category, Expense, UserSettings } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'food',
    name: 'Food & Dining',
    icon: 'Utensils',
    color: '#f97316', // Orange
    budgetLimit: 400,
    isCustom: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'groceries',
    name: 'Groceries',
    icon: 'ShoppingBag',
    color: '#10b981', // Emerald
    budgetLimit: 350,
    isCustom: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'transport',
    name: 'Transportation',
    icon: 'Car',
    color: '#3b82f6', // Blue
    budgetLimit: 200,
    isCustom: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'utilities',
    name: 'Bills & Utilities',
    icon: 'Zap',
    color: '#eab308', // Yellow
    budgetLimit: 250,
    isCustom: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: 'Film',
    color: '#8b5cf6', // Purple
    budgetLimit: 150,
    isCustom: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'health',
    name: 'Health & Wellness',
    icon: 'HeartPulse',
    color: '#ec4899', // Pink
    budgetLimit: 180,
    isCustom: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'shopping',
    name: 'Personal Shopping',
    icon: 'Shirt',
    color: '#06b6d4', // Cyan
    budgetLimit: 300,
    isCustom: false,
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_SETTINGS: UserSettings = {
  currency: 'INR',
  currencySymbol: '₹',
  dailyBudget: 500,
  monthlyBudget: 15000,
  cornerPosition: 'bottom-right',
  haptics: true,
};

export const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatTimeNow = (): string => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const generateSampleExpenses = (): Expense[] => {
  return [];
};
