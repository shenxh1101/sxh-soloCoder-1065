import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import { Bill } from '@/types';
import { useFinanceStore } from '@/store/useFinanceStore';
import { formatMoney, formatDateCN, formatRecurring } from '@/utils/format';
import CategoryIcon from '@/components/CategoryIcon';
import styles from './index.module.scss';

interface BillItemProps {
  bill: Bill;
  onClick?: () => void;
}

const BillItem: React.FC<BillItemProps> = ({ bill, onClick }) => {
  const getCategory = useFinanceStore((state) => state.getCategory);
  const getAccount = useFinanceStore((state) => state.getAccountById);
  const category = getCategory(bill.categoryId);
  const account = getAccount(bill.accountId);

  return (
    <View className={styles.billItem} onClick={onClick}>
      <View className={styles.left}>
        {category && (
          <CategoryIcon category={category} size="sm" />
        )}
        <View className={styles.info}>
          <View className={styles.row}>
            <Text className={styles.categoryName}>{category?.name || '未分类'}</Text>
            {bill.recurring !== 'none' && (
              <View className={styles.recurringTag}>
                <Text className={styles.recurringText}>🔄 {formatRecurring(bill.recurring)}</Text>
              </View>
            )}
          </View>
          <View className={styles.row}>
            <Text className={styles.note}>{bill.note}</Text>
            <Text className={styles.account}>{account?.name}</Text>
          </View>
        </View>
      </View>
      <View className={styles.right}>
        <Text
          className={classnames(styles.amount, bill.type === 'income' ? styles.income : styles.expense)}
        >
          {bill.type === 'income' ? '+' : '-'}{formatMoney(bill.amount)}
        </Text>
        <Text className={styles.date}>{formatDateCN(bill.date)}</Text>
      </View>
    </View>
  );
};

export default BillItem;
