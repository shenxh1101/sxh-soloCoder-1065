import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface ProgressBarProps {
  value: number;
  max: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  warningThreshold?: number;
  dangerThreshold?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  showLabel = true,
  size = 'md',
  color,
  warningThreshold = 0.8,
  dangerThreshold = 1,
}) => {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const ratio = value / max;
  let barColor = color || '#10B981';
  if (ratio >= dangerThreshold) barColor = '#EF4444';
  else if (ratio >= warningThreshold) barColor = '#F59E0B';

  return (
    <View className={styles.container}>
      <View className={classnames(styles.track, styles[size])}>
        <View
          className={styles.fill}
          style={{
            width: `${percentage}%`,
            backgroundColor: barColor,
          }}
        />
      </View>
      {showLabel && (
        <Text className={styles.label} style={{ color: barColor }}>
          {percentage.toFixed(0)}%
        </Text>
      )}
    </View>
  );
};

export default ProgressBar;
