import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  color?: 'primary' | 'income' | 'expense' | 'warning';
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, color = 'primary', onClick }) => {
  return (
    <View
      className={classnames(styles.statCard, styles[`color${color.charAt(0).toUpperCase() + color.slice(1)}`])}
      onClick={onClick}
    >
      <Text className={styles.title}>{title}</Text>
      <Text className={styles.value}>{value}</Text>
      {subtitle && <Text className={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

export default StatCard;
