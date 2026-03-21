export type AccountType = 'Debit' | 'Credit' | 'Crypto' | 'Cash' | 'Savings' | 'PersonalDebt' | 'Investment';

export interface Account {
  id: string;
  name: string;
  balance: number;
  creditLimit?: number;
  type: AccountType;
  bankName?: string;
  personName?: string;
  user_id?: string;
}

export interface Transaction {
  id: string;
  title: string;
  category: string;
  amount: number;
  type: 'Expense' | 'Income' | 'Transfer';
  time: string;
  date: Date;
  icon: string;
  accountId?: string;
  user_id?: string;
}

export interface Reminder {
  id: string;
  title: string;
  amount: number;
  dayOfMonth?: number;
  accountId: string;
  receiver?: string;
  category: string;
  icon: string;
  type: 'subscription' | 'bill' | 'one-time';
  isMandatory: boolean;
  lastConfirmedDate?: string;
}

export interface BudgetConfig {
  dailyLimit: number;
  savingsGoal: number;
  mode: 'manual' | 'auto';
}

export interface UserProfile {
  id: string;
  db_uuid: string;
  source: 'supabase' | 'telegram';
  name?: string;
}
