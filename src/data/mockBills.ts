import { Bill } from '@/types';

const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');

const createBill = (
  id: string,
  type: 'expense' | 'income',
  amount: number,
  categoryId: string,
  accountId: string,
  day: number,
  note: string,
  recurring: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' = 'none'
): Bill => ({
  id,
  type,
  amount,
  categoryId,
  accountId,
  note,
  date: `${year}-${month}-${String(day).padStart(2, '0')}`,
  recurring,
  createdAt: new Date(year, now.getMonth(), day).toISOString(),
});

export const mockBills: Bill[] = [
  createBill('b1', 'expense', 35.5, 'c1', 'a4', 10, '午餐 - 麦当劳'),
  createBill('b2', 'expense', 128, 'c3', 'a3', 10, '买衣服'),
  createBill('b3', 'income', 15000, 'c10', 'a2', 10, '6月工资', 'monthly'),
  createBill('b4', 'expense', 15, 'c2', 'a1', 9, '地铁充值'),
  createBill('b5', 'expense', 89, 'c1', 'a4', 9, '晚餐 - 火锅'),
  createBill('b6', 'expense', 2500, 'c5', 'a2', 8, '房租', 'monthly'),
  createBill('b7', 'expense', 68, 'c8', 'a3', 8, '话费充值', 'monthly'),
  createBill('b8', 'income', 2000, 'c11', 'a2', 7, '季度奖金'),
  createBill('b9', 'expense', 199, 'c4', 'a3', 7, '电影票 + 奶茶'),
  createBill('b10', 'expense', 45, 'c1', 'a4', 7, '早餐 + 咖啡'),
  createBill('b11', 'expense', 320, 'c6', 'a2', 6, '买药'),
  createBill('b12', 'expense', 58, 'c2', 'a1', 6, '打车'),
  createBill('b13', 'income', 500, 'c14', 'a4', 5, '生日红包'),
  createBill('b14', 'expense', 450, 'c7', 'a3', 5, '网课'),
  createBill('b15', 'expense', 120, 'c3', 'a4', 4, '超市购物'),
  createBill('b16', 'expense', 25, 'c1', 'a1', 4, '午餐'),
  createBill('b17', 'expense', 3000, 'c5', 'a2', 3, '水电物业费', 'monthly'),
  createBill('b18', 'income', 800, 'c13', 'a4', 3, '兼职收入'),
  createBill('b19', 'expense', 150, 'c3', 'a3', 2, '日用品'),
  createBill('b20', 'expense', 88, 'c1', 'a4', 2, '朋友聚餐'),
  createBill('b21', 'expense', 20, 'c2', 'a1', 1, '公交'),
  createBill('b22', 'expense', 35, 'c1', 'a4', 1, '早餐'),
  createBill('b23', 'income', 1200, 'c12', 'a2', 1, '基金分红'),
  createBill('b24', 'expense', 99, 'c9', 'a3', 1, '其他支出'),
];

export const getBillById = (id: string): Bill | undefined => {
  return mockBills.find(b => b.id === id);
};

export const getBillsByMonth = (yearMonth: string): Bill[] => {
  return mockBills.filter(b => b.date.startsWith(yearMonth)).sort((a, b) => b.date.localeCompare(a.date));
};

export const getBillsByDateRange = (startDate: string, endDate: string): Bill[] => {
  return mockBills.filter(b => b.date >= startDate && b.date <= endDate).sort((a, b) => b.date.localeCompare(a.date));
};

export const searchBills = (keyword: string): Bill[] => {
  const lower = keyword.toLowerCase();
  return mockBills.filter(b => 
    b.note.toLowerCase().includes(lower) ||
    b.amount.toString().includes(lower)
  );
};
