import { Category } from '@/types';

export const mockCategories: Category[] = [
  { id: 'c1', name: '餐饮', type: 'expense', color: '#EF4444', icon: '🍜' },
  { id: 'c2', name: '交通', type: 'expense', color: '#F97316', icon: '🚗' },
  { id: 'c3', name: '购物', type: 'expense', color: '#EC4899', icon: '🛍️' },
  { id: 'c4', name: '娱乐', type: 'expense', color: '#8B5CF6', icon: '🎮' },
  { id: 'c5', name: '居住', type: 'expense', color: '#3B82F6', icon: '🏠' },
  { id: 'c6', name: '医疗', type: 'expense', color: '#14B8A6', icon: '💊' },
  { id: 'c7', name: '教育', type: 'expense', color: '#6366F1', icon: '📚' },
  { id: 'c8', name: '通讯', type: 'expense', color: '#0EA5E9', icon: '📱' },
  { id: 'c9', name: '其他支出', type: 'expense', color: '#64748B', icon: '💰' },
  { id: 'c10', name: '工资', type: 'income', color: '#10B981', icon: '💼' },
  { id: 'c11', name: '奖金', type: 'income', color: '#059669', icon: '🎁' },
  { id: 'c12', name: '投资收益', type: 'income', color: '#047857', icon: '📈' },
  { id: 'c13', name: '兼职', type: 'income', color: '#065F46', icon: '💪' },
  { id: 'c14', name: '红包', type: 'income', color: '#34D399', icon: '🧧' },
  { id: 'c15', name: '其他收入', type: 'income', color: '#6EE7B7', icon: '💵' },
];

export const getCategoryById = (id: string): Category | undefined => {
  return mockCategories.find(c => c.id === id);
};

export const getCategoriesByType = (type: 'expense' | 'income'): Category[] => {
  return mockCategories.filter(c => c.type === type);
};
