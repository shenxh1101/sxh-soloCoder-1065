import dayjs from 'dayjs';
import { RecurringType } from '@/types';

export const formatRecurring = (type: RecurringType): string => {
  const map: Record<RecurringType, string> = {
    none: '',
    daily: '每天',
    weekly: '每周',
    monthly: '每月',
    yearly: '每年',
  };
  return map[type];
};

export const formatMoney = (amount: number, showSign = false): string => {
  const formatted = Math.abs(amount).toFixed(2);
  if (showSign) {
    return amount >= 0 ? `+${formatted}` : `-${formatted}`;
  }
  return formatted;
};

export const formatDate = (date: string, format = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format);
};

export const formatDateCN = (date: string): string => {
  const d = dayjs(date);
  const today = dayjs();
  if (d.isSame(today, 'day')) return '今天';
  if (d.isSame(today.subtract(1, 'day'), 'day')) return '昨天';
  if (d.isSame(today, 'month')) return `${d.date()}日`;
  return d.format('M月D日');
};

export const getMonthRange = (yearMonth: string): [string, string] => {
  const start = dayjs(yearMonth).startOf('month').format('YYYY-MM-DD');
  const end = dayjs(yearMonth).endOf('month').format('YYYY-MM-DD');
  return [start, end];
};

export const getCurrentMonth = (): string => {
  return dayjs().format('YYYY-MM');
};

export const getDaysInMonth = (yearMonth: string): number => {
  return dayjs(yearMonth).daysInMonth();
};

export const groupBillsByDate = (bills: any[]): Record<string, any[]> => {
  return bills.reduce((groups, bill) => {
    const date = bill.date;
    if (!groups[date]) groups[date] = [];
    groups[date].push(bill);
    return groups;
  }, {});
};
