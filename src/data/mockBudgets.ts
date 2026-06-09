import { Budget } from '@/types';

const now = new Date();
const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

export const mockBudgets: Budget[] = [
  { id: 'bg1', amount: 3000, month: yearMonth, spent: 2180.5 },
  { id: 'bg2', categoryId: 'c1', amount: 1500, month: yearMonth, spent: 317.5 },
  { id: 'bg3', categoryId: 'c2', amount: 500, month: yearMonth, spent: 93 },
  { id: 'bg4', categoryId: 'c3', amount: 1000, month: yearMonth, spent: 398 },
  { id: 'bg5', categoryId: 'c4', amount: 500, month: yearMonth, spent: 199 },
  { id: 'bg6', categoryId: 'c5', amount: 6000, month: yearMonth, spent: 5500 },
];

export const getTotalBudget = (): Budget | undefined => {
  return mockBudgets.find(b => !b.categoryId);
};

export const getCategoryBudgets = (): Budget[] => {
  return mockBudgets.filter(b => b.categoryId);
};
