import React, { useState, useMemo } from 'react';
import { View, Text, Button, Input, Image, Picker, Textarea, Modal } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { useFinanceStore } from '@/store/useFinanceStore';
import { formatMoney, formatDateCN, formatRecurring } from '@/utils/format';
import { BillType, RecurringType } from '@/types';
import CategoryIcon from '@/components/CategoryIcon';
import styles from './index.module.scss';

const BillDetailPage: React.FC = () => {
  const router = useRouter();
  const billId = router.params.id as string;

  const bills = useFinanceStore((state) => state.bills);
  const updateBill = useFinanceStore((state) => state.updateBill);
  const deleteBill = useFinanceStore((state) => state.deleteBill);
  const getCategory = useFinanceStore((state) => state.getCategory);
  const getCategories = useFinanceStore((state) => state.getCategories);
  const getAccounts = useFinanceStore((state) => state.getAccounts);
  const getAccountById = useFinanceStore((state) => state.getAccountById);

  const bill = useMemo(() => bills.find(b => b.id === billId), [bills, billId]);
  const categories = useMemo(() => bill ? getCategories(bill.type) : [], [bill, getCategories]);
  const accounts = getAccounts();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<BillType>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [recurring, setRecurring] = useState<RecurringType>('none');

  const category = bill ? getCategory(bill.categoryId) : undefined;
  const account = bill ? getAccountById(bill.accountId) : undefined;

  const recurringOptions = [
    { label: '不重复', value: 'none' },
    { label: '每天', value: 'daily' },
    { label: '每周', value: 'weekly' },
    { label: '每月', value: 'monthly' },
    { label: '每年', value: 'yearly' },
  ];

  const handleStartEdit = () => {
    if (!bill) return;
    setAmount(bill.amount.toString());
    setType(bill.type);
    setCategoryId(bill.categoryId);
    setAccountId(bill.accountId);
    setDate(bill.date);
    setNote(bill.note);
    setRecurring(bill.recurring);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!billId || !amount || !categoryId || !accountId) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    updateBill(billId, {
      type,
      amount: parseFloat(amount),
      categoryId,
      accountId,
      date,
      note,
      recurring,
    });

    Taro.showToast({ title: '保存成功', icon: 'success' });
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteBill(billId);
    Taro.showToast({ title: '删除成功', icon: 'success' });
    setTimeout(() => Taro.navigateBack(), 500);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleTypeChange = (newType: BillType) => {
    setType(newType);
    setCategoryId('');
  };

  if (!bill) {
    return (
      <View className={styles.page}>
        <View className={styles.empty}>
          <Text className={styles.emptyIcon}>📄</Text>
          <Text className={styles.emptyText}>账单不存在</Text>
          <Button className={styles.backBtn} onClick={() => Taro.navigateBack()}>返回</Button>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.header} style={{ background: type === 'income' ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' }}>
        {isEditing ? (
          <View className={styles.editAmountRow}>
            <Text className={styles.currency}>¥</Text>
            <Input
              className={styles.editAmountInput}
              type='digit'
              value={amount}
              onInput={(e) => setAmount(e.detail.value)}
              placeholder='输入金额'
              cursor={amount.length}
            />
          </View>
        ) : (
          <View className={styles.amountRow}>
            <Text className={styles.amountSign}>{bill.type === 'income' ? '+' : '-'}</Text>
            <Text className={styles.amount}>¥{formatMoney(bill.amount)}</Text>
            {bill.recurring !== 'none' && (
              <View className={styles.recurringBadge}>
                <Text className={styles.recurringText}>{formatRecurring(bill.recurring)}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {isEditing ? (
        <View className={styles.editForm}>
          <View className={styles.typeTabs}>
            <View
              className={`${styles.typeTab} ${type === 'expense' ? styles.active : ''}`}
              onClick={() => handleTypeChange('expense')}
            >
              <Text>支出</Text>
            </View>
            <View
              className={`${styles.typeTab} ${type === 'income' ? styles.active : ''}`}
              onClick={() => handleTypeChange('income')}
            >
              <Text>收入</Text>
            </View>
          </View>

          <View className={styles.sectionTitle}>
            <Text>选择分类</Text>
          </View>
          <ScrollView className={styles.categoryGrid} scrollY>
            {categories.map((cat) => (
              <View
                key={cat.id}
                className={`${styles.categoryItem} ${categoryId === cat.id ? styles.selected : ''}`}
                onClick={() => setCategoryId(cat.id)}
              >
                <CategoryIcon category={cat} size='md' />
                <Text className={styles.categoryName}>{cat.name}</Text>
              </View>
            ))}
          </ScrollView>

          <View className={styles.formGroup}>
            <Text className={styles.label}>账户</Text>
            <Picker
              mode='selector'
              range={accounts.map(a => a.name)}
              value={accounts.findIndex(a => a.id === accountId)}
              onChange={(e) => setAccountId(accounts[parseInt(e.detail.value)].id)}
            >
              <View className={styles.pickerValue}>
                <Text>{accounts.find(a => a.id === accountId)?.name || '请选择账户'}</Text>
                <Text className={styles.arrow}>›</Text>
              </View>
            </Picker>
          </View>

          <View className={styles.formGroup}>
            <Text className={styles.label}>日期</Text>
            <Picker
              mode='date'
              value={date}
              onChange={(e) => setDate(e.detail.value)}
            >
              <View className={styles.pickerValue}>
                <Text>{date}</Text>
                <Text className={styles.arrow}>›</Text>
              </View>
            </Picker>
          </View>

          <View className={styles.formGroup}>
            <Text className={styles.label}>重复</Text>
            <Picker
              mode='selector'
              range={recurringOptions.map(o => o.label)}
              value={recurringOptions.findIndex(o => o.value === recurring)}
              onChange={(e) => setRecurring(recurringOptions[parseInt(e.detail.value)].value as RecurringType)}
            >
              <View className={styles.pickerValue}>
                <Text>{recurringOptions.find(o => o.value === recurring)?.label}</Text>
                <Text className={styles.arrow}>›</Text>
              </View>
            </Picker>
          </View>

          <View className={styles.formGroup}>
            <Text className={styles.label}>备注</Text>
            <Textarea
              className={styles.textarea}
              value={note}
              onInput={(e) => setNote(e.detail.value)}
              placeholder='添加备注...'
              maxlength={200}
            />
          </View>

          <View className={styles.actionButtons}>
            <Button className={styles.cancelBtn} onClick={handleCancel}>取消</Button>
            <Button className={styles.saveBtn} onClick={handleSave}>保存</Button>
          </View>
        </View>
      ) : (
        <View className={styles.detailList}>
          <View className={styles.detailItem}>
            <Text className={styles.detailLabel}>分类</Text>
            <View className={styles.detailValueRow}>
              {category && <CategoryIcon category={category} size='sm' />}
              <Text className={styles.detailValue}>{category?.name}</Text>
            </View>
          </View>

          <View className={styles.detailItem}>
            <Text className={styles.detailLabel}>账户</Text>
            <View className={styles.detailValueRow}>
              <View className={styles.accountDot} style={{ backgroundColor: account?.color }} />
              <Text className={styles.detailValue}>{account?.name}</Text>
            </View>
          </View>

          <View className={styles.detailItem}>
            <Text className={styles.detailLabel}>日期</Text>
            <Text className={styles.detailValue}>{formatDateCN(bill.date)} · {bill.date}</Text>
          </View>

          {bill.recurring !== 'none' && (
            <View className={styles.detailItem}>
              <Text className={styles.detailLabel}>重复周期</Text>
              <View className={styles.recurringTag}>
                <Text className={styles.recurringTagText}>🔄 {formatRecurring(bill.recurring)}</Text>
              </View>
            </View>
          )}

          {bill.note && (
            <View className={styles.detailItem}>
              <Text className={styles.detailLabel}>备注</Text>
              <Text className={styles.detailValue}>{bill.note}</Text>
            </View>
          )}

          {bill.photoUrl && (
            <View className={styles.detailItem}>
              <Text className={styles.detailLabel}>照片</Text>
              <Image className={styles.photo} src={bill.photoUrl} mode='aspectFill' />
            </View>
          )}
        </View>
      )}

      {!isEditing && (
        <View className={styles.bottomActions}>
          <Button className={styles.editBtn} onClick={handleStartEdit}>
            <Text>✏️ 编辑</Text>
          </Button>
          <Button className={styles.deleteBtn} onClick={() => setShowDeleteModal(true)}>
            <Text>🗑️ 删除</Text>
          </Button>
        </View>
      )}

      <Modal
        title='确认删除'
        content='确定要删除这条账单记录吗？删除后无法恢复。'
        cancelText='取消'
        confirmText='删除'
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        show={showDeleteModal}
      />
    </View>
  );
};

export default BillDetailPage;
