import React, { useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useFinanceStore } from '@/store/useFinanceStore';
import { formatMoney } from '@/utils/format';
import CategoryIcon from '@/components/CategoryIcon';
import ProgressBar from '@/components/ProgressBar';
import styles from './index.module.scss';

const BudgetPage: React.FC = () => {
  const currentMonth = useFinanceStore((state) => state.currentMonth);
  const getTotalBudget = useFinanceStore((state) => state.getTotalBudget);
  const getCategoryBudgets = useFinanceStore((state) => state.getCategoryBudgets);
  const getCategory = useFinanceStore((state) => state.getCategory);

  const totalBudget = getTotalBudget();
  const categoryBudgets = getCategoryBudgets();

  const totalStatus = useMemo(() => {
    if (!totalBudget) return { status: 'normal', text: '正常' };
    const ratio = totalBudget.spent / totalBudget.amount;
    if (ratio >= 1) return { status: 'danger', text: '已超支' };
    if (ratio >= 0.8) return { status: 'warning', text: '即将超支' };
    return { status: 'normal', text: '预算充足' };
  }, [totalBudget]);

  const getCategoryStatus = (spent: number, amount: number) => {
    const ratio = spent / amount;
    if (ratio >= 1) return 'danger';
    if (ratio >= 0.8) return 'warning';
    return 'normal';
  };

  const handleEditBudget = () => {
    Taro.showToast({ title: '编辑功能开发中', icon: 'none' });
    console.log('[Budget] Edit budget clicked');
  };

  const handleAddBudget = () => {
    Taro.showToast({ title: '添加分类预算', icon: 'none' });
    console.log('[Budget] Add category budget clicked');
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className="pageContainer">
        {totalBudget && (
          <View className={styles.headerCard}>
            <Text className={styles.headerLabel}>{currentMonth} 总预算</Text>
            <Text className={styles.headerAmount}>¥{formatMoney(totalBudget.amount)}</Text>
            <View className={styles.headerSub}>
              <View className={styles.headerSubItem}>
                <Text className={styles.subLabel}>已使用</Text>
                <Text className={styles.subValue}>¥{formatMoney(totalBudget.spent)}</Text>
              </View>
              <View className={styles.headerSubItem}>
                <Text className={styles.subLabel}>剩余</Text>
                <Text className={styles.subValue}>
                  ¥{formatMoney(Math.max(0, totalBudget.amount - totalBudget.spent))}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View className={styles.card}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>总预算进度</Text>
            <Button className={styles.editBtn} onClick={handleEditBudget}>
              编辑
            </Button>
          </View>

          {totalBudget ? (
            <>
              <View className={styles.totalProgress}>
                <View className={styles.progressRow}>
                  <Text className={styles.progressLabel}>
                    本月支出
                    <Text
                      className={styles.statusBadge}
                      style={{
                        marginLeft: '16rpx',
                        background: totalStatus.status === 'danger'
                          ? 'rgba(239, 68, 68, 0.1)'
                          : totalStatus.status === 'warning'
                          ? 'rgba(245, 158, 11, 0.1)'
                          : 'rgba(16, 185, 129, 0.1)',
                        color: totalStatus.status === 'danger'
                          ? '#EF4444'
                          : totalStatus.status === 'warning'
                          ? '#F59E0B'
                          : '#10B981',
                      }}
                    >
                      {totalStatus.text}
                    </Text>
                  </Text>
                  <Text className={styles.progressValue}>
                    ¥{formatMoney(totalBudget.spent)} / ¥{formatMoney(totalBudget.amount)}
                  </Text>
                </View>
                <ProgressBar
                  value={totalBudget.spent}
                  max={totalBudget.amount}
                  size="lg"
                />
              </View>

              <View className={styles.remainingText}>
                <Text className={styles.label}>本月预算剩余</Text>
                <Text
                  className={`${styles.value} ${styles[totalStatus.status]}`}
                >
                  ¥{formatMoney(Math.max(0, totalBudget.amount - totalBudget.spent))}
                </Text>
              </View>
            </>
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>🎯</Text>
              <Text className={styles.emptyText}>还没有设置预算</Text>
              <Text className={styles.emptySubtext}>设置预算帮助您控制支出</Text>
              <Button className={styles.addBudgetBtn} onClick={handleEditBudget}>
                设置本月预算
              </Button>
            </View>
          )}
        </View>

        <View className={styles.card}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>分类预算</Text>
            <Button className={styles.editBtn} onClick={handleAddBudget}>
              + 添加
            </Button>
          </View>

          {categoryBudgets.length > 0 ? (
            <View className={styles.categoryList}>
              {categoryBudgets.map((budget) => {
                const category = getCategory(budget.categoryId!);
                const status = getCategoryStatus(budget.spent, budget.amount);
                const remaining = budget.amount - budget.spent;

                return (
                  <View key={budget.id} className={styles.categoryItem}>
                    {category && (
                      <CategoryIcon icon={category.icon} color={category.color} size="md" />
                    )}
                    <View className={styles.categoryInfo}>
                      <View className={styles.categoryTop}>
                        <View style={{ display: 'flex', alignItems: 'center', gap: '16rpx' }}>
                          <Text className={styles.categoryName}>{category?.name}</Text>
                          <Text
                            className={styles.statusBadge}
                            style={{
                              background: status === 'danger'
                                ? 'rgba(239, 68, 68, 0.1)'
                                : status === 'warning'
                                ? 'rgba(245, 158, 11, 0.1)'
                                : 'rgba(16, 185, 129, 0.1)',
                              color: status === 'danger'
                                ? '#EF4444'
                                : status === 'warning'
                                ? '#F59E0B'
                                : '#10B981',
                            }}
                          >
                            {status === 'danger' ? '已超支' : status === 'warning' ? '即将超支' : '正常'}
                          </Text>
                        </View>
                        <Text className={styles.categoryAmount}>
                          ¥{formatMoney(budget.amount)}
                        </Text>
                      </View>
                      <ProgressBar
                        value={budget.spent}
                        max={budget.amount}
                        size="sm"
                        showLabel={false}
                      />
                      <View className={styles.categoryBottom}>
                        <Text className={styles.categorySpent}>
                          已用 ¥{formatMoney(budget.spent)}
                        </Text>
                        <Text className={`${styles.categoryRemaining} ${styles[status]}`}>
                          {remaining >= 0 ? '剩余' : '超支'} ¥{formatMoney(Math.abs(remaining))}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📊</Text>
              <Text className={styles.emptyText}>暂无分类预算</Text>
              <Text className={styles.emptySubtext}>为各分类设置预算更易控制</Text>
              <Button className={styles.addBudgetBtn} onClick={handleAddBudget}>
                添加分类预算
              </Button>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default BudgetPage;
