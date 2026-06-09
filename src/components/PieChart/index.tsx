import React, { useEffect, useRef } from 'react';
import { View, Canvas } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { drawPieChart } from '@/utils/chart';
import { CategoryStat } from '@/types';
import styles from './index.module.scss';

interface PieChartProps {
  data: CategoryStat[];
  size?: number;
}

const PieChart: React.FC<PieChartProps> = ({ data, size = 400 }) => {
  const canvasRef = useRef<any>(null);

  useEffect(() => {
    const initCanvas = async () => {
      try {
        const query = Taro.createSelectorQuery();
        query.select('#pieCanvas')
          .fields({ node: true, size: true })
          .exec((res) => {
            if (!res || !res[0] || !res[0].node) {
              console.warn('[PieChart] Canvas not found');
              return;
            }
            const canvas = res[0].node;
            const ctx = canvas.getContext('2d');
            const dpr = Taro.getSystemInfoSync().pixelRatio;
            canvas.width = size * dpr;
            canvas.height = size * dpr;
            ctx.scale(dpr, dpr);

            const chartData = data.map(item => ({
              value: item.amount,
              color: item.color,
            }));
            drawPieChart(ctx, chartData, size, size);
          });
      } catch (error) {
        console.error('[PieChart] Failed to init canvas:', error);
      }
    };

    initCanvas();
  }, [data, size]);

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <View className={styles.container}>
      <View className={styles.chartWrapper} style={{ width: size, height: size }}>
        <Canvas
          id="pieCanvas"
          type="2d"
          ref={canvasRef}
          style={{ width: size, height: size }}
        />
        <View className={styles.centerText}>
          <View className={styles.centerLabel}>总计</View>
          <View className={styles.centerValue}>¥{total.toFixed(2)}</View>
        </View>
      </View>
      <View className={styles.legend}>
        {data.slice(0, 5).map((item) => (
          <View key={item.categoryId} className={styles.legendItem}>
            <View className={styles.legendDot} style={{ backgroundColor: item.color }} />
            <View className={styles.legendInfo}>
              <View className={styles.legendName}>{item.categoryName}</View>
              <View className={styles.legendValue}>
                ¥{item.amount.toFixed(2)} · {item.percentage.toFixed(1)}%
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default PieChart;
