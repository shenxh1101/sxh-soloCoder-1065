import { create } from 'zustand';
import { Bill, Account, Category, Budget, Template, BillSummary, CategoryStat, DailyTrend, SharedLedger, LedgerMember, MemberRole } from '@/types';
import { mockBills } from '@/data/mockBills';
import { mockAccounts, getTotalBalance } from '@/data/mockAccounts';
import { mockCategories, getCategoryById, getCategoriesByType } from '@/data/mockCategories';
import { mockBudgets } from '@/data/mockBudgets';
import { mockTemplates } from '@/data/mockTemplates';
import { getCurrentMonth, getMonthRange, getDaysInMonth } from '@/utils/format';

const mockSharedLedgers: SharedLedger[] = [
  {
    id: 'l1',
    name: '家庭账本',
    description: '共同记录家庭开支',
    ownerId: 'm1',
    color: '#10B981',
    createdAt: '2026-01-01',
    members: [
      { id: 'm1', nickname: '我', avatar: '👨', role: 'owner', joinedAt: '2026-01-01' },
      { id: 'm2', nickname: '老婆', avatar: '👩', role: 'editor', joinedAt: '2026-01-02' },
      { id: 'm3', nickname: '小明', avatar: '👦', role: 'viewer', joinedAt: '2026-01-15' },
    ],
  },
];

interface FinanceState {
  bills: Bill[];
  accounts: Account[];
  categories: Category[];
  budgets: Budget[];
  templates: Template[];
  sharedLedgers: SharedLedger[];
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
  updateTotalBudget: (amount: number) => void;
  addCategoryBudget: (categoryId: string, amount: number) => void;
  updateCategoryBudget: (id: string, amount: number) => void;
  
  getTemplates: () => Template[];
  
  getSharedLedgers: () => SharedLedger[];
  createSharedLedger: (name: string, description: string, color: string) => void;
  addMember: (ledgerId: string, nickname: string, avatar: string, role: MemberRole) => void;
  updateMemberRole: (ledgerId: string, memberId: string, role: MemberRole) => void;
  removeMember: (ledgerId: string, memberId: string) => void;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  bills: mockBills,
  accounts: mockAccounts,
  categories: mockCategories,
  budgets: mockBudgets,
  templates: mockTemplates,
  sharedLedgers: mockSharedLedgers,
  currentMonth: getCurrentMonth(),

  getBills: () => get().bills,
  getBillsByMonth: (month) => {
    return get().bills
      .filter(b => b.date.startsWith(month))
      .sort((a, b) => b.date.localeCompare(a.date));
  },
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
  getTotalBudget: () => get().budgets.find(b => !b.categoryId),
  getCategoryBudgets: () => get().budgets.filter(b => b.categoryId),
  
  updateTotalBudget: (amount) => {
    const month = get().currentMonth;
    const existing = get().budgets.find(b => !b.categoryId && b.month === month);
    
    if (existing) {
      set((state) => ({
        budgets: state.budgets.map(b => 
          b.id === existing.id ? { ...b, amount } : b
        ),
      }));
    } else {
      const newBudget: Budget = {
        id: `budget_${Date.now()}`,
        amount,
        month,
        spent: get().getSummary().totalExpense,
      };
      set((state) => ({ budgets: [...state.budgets, newBudget] }));
    }
    console.log('[FinanceStore] Total budget updated:', amount);
  },
  
  addCategoryBudget: (categoryId, amount) => {
    const month = get().currentMonth;
    const existing = get().budgets.find(b => b.categoryId === categoryId && b.month === month);
    
    if (existing) {
      set((state) => ({
        budgets: state.budgets.map(b => 
          b.id === existing.id ? { ...b, amount } : b
        ),
      }));
    } else {
      const categoryBills = get().getBillsByMonth(month).filter(
        b => b.type === 'expense' && b.categoryId === categoryId
      );
      const spent = categoryBills.reduce((sum, b) => sum + b.amount, 0);
      
      const newBudget: Budget = {
        id: `budget_${Date.now()}`,
        categoryId,
        amount,
        month,
        spent,
      };
      set((state) => ({ budgets: [...state.budgets, newBudget] }));
    }
    console.log('[FinanceStore] Category budget added:', categoryId, amount);
  },
  
  updateCategoryBudget: (id, amount) => {
    set((state) => ({
      budgets: state.budgets.map(b => b.id === id ? { ...b, amount } : b),
    }));
    console.log('[FinanceStore] Category budget updated:', id, amount);
  },

  getTemplates: () => get().templates,

  getSharedLedgers: () => get().sharedLedgers,
  
  createSharedLedger: (name, description, color) => {
    const newLedger: SharedLedger = {
      id: `l${Date.now()}`,
      name,
      description,
      color,
      ownerId: 'm1',
      createdAt: new Date().toISOString().split('T')[0],
      members: [
        { id: 'm1', nickname: '我', avatar: '👨', role: 'owner', joinedAt: new Date().toISOString().split('T')[0] },
      ],
    };
    set((state) => ({ sharedLedgers: [...state.sharedLedgers, newLedger] }));
    console.log('[FinanceStore] Shared ledger created:', newLedger);
  },
  
  addMember: (ledgerId, nickname, avatar, role) => {
    const newMember: LedgerMember = {
      id: `m${Date.now()}`,
      nickname,
      avatar,
      role,
      joinedAt: new Date().toISOString().split('T')[0],
    };
    set((state) => ({
      sharedLedgers: state.sharedLedgers.map(l => 
        l.id === ledgerId 
          ? { ...l, members: [...l.members, newMember] }
          : l
      ),
    }));
    console.log('[FinanceStore] Member added:', ledgerId, newMember);
  },
  
  updateMemberRole: (ledgerId, memberId, role) => {
    set((state) => ({
      sharedLedgers: state.sharedLedgers.map(l => 
        l.id === ledgerId 
          ? { 
              ...l, 
              members: l.members.map(m => 
                m.id === memberId ? { ...m, role } : m
              ) 
            }
          : l
      ),
    }));
    console.log('[FinanceStore] Member role updated:', ledgerId, memberId, role);
  },
  
  removeMember: (ledgerId, memberId) => {
    set((state) => ({
      sharedLedgers: state.sharedLedgers.map(l => 
        l.id === ledgerId 
          ? { ...l, members: l.members.filter(m => m.id !== memberId) }
          : l
      ),
    }));
    console.log('[FinanceStore] Member removed:', ledgerId, memberId);
  },
}));
