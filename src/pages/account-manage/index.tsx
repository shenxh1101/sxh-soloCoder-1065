import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

const AccountManagePage: React.FC = () => {
  return (
    <View className={styles.page}>
      <Text className={styles.icon}>💳</Text>
      <Text className={styles.title}>账户管理</Text>
      <Text className={styles.subtitle}>功能正在开发中...</Text>
    </View>
  );
};

export default AccountManagePage;
