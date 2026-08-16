export type PaymentMethod = 'Cash' | 'Credit Card' | 'Debit Card' | 'UPI / Online' | 'Bank Transfer' | 'Other';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  budgetLimit?: number; // monthly target
  isCustom?: boolean;
  createdAt: string;
}

export interface BankAccount {
  id: string;
  name: string; // e.g., "Chase Checking", "HDFC Bank"
  accountNumber?: string;
  color?: string; // For UI identification
  createdAt: number;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  categoryId: string;
  bankAccountId?: string; // Optional link to a bank account
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  paymentMethod: PaymentMethod;
  notes?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface UserSettings {
  currency: string;
  currencySymbol: string;
  dailyBudget: number;
  monthlyBudget: number;
  cornerPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  haptics: boolean;
}

export interface CalculatorHistory {
  id: string;
  expression: string;
  result: number;
  timestamp: number;
  note?: string;
}

export type ActiveTab = 'dashboard' | 'daily' | 'categories' | 'calculator' | 'history' | 'export' | 'settings';
