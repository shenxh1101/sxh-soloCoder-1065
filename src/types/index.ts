export type BillType = 'expense' | 'income';

export type RecurringType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Category {
  id: string;
  name: string;
  type: BillType;
  color: string;
  icon: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'alipay' | 'wechat' | 'credit' | 'other';
  balance: number;
  color: string;
}

export interface Bill {
  id: string;
  type: BillType;
  amount: number;
  categoryId: string;
  accountId: string;
  note: string;
  photoUrl?: string;
  date: string;
  recurring: RecurringType;
  templateId?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  categoryId?: string;
  amount: number;
  month: string;
  spent: number;
}

export interface Template {
  id: string;
  name: string;
  type: BillType;
  amount: number;
  categoryId: string;
  accountId: string;
  note: string;
}

export interface BillSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface CategoryStat {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface DailyTrend {
  date: string;
  income: number;
  expense: number;
}

export type MemberRole = 'owner' | 'editor' | 'viewer';

export interface LedgerMember {
  id: string;
  nickname: string;
  avatar: string;
  role: MemberRole;
  joinedAt: string;
}

export interface SharedLedger {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: LedgerMember[];
  createdAt: string;
  color: string;
}
