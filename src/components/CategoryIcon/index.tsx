import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import { Category } from '@/types';
import styles from './index.module.scss';

interface CategoryIconProps {
  category?: Category;
  icon?: string;
  color?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  onClick?: () => void;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ category, icon, color, name, size = 'md', selected, onClick }) => {
  const displayIcon = category?.icon || icon || '📝';
  const displayColor = category?.color || color || '#94A3B8';
  const displayName = name || category?.name;

  return (
    <View
      className={classnames(styles.categoryIcon, styles[size], selected && styles.selected)}
      style={{ backgroundColor: `${displayColor}15` }}
      onClick={onClick}
    >
      <Text className={styles.iconText} style={{ color: displayColor }}>{displayIcon}</Text>
      {displayName && <Text className={styles.name}>{displayName}</Text>}
    </View>
  );
};

export default CategoryIcon;
