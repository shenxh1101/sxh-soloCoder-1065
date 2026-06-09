import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView, Button, Picker, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import dayjs from 'dayjs';
import { BillType, RecurringType } from '@/types';
import { useFinanceStore } from '@/store/useFinanceStore';
import { formatMoney } from '@/utils/format';
import CategoryIcon from '@/components/CategoryIcon';
import styles from './index.module.scss';

const RecordPage: React.FC = () => {
  const [type, setType] = useState<BillType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('a4');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [photoUrl, setPhotoUrl] = useState('');
  const [recurring, setRecurring] = useState<RecurringType>('none');
  const [showAccountSelector, setShowAccountSelector] = useState(false);

  const getCategories = useFinanceStore((state) => state.getCategories);
  const getAccounts = useFinanceStore((state) => state.getAccounts);
  const getTemplates = useFinanceStore((state) => state.getTemplates);
  const getCategory = useFinanceStore((state) => state.getCategory);
  const getAccount = useFinanceStore((state) => state.getAccountById);
  const addBill = useFinanceStore((state) => state.addBill);

  const categories = useMemo(() => getCategories(type), [getCategories, type]);
  const accounts = getAccounts();
  const templates = useMemo(() => getTemplates().filter(t => t.type === type), [getTemplates, type]);
  const selectedAccount = getAccount(accountId);

  const handleTypeChange = (newType: BillType) => {
    setType(newType);
    setCategoryId('');
  };

  const handleTemplateClick = (template: any) => {
    setAmount(template.amount.toString());
    setCategoryId(template.categoryId);
    setAccountId(template.accountId);
    setNote(template.note);
  };

  const handleTakePhoto = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sourceType: ['camera', 'album'],
      });
      if (res.tempFilePaths && res.tempFilePaths.length > 0) {
        setPhotoUrl(res.tempFilePaths[0]);
        console.log('[Record] Photo selected:', res.tempFilePaths[0]);
      }
    } catch (error) {
      console.error('[Record] Failed to take photo:', error);
      Taro.showToast({ title: '拍照失败', icon: 'none' });
    }
  };

  const handleSave = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Taro.showToast({ title: '请输入金额', icon: 'none' });
      return;
    }
    if (!categoryId) {
      Taro.showToast({ title: '请选择分类', icon: 'none' });
      return;
    }
    if (!accountId) {
      Taro.showToast({ title: '请选择账户', icon: 'none' });
      return;
    }

    addBill({
      type,
      amount: parseFloat(amount),
      categoryId,
      accountId,
      note,
      photoUrl,
      date,
      recurring,
    });

    Taro.showToast({ title: '保存成功', icon: 'success' });
    console.log('[Record] Bill saved:', { type, amount, categoryId, accountId, date });

    setTimeout(() => {
      setAmount('');
      setNote('');
      setPhotoUrl('');
      Taro.switchTab({ url: '/pages/home/index' });
    }, 1000);
  };

  const handleDateChange = (e: any) => {
    setDate(e.detail.value);
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className="pageContainer">
        <View className={styles.typeSwitch}>
          <View
            className={classnames(styles.switchTab, type === 'expense' && styles.active && styles.expense)}
            onClick={() => handleTypeChange('expense')}
          >
            支出
          </View>
          <View
            className={classnames(styles.switchTab, type === 'income' && styles.active && styles.income)}
            onClick={() => handleTypeChange('income')}
          >
            收入
          </View>
        </View>

        <View className={styles.amountSection}>
          <Text className={styles.amountLabel}>金额</Text>
          <View>
            <Text className={styles.prefix}>¥</Text>
            <Input
              className={classnames(styles.amountInput, type)}
              type="digit"
              value={amount}
              onInput={(e) => setAmount(e.detail.value)}
              placeholder="0.00"
              placeholderStyle="color: #CBD5E1"
              focus
            />
          </View>
        </View>

        {templates.length > 0 && (
          <View className={styles.card}>
            <Text className={styles.sectionTitle}>常用模板</Text>
            <ScrollView className={styles.templatesScroll} scrollX showScrollbar={false}>
              {templates.map((template) => {
                const cat = getCategory(template.categoryId);
                return (
                  <View
                    key={template.id}
                    className={classnames(styles.templateItem, categoryId === template.categoryId && styles.selected)}
                    onClick={() => handleTemplateClick(template)}
                  >
                    {cat && (
                      <CategoryIcon icon={cat.icon} color={cat.color} size="sm" />
                    )}
                    <Text className={styles.templateName}>{template.name}</Text>
                    <Text className={styles.templateAmount}>¥{formatMoney(template.amount)}</Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        <View className={styles.card}>
          <Text className={styles.sectionTitle}>选择分类</Text>
          <View className={styles.categoriesGrid}>
            {categories.map((category) => (
              <View
                key={category.id}
                className={classnames(styles.categoryItem, categoryId === category.id && styles.selected)}
                onClick={() => setCategoryId(category.id)}
              >
                <CategoryIcon
                  icon={category.icon}
                  color={category.color}
                  size="md"
                  selected={categoryId === category.id}
                />
                <Text className={styles.categoryName}>{category.name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.card}>
          <View className={styles.formItem} onClick={() => setShowAccountSelector(!showAccountSelector)}>
            <View className={styles.formLabel}>
              <Text>💳</Text>
              <Text>账户</Text>
            </View>
            <View className={styles.formValue}>
              <Text>{selectedAccount?.name || '请选择'}</Text>
              <Text>›</Text>
            </View>
          </View>

          {showAccountSelector && (
            <View className={styles.accountSelector}>
              {accounts.map((account) => (
                <View
                  key={account.id}
                  className={classnames(styles.accountOption, accountId === account.id && styles.selected)}
                  onClick={() => {
                    setAccountId(account.id);
                    setShowAccountSelector(false);
                  }}
                >
                  {account.name} (¥{formatMoney(account.balance)})
                </View>
              ))}
            </View>
          )}

          <Picker mode="date" value={date} onChange={handleDateChange}>
            <View className={styles.formItem}>
              <View className={styles.formLabel}>
                <Text>📅</Text>
                <Text>日期</Text>
              </View>
              <View className={styles.formValue}>
                <Text>{date}</Text>
                <Text>›</Text>
              </View>
            </View>
          </Picker>

          <Picker
            mode="selector"
            range={['不重复', '每天', '每周', '每月', '每年']}
            value={recurring === 'none' ? 0 : recurring === 'daily' ? 1 : recurring === 'weekly' ? 2 : recurring === 'monthly' ? 3 : 4}
            onChange={(e) => {
              const values: RecurringType[] = ['none', 'daily', 'weekly', 'monthly', 'yearly'];
              setRecurring(values[parseInt(e.detail.value)]);
            }}
          >
            <View className={styles.formItem}>
              <View className={styles.formLabel}>
                <Text>🔄</Text>
                <Text>重复</Text>
              </View>
              <View className={styles.formValue}>
                <Text className={recurring !== 'none' ? styles.recurringActive : ''}>
                  {recurring === 'none' ? '不重复' : recurring === 'daily' ? '每天' : recurring === 'weekly' ? '每周' : recurring === 'monthly' ? '每月' : '每年'}
                </Text>
                <Text>›</Text>
              </View>
            </View>
          </Picker>

          <View className={styles.formItem}>
            <View className={styles.formLabel}>
              <Text>📝</Text>
              <Text>备注</Text>
            </View>
            <Input
              className={styles.noteInput}
              value={note}
              onInput={(e) => setNote(e.detail.value)}
              placeholder="添加备注..."
              placeholderStyle="color: #CBD5E1"
            />
          </View>

          <View className={styles.formItem}>
            <View className={styles.formLabel}>
              <Text>📷</Text>
              <Text>拍照</Text>
            </View>
            {photoUrl ? (
              <Image className={styles.photoPreview} src={photoUrl} mode="aspectFill" />
            ) : (
              <View className={styles.photoBtn} onClick={handleTakePhoto}>
                <Text>点击拍照</Text>
                <Text>›</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={!amount || !categoryId}
        >
          保存
        </Button>
      </View>
    </ScrollView>
  );
};

export default RecordPage;
