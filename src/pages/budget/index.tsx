import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button, Input, Picker, Modal } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useFinanceStore } from '@/store/useFinanceStore';
import { formatMoney } from '@/utils/format';
import { Category } from '@/types';
import CategoryIcon from '@/components/CategoryIcon';
import ProgressBar from '@/components/ProgressBar';
import styles from './index.module.scss';

const BudgetPage: React.FC = () => {
  const bills = useFinanceStore((state) => state.bills);
  const budgets = useFinanceStore((state) => state.budgets);
  const currentMonth = useFinanceStore((state) => state.currentMonth);
  const getTotalBudget = useFinanceStore((state) => state.getTotalBudget);
  const getCategoryBudgets = useFinanceStore((state) => state.getCategoryBudgets);
  const getCategory = useFinanceStore((state) => state.getCategory);
  const getCategories = useFinanceStore((state) => state.getCategories);
  const updateTotalBudget = useFinanceStore((state) => state.updateTotalBudget);
  const addCategoryBudget = useFinanceStore((state) => state.addCategoryBudget);
  const updateCategoryBudget = useFinanceStore((state) => state.updateCategoryBudget);

  const totalBudget = useMemo(() => getTotalBudget(), [getTotalBudget, bills, budgets]);
  const categoryBudgets = useMemo(() => getCategoryBudgets(), [getCategoryBudgets, bills, budgets]);
  const expenseCategories = useMemo(() => getCategories('expense'), [getCategories]);

  const [showEditTotalModal, setShowEditTotalModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [totalBudgetAmount, setTotalBudgetAmount] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [categoryBudgetAmount, setCategoryBudgetAmount] = useState('');
  const [editingBudget, setEditingBudget] = useState<string | null>(null);

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
    setTotalBudgetAmount(totalBudget?.amount.toString() || '');
    setShowEditTotalModal(true);
  };

  const handleSaveTotalBudget = () => {
    const amount = parseFloat(totalBudgetAmount);
    if (isNaN(amount) || amount <= 0) {
      Taro.showToast({ title: '请输入有效金额', icon: 'none' });
      return;
    }
    updateTotalBudget(amount);
    setShowEditTotalModal(false);
    Taro.showToast({ title: '保存成功', icon: 'success' });
  };

  const handleAddBudget = () => {
    setSelectedCategoryId('');
    setCategoryBudgetAmount('');
    setEditingBudget(null);
    setShowAddCategoryModal(true);
  };

  const handleEditCategoryBudget = (budgetId: string, categoryId: string, amount: number) => {
    setSelectedCategoryId(categoryId);
    setCategoryBudgetAmount(amount.toString());
    setEditingBudget(budgetId);
    setShowAddCategoryModal(true);
  };

  const handleSaveCategoryBudget = () => {
    const amount = parseFloat(categoryBudgetAmount);
    if (!selectedCategoryId) {
      Taro.showToast({ title: '请选择分类', icon: 'none' });
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      Taro.showToast({ title: '请输入有效金额', icon: 'none' });
      return;
    }

    if (editingBudget) {
      updateCategoryBudget(editingBudget, amount);
    } else {
      addCategoryBudget(selectedCategoryId, amount);
    }

    setShowAddCategoryModal(false);
    Taro.showToast({ title: '保存成功', icon: 'success' });
  };

  const selectedCategory = selectedCategoryId ? getCategory(selectedCategoryId) : null;
  const availableCategories = useMemo(() => {
    const budgetedCategoryIds = new Set(categoryBudgets.map(b => b.categoryId));
    if (editingBudget) {
      const current = categoryBudgets.find(b => b.id === editingBudget);
      return expenseCategories.filter(c => 
        !budgetedCategoryIds.has(c.id) || c.id === current?.categoryId
      );
    }
    return expenseCategories.filter(c => !budgetedCategoryIds.has(c.id));
  }, [expenseCategories, categoryBudgets, editingBudget]);

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
              {totalBudget ? '编辑' : '设置'}
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
                  <View 
                    key={budget.id} 
                    className={styles.categoryItem}
                    onClick={() => handleEditCategoryBudget(budget.id, budget.categoryId!, budget.amount)}
                  >
                    {category && (
                      <CategoryIcon category={category} size="md" />
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
                    <Text className={styles.editArrow}>›</Text>
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

      <Modal
        title={totalBudget ? '编辑总预算' : '设置本月总预算'}
        onCancel={() => setShowEditTotalModal(false)}
        onConfirm={handleSaveTotalBudget}
        show={showEditTotalModal}
        cancelText='取消'
        confirmText='保存'
      >
        <View className={styles.modalContent}>
          <Text className={styles.modalLabel}>预算金额 (元)</Text>
          <Input
            className={styles.modalInput}
            type='digit'
            value={totalBudgetAmount}
            onInput={(e) => setTotalBudgetAmount(e.detail.value)}
            placeholder='请输入预算金额'
            focus
          />
        </View>
      </Modal>

      <Modal
        title={editingBudget ? '编辑分类预算' : '添加分类预算'}
        onCancel={() => setShowAddCategoryModal(false)}
        onConfirm={handleSaveCategoryBudget}
        show={showAddCategoryModal}
        cancelText='取消'
        confirmText='保存'
      >
        <View className={styles.modalContent}>
          <Text className={styles.modalLabel}>选择分类</Text>
          {selectedCategory ? (
            <View 
              className={styles.selectedCategory}
              onClick={() => setSelectedCategoryId('')}
            >
              <CategoryIcon category={selectedCategory} size='md' />
              <Text className={styles.selectedCategoryName}>{selectedCategory.name}</Text>
              <Text className={styles.changeBtn}>更换</Text>
            </View>
          ) : (
            <ScrollView className={styles.categoryPicker} scrollY>
              {availableCategories.map((cat) => (
                <View
                  key={cat.id}
                  className={classnames(styles.categoryOption, selectedCategoryId === cat.id && styles.selected)}
                  onClick={() => setSelectedCategoryId(cat.id)}
                >
                  <CategoryIcon category={cat} size='sm' />
                  <Text className={styles.categoryOptionName}>{cat.name}</Text>
                </View>
              ))}
            </ScrollView>
          )}

          <Text className={styles.modalLabel}>预算金额 (元)</Text>
          <Input
            className={styles.modalInput}
            type='digit'
            value={categoryBudgetAmount}
            onInput={(e) => setCategoryBudgetAmount(e.detail.value)}
            placeholder='请输入预算金额'
          />
        </View>
      </Modal>
    </ScrollView>
  );
};

export default BudgetPage;
