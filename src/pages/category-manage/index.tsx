import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

const CategoryManagePage: React.FC = () => {
  return (
    <View className={styles.page}>
      <Text className={styles.icon}>🏷️</Text>
      <Text className={styles.title}>分类管理</Text>
      <Text className={styles.subtitle}>功能正在开发中...</Text>
    </View>
  );
};

export default CategoryManagePage;
