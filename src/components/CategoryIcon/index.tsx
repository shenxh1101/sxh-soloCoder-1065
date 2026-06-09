import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface CategoryIconProps {
  icon: string;
  color: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  onClick?: () => void;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ icon, color, name, size = 'md', selected, onClick }) => {
  return (
    <View
      className={classnames(styles.categoryIcon, styles[size], selected && styles.selected)}
      style={{ backgroundColor: `${color}15` }}
      onClick={onClick}
    >
      <Text className={styles.iconText} style={{ color }}>{icon}</Text>
      {name && <Text className={styles.name}>{name}</Text>}
    </View>
  );
};

export default CategoryIcon;
