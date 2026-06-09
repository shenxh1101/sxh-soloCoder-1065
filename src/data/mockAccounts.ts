import { Account } from '@/types';

export const mockAccounts: Account[] = [
  { id: 'a1', name: '现金', type: 'cash', balance: 1258.50, color: '#10B981' },
  { id: 'a2', name: '工商银行', type: 'bank', balance: 15680.00, color: '#3B82F6' },
  { id: 'a3', name: '支付宝', type: 'alipay', balance: 3420.80, color: '#0EA5E9' },
  { id: 'a4', name: '微信钱包', type: 'wechat', balance: 856.20, color: '#10B981' },
  { id: 'a5', name: '信用卡', type: 'credit', balance: -2350.00, color: '#EF4444' },
];

export const getAccountById = (id: string): Account | undefined => {
  return mockAccounts.find(a => a.id === id);
};

export const getTotalBalance = (): number => {
  return mockAccounts.reduce((sum, acc) => sum + acc.balance, 0);
};
