import { create } from 'zustand';
import { Bill, Account, Category, Budget, Template, BillSummary, CategoryStat, DailyTrend } from '@/types';
import { mockBills, getBillsByMonth } from '@/data/mockBills';
import { mockAccounts, getTotalBalance } from '@/data/mockAccounts';
import { mockCategories, getCategoryById, getCategoriesByType } from '@/data/mockCategories';
import { mockBudgets, getTotalBudget, getCategoryBudgets } from '@/data/mockBudgets';
import { mockTemplates } from '@/data/mockTemplates';
import { getCurrentMonth, getMonthRange, getDaysInMonth } from '@/utils/format';

interface FinanceState {
  bills: Bill[];
  accounts: Account[];
  categories: Category[];
  budgets: Budget[];
  templates: Template[];
  currentMonth: string;
  
  getBills: () => Bill[];
  getBillsByMonth: (month: string) => Bill[];
  getBillById: (id: string) => Bill | undefined;
  addBill: (bill: Omit<Bill, 'id' | 'createdAt'>) => void;
  updateBill: (id: string, bill: Partial<Bill>) => void;
  deleteBill: (id: string) => void;
  
  getAccounts: () => Account[];
  getAccountById: (id: string) => Account | undefined;
  getTotalBalance: () => number;
  
  getCategories: (type?: 'expense' | 'income') => Category[];
  getCategory: (id: string) => Category | undefined;
  
  getSummary: (month?: string) => BillSummary;
  getCategoryStats: (type: 'expense' | 'income', month?: string) => CategoryStat[];
  getDailyTrend: (month?: string) => DailyTrend[];
  
  getBudgets: () => Budget[];
  getTotalBudget: () => Budget | undefined;
  getCategoryBudgets: () => Budget[];
  
  getTemplates: () => Template[];
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  bills: mockBills,
  accounts: mockAccounts,
  categories: mockCategories,
  budgets: mockBudgets,
  templates: mockTemplates,
  currentMonth: getCurrentMonth(),

  getBills: () => get().bills,
  getBillsByMonth: (month) => getBillsByMonth(month),
  getBillById: (id) => get().bills.find(b => b.id === id),
  
  addBill: (bill) => {
    const newBill: Bill = {
      ...bill,
      id: `b${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ bills: [newBill, ...state.bills] }));
    console.log('[FinanceStore] Bill added:', newBill);
  },
  
  updateBill: (id, bill) => {
    set((state) => ({
      bills: state.bills.map(b => b.id === id ? { ...b, ...bill } : b),
    }));
    console.log('[FinanceStore] Bill updated:', id, bill);
  },
  
  deleteBill: (id) => {
    set((state) => ({ bills: state.bills.filter(b => b.id !== id) }));
    console.log('[FinanceStore] Bill deleted:', id);
  },

  getAccounts: () => get().accounts,
  getAccountById: (id) => get().accounts.find(a => a.id === id),
  getTotalBalance: () => getTotalBalance(),

  getCategories: (type) => type ? getCategoriesByType(type) : get().categories,
  getCategory: (id) => getCategoryById(id),

  getSummary: (month = get().currentMonth) => {
    const bills = get().getBillsByMonth(month);
    const totalIncome = bills.filter(b => b.type === 'income').reduce((sum, b) => sum + b.amount, 0);
    const totalExpense = bills.filter(b => b.type === 'expense').reduce((sum, b) => sum + b.amount, 0);
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
  },

  getCategoryStats: (type, month = get().currentMonth) => {
    const bills = get().getBillsByMonth(month).filter(b => b.type === type);
    const total = bills.reduce((sum, b) => sum + b.amount, 0);
    const stats: Record<string, { amount: number; color: string; name: string }> = {};
    
    bills.forEach(bill => {
      const category = get().getCategory(bill.categoryId);
      if (!category) return;
      if (!stats[bill.categoryId]) {
        stats[bill.categoryId] = { amount: 0, color: category.color, name: category.name };
      }
      stats[bill.categoryId].amount += bill.amount;
    });

    return Object.entries(stats)
      .map(([categoryId, data]) => ({
        categoryId,
        categoryName: data.name,
        amount: data.amount,
        percentage: total > 0 ? (data.amount / total) * 100 : 0,
        color: data.color,
      }))
      .sort((a, b) => b.amount - a.amount);
  },

  getDailyTrend: (month = get().currentMonth) => {
    const [startDate] = getMonthRange(month);
    const daysInMonth = getDaysInMonth(month);
    const bills = get().getBillsByMonth(month);
    const trends: DailyTrend[] = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const date = `${month}-${String(i).padStart(2, '0')}`;
      const dayBills = bills.filter(b => b.date === date);
      trends.push({
        date: String(i),
        income: dayBills.filter(b => b.type === 'income').reduce((sum, b) => sum + b.amount, 0),
        expense: dayBills.filter(b => b.type === 'expense').reduce((sum, b) => sum + b.amount, 0),
      });
    }

    return trends;
  },

  getBudgets: () => get().budgets,
  getTotalBudget: () => getTotalBudget(),
  getCategoryBudgets: () => getCategoryBudgets(),

  getTemplates: () => get().templates,
}));
