import React, { useState, useMemo } from 'react';
import { View, Text, Input, Button, ScrollView, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import dayjs from 'dayjs';
import { useFinanceStore } from '@/store/useFinanceStore';
import { formatMoney, formatDate, groupBillsByDate } from '@/utils/format';
import BillItem from '@/components/BillItem';
import styles from './index.module.scss';

const LedgerPage: React.FC = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [currentMonth, setCurrentMonth] = useState(dayjs().format('YYYY-MM'));

  const getBillsByMonth = useFinanceStore((state) => state.getBillsByMonth);
  const getSummary = useFinanceStore((state) => state.getSummary);

  const allBills = useMemo(() => getBillsByMonth(currentMonth), [getBillsByMonth, currentMonth]);
  const summary = getSummary(currentMonth);

  const filteredBills = useMemo(() => {
    let bills = allBills;
    if (filterType !== 'all') {
      bills = bills.filter(b => b.type === filterType);
    }
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      bills = bills.filter(b => 
        b.note.toLowerCase().includes(keyword) ||
        b.amount.toString().includes(keyword)
      );
    }
    return bills;
  }, [allBills, filterType, searchKeyword]);

  const billsByDate = useMemo(() => groupBillsByDate(filteredBills), [filteredBills]);

  const goToBillDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/bill-detail/index?id=${id}` });
  };

  const handlePrevMonth = () => {
    setCurrentMonth(dayjs(currentMonth).subtract(1, 'month').format('YYYY-MM'));
  };

  const handleNextMonth = () => {
    const nextMonth = dayjs(currentMonth).add(1, 'month');
    if (nextMonth.isAfter(dayjs(), 'month')) {
      Taro.showToast({ title: '不能选择未来月份', icon: 'none' });
      return;
    }
    setCurrentMonth(nextMonth.format('YYYY-MM'));
  };

  const handleMonthChange = (e: any) => {
    setCurrentMonth(e.detail.value);
  };

  const getDateSummary = (date: string) => {
    const dayBills = filteredBills.filter(b => b.date === date);
    const income = dayBills.filter(b => b.type === 'income').reduce((s, b) => s + b.amount, 0);
    const expense = dayBills.filter(b => b.type === 'expense').reduce((s, b) => s + b.amount, 0);
    return { income, expense };
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className="pageContainer">
        <View className={styles.searchBar}>
          <View className={styles.searchInputWrapper}>
            <Text className={styles.searchIcon}>🔍</Text>
            <Input
              className={styles.searchInput}
              value={searchKeyword}
              onInput={(e) => setSearchKeyword(e.detail.value)}
              placeholder="搜索备注或金额..."
              placeholderStyle="color: #CBD5E1"
            />
          </View>
        </View>

        <ScrollView className={styles.filterTabs} scrollX showScrollbar={false}>
          <View
            className={classnames(styles.filterTab, filterType === 'all' && styles.active)}
            onClick={() => setFilterType('all')}
          >
            全部
          </View>
          <View
            className={classnames(styles.filterTab, filterType === 'expense' && styles.active)}
            onClick={() => setFilterType('expense')}
          >
            支出
          </View>
          <View
            className={classnames(styles.filterTab, filterType === 'income' && styles.active)}
            onClick={() => setFilterType('income')}
          >
            收入
          </View>
        </ScrollView>

        <View className={styles.monthSelector}>
          <Button className={styles.monthArrow} onClick={handlePrevMonth}>‹</Button>
          <Picker mode="date" fields="month" value={currentMonth} onChange={handleMonthChange}>
            <Text className={styles.monthText}>
              {dayjs(currentMonth).format('YYYY年MM月')}
            </Text>
          </Picker>
          <Button className={styles.monthArrow} onClick={handleNextMonth}>›</Button>
        </View>

        <View className={styles.summaryCard}>
          <View className={styles.summaryItem}>
            <Text className={styles.label}>收入</Text>
            <Text className={`${styles.value} ${styles.income}`}>+¥{formatMoney(summary.totalIncome)}</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.label}>支出</Text>
            <Text className={`${styles.value} ${styles.expense}`}>-¥{formatMoney(summary.totalExpense)}</Text>
          </View>
        </View>

        <View className={styles.billList}>
          {filteredBills.length === 0 ? (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📋</Text>
              <Text className={styles.emptyText}>暂无账单记录</Text>
              <Text className={styles.emptySubtext}>
                {searchKeyword ? '试试其他搜索关键词' : '点击下方记一笔添加账单'}
              </Text>
            </View>
          ) : (
            Object.entries(billsByDate).map(([date, dayBills]) => {
              const { income, expense } = getDateSummary(date);
              return (
                <View key={date} className={styles.dateGroup}>
                  <View className={styles.dateHeader}>
                    <Text className={styles.dateText}>{formatDate(date, 'MM月DD日')}</Text>
                    <Text className={styles.dateSummary}>
                      {income > 0 && <Text className={styles.incomeText}>收 ¥{formatMoney(income)} </Text>}
                      {expense > 0 && <Text className={styles.expenseText}>支 ¥{formatMoney(expense)}</Text>}
                    </Text>
                  </View>
                  {dayBills.map((bill) => (
                    <BillItem
                      key={bill.id}
                      bill={bill}
                      onClick={() => goToBillDetail(bill.id)}
                    />
                  ))}
                </View>
              );
            })
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default LedgerPage;
