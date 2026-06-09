import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import dayjs from 'dayjs';
import { BillType } from '@/types';
import { useFinanceStore } from '@/store/useFinanceStore';
import { formatMoney } from '@/utils/format';
import PieChart from '@/components/PieChart';
import LineChart from '@/components/LineChart';
import styles from './index.module.scss';

const ReportPage: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(dayjs().format('YYYY-MM'));
  const [pieType, setPieType] = useState<BillType>('expense');

  const bills = useFinanceStore((state) => state.bills);
  const getSummary = useFinanceStore((state) => state.getSummary);
  const getCategoryStats = useFinanceStore((state) => state.getCategoryStats);
  const getDailyTrend = useFinanceStore((state) => state.getDailyTrend);
  const getBillsByMonth = useFinanceStore((state) => state.getBillsByMonth);

  const summary = useMemo(() => getSummary(currentMonth), [getSummary, currentMonth, bills]);
  const categoryStats = useMemo(() => getCategoryStats(pieType, currentMonth), [getCategoryStats, pieType, currentMonth, bills]);
  const dailyTrend = useMemo(() => getDailyTrend(currentMonth), [getDailyTrend, currentMonth, bills]);
  const allBills = useMemo(() => getBillsByMonth(currentMonth), [getBillsByMonth, currentMonth, bills]);

  const topExpenseCategory = useMemo(() => {
    const stats = getCategoryStats('expense', currentMonth);
    return stats.length > 0 ? stats[0] : null;
  }, [getCategoryStats, currentMonth, bills]);

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

  const handleExport = () => {
    Taro.showModal({
      title: '导出月报',
      content: `确定导出 ${dayjs(currentMonth).format('YYYY年MM月')} 的财务报表吗？`,
      success: (res) => {
        if (res.confirm) {
          console.log('[Report] Export report for:', currentMonth);
          Taro.showLoading({ title: '生成中...' });
          setTimeout(() => {
            Taro.hideLoading();
            Taro.showToast({ title: '导出成功', icon: 'success' });
          }, 1500);
        }
      },
    });
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className="pageContainer">
        <View className={styles.monthSelector}>
          <Button className={styles.monthArrow} onClick={handlePrevMonth}>‹</Button>
          <Picker mode="date" fields="month" value={currentMonth} onChange={handleMonthChange}>
            <Text className={styles.monthText}>
              {dayjs(currentMonth).format('YYYY年MM月')}
            </Text>
          </Picker>
          <Button className={styles.monthArrow} onClick={handleNextMonth}>›</Button>
        </View>

        <View className={styles.statsGrid}>
          <View className={styles.statCard}>
            <Text className={styles.label}>总收入</Text>
            <Text className={`${styles.value} ${styles.income}`}>+¥{formatMoney(summary.totalIncome)}</Text>
            <Text className={styles.subtitle}>共 {allBills.filter(b => b.type === 'income').length} 笔</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.label}>总支出</Text>
            <Text className={`${styles.value} ${styles.expense}`}>-¥{formatMoney(summary.totalExpense)}</Text>
            <Text className={styles.subtitle}>共 {allBills.filter(b => b.type === 'expense').length} 笔</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.label}>本月结余</Text>
            <Text className={`${styles.value} ${styles.primary}`}>¥{formatMoney(summary.balance)}</Text>
            <Text className={styles.subtitle}>
              {summary.balance >= 0 ? '结余良好' : '入不敷出'}
            </Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.label}>最大支出</Text>
            <Text className={`${styles.value} ${styles.expense}`}>
              {topExpenseCategory ? topExpenseCategory.categoryName : '-'}
            </Text>
            <Text className={styles.subtitle}>
              {topExpenseCategory ? `¥${formatMoney(topExpenseCategory.amount)}` : '暂无数据'}
            </Text>
          </View>
        </View>

        <View className={styles.card}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardTitle}>分类占比</Text>
          </View>
          <View className={styles.typeSwitch}>
            <View
              className={classnames(styles.switchTab, pieType === 'expense' && styles.active && styles.expense)}
              onClick={() => setPieType('expense')}
            >
              支出
            </View>
            <View
              className={classnames(styles.switchTab, pieType === 'income' && styles.active && styles.income)}
              onClick={() => setPieType('income')}
            >
              收入
            </View>
          </View>

          {categoryStats.length > 0 ? (
            <View className={styles.chartContainer}>
              <PieChart data={categoryStats} size={320} />
            </View>
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📊</Text>
              <Text className={styles.emptyText}>暂无{pieType === 'expense' ? '支出' : '收入'}数据</Text>
            </View>
          )}
        </View>

        <View className={styles.card}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardTitle}>收支趋势</Text>
            <Text className={styles.moreLink}>每日数据</Text>
          </View>
          <View className={styles.chartContainer}>
            <LineChart data={dailyTrend} width={680} height={380} />
          </View>
        </View>

        <Button className={styles.exportBtn} onClick={handleExport}>
          📄 导出月报
        </Button>
      </View>
    </ScrollView>
  );
};

export default ReportPage;
