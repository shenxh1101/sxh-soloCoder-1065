import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useFinanceStore } from '@/store/useFinanceStore';
import { formatMoney, formatDate, groupBillsByDate } from '@/utils/format';
import StatCard from '@/components/StatCard';
import CategoryIcon from '@/components/CategoryIcon';
import BillItem from '@/components/BillItem';
import ProgressBar from '@/components/ProgressBar';
import styles from './index.module.scss';

const HomePage: React.FC = () => {
  const bills = useFinanceStore((state) => state.bills);
  const budgets = useFinanceStore((state) => state.budgets);
  const currentMonth = useFinanceStore((state) => state.currentMonth);
  const getTotalBalance = useFinanceStore((state) => state.getTotalBalance);
  const getSummary = useFinanceStore((state) => state.getSummary);
  const getBillsByMonth = useFinanceStore((state) => state.getBillsByMonth);
  const getTotalBudget = useFinanceStore((state) => state.getTotalBudget);
  const getCategoryStats = useFinanceStore((state) => state.getCategoryStats);
  const getCategory = useFinanceStore((state) => state.getCategory);

  const totalBalance = getTotalBalance();
  const summary = useMemo(() => getSummary(currentMonth), [getSummary, currentMonth, bills]);
  const recentBills = useMemo(() => getBillsByMonth(currentMonth).slice(0, 5), [getBillsByMonth, currentMonth, bills]);
  const budget = useMemo(() => getTotalBudget(), [getTotalBudget, bills, budgets]);
  const expenseStats = useMemo(() => getCategoryStats('expense', currentMonth).slice(0, 3), [getCategoryStats, currentMonth, bills]);
  const billsByDate = useMemo(() => groupBillsByDate(recentBills), [recentBills]);

  const goToRecord = () => {
    Taro.switchTab({ url: '/pages/record/index' });
  };

  const goToBillDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/bill-detail/index?id=${id}` });
  };

  const goToLedger = () => {
    Taro.switchTab({ url: '/pages/ledger/index' });
  };

  const goToBudget = () => {
    Taro.switchTab({ url: '/pages/budget/index' });
  };

  const budgetStatus = useMemo(() => {
    if (!budget) return { status: 'normal', text: '' };
    const ratio = budget.spent / budget.amount;
    if (ratio >= 1) return { status: 'danger', text: '已超支！' };
    if (ratio >= 0.8) return { status: 'warning', text: '即将超支' };
    return { status: 'normal', text: '预算充足' };
  }, [budget]);

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.greeting}>早上好 👋</Text>
        <View className={styles.assetCard}>
          <Text className={styles.label}>总资产 (元)</Text>
          <Text className={styles.amount}>¥{formatMoney(totalBalance)}</Text>
          <Text className={styles.subtitle}>
            本月结余: ¥{formatMoney(summary.balance)}
          </Text>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.statsRow}>
          <StatCard
            title="本月收入"
            value={`¥${formatMoney(summary.totalIncome)}`}
            color="income"
          />
          <StatCard
            title="本月支出"
            value={`¥${formatMoney(summary.totalExpense)}`}
            color="expense"
          />
        </View>

        <View className={styles.quickAction} onClick={goToRecord}>
          <Text className={styles.icon}>✏️</Text>
          <Text>记一笔</Text>
        </View>

        {budget && (
          <View className={styles.card} onClick={goToBudget}>
            <View className={styles.cardHeader}>
              <Text className={styles.cardTitle}>本月预算</Text>
              <Text className={styles.moreLink}>{budgetStatus.text} ›</Text>
            </View>
            <View className={styles.budgetRow}>
              <Text className={styles.budgetLabel}>已使用</Text>
              <Text className={`${styles.budgetValue} ${styles[budgetStatus.status]}`}>
                ¥{formatMoney(budget.spent)} / ¥{formatMoney(budget.amount)}
              </Text>
            </View>
            <ProgressBar value={budget.spent} max={budget.amount} />
            <View className={styles.budgetRemaining}>
              <Text className={styles.remainingLabel}>预算剩余</Text>
              <Text className={styles.remainingValue} style={{ color: budgetStatus.status === 'danger' ? '#EF4444' : budgetStatus.status === 'warning' ? '#F59E0B' : '#10B981' }}>
                ¥{formatMoney(Math.max(0, budget.amount - budget.spent))}
              </Text>
            </View>
          </View>
        )}

        {expenseStats.length > 0 && (
          <View className={styles.card}>
            <View className={styles.cardHeader}>
              <Text className={styles.cardTitle}>消费重点</Text>
              <Text className={styles.moreLink}>查看详情 ›</Text>
            </View>
            <View className={styles.topCategories}>
              {expenseStats.map((stat) => {
                const category = getCategory(stat.categoryId);
                return (
                  <View key={stat.categoryId} className={styles.topCategoryItem}>
                    {category && (
                      <CategoryIcon icon={category.icon} color={category.color} size="md" />
                    )}
                    <Text className={styles.catName}>{stat.categoryName}</Text>
                    <Text className={styles.catAmount}>¥{formatMoney(stat.amount)}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View className={styles.card}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardTitle}>最近交易</Text>
            <Text className={styles.moreLink} onClick={goToLedger}>查看全部 ›</Text>
          </View>
          <View className={styles.billList}>
            {recentBills.length === 0 ? (
              <View className={styles.emptyState}>
                <Text className={styles.emptyIcon}>📝</Text>
                <Text className={styles.emptyText}>暂无账单，点击上方记一笔</Text>
              </View>
            ) : (
              Object.entries(billsByDate).map(([date, dayBills]) => {
                const dayIncome = dayBills.filter(b => b.type === 'income').reduce((s, b) => s + b.amount, 0);
                const dayExpense = dayBills.filter(b => b.type === 'expense').reduce((s, b) => s + b.amount, 0);
                return (
                  <View key={date} className={styles.dateGroup}>
                    <View className={styles.dateHeader}>
                      <Text className={styles.dateText}>{formatDate(date, 'MM月DD日')}</Text>
                      <Text className={styles.dateSummary}>
                        收 ¥{formatMoney(dayIncome)} · 支 ¥{formatMoney(dayExpense)}
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
      </View>
    </ScrollView>
  );
};

export default HomePage;
