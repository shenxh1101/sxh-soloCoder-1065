import { Template } from '@/types';

export const mockTemplates: Template[] = [
  { id: 't1', name: '午餐', type: 'expense', amount: 30, categoryId: 'c1', accountId: 'a4', note: '工作午餐' },
  { id: 't2', name: '地铁', type: 'expense', amount: 10, categoryId: 'c2', accountId: 'a1', note: '通勤地铁' },
  { id: 't3', name: '奶茶咖啡', type: 'expense', amount: 25, categoryId: 'c1', accountId: 'a4', note: '下午茶' },
  { id: 't4', name: '房租', type: 'expense', amount: 2500, categoryId: 'c5', accountId: 'a2', note: '每月房租' },
  { id: 't5', name: '工资', type: 'income', amount: 15000, categoryId: 'c10', accountId: 'a2', note: '月工资' },
];
