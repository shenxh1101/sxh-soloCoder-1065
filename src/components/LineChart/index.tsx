import React, { useEffect, useRef } from 'react';
import { View, Text, Canvas } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { drawLineChart } from '@/utils/chart';
import { DailyTrend } from '@/types';
import styles from './index.module.scss';

interface LineChartProps {
  data: DailyTrend[];
  width?: number;
  height?: number;
}

const LineChart: React.FC<LineChartProps> = ({ data, width = 680, height = 400 }) => {
  const canvasRef = useRef<any>(null);

  useEffect(() => {
    const initCanvas = async () => {
      try {
        const query = Taro.createSelectorQuery();
        query.select('#lineCanvas')
          .fields({ node: true, size: true })
          .exec((res) => {
            if (!res || !res[0] || !res[0].node) {
              console.warn('[LineChart] Canvas not found');
              return;
            }
            const canvas = res[0].node;
            const ctx = canvas.getContext('2d');
            const dpr = Taro.getSystemInfoSync().pixelRatio;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);

            const sampleData = data.filter((_, i) => i % 3 === 0 || i === data.length - 1);
            const chartData = {
              labels: sampleData.map(d => d.date),
              datasets: [
                { label: '收入', data: sampleData.map(d => d.income), color: '#10B981' },
                { label: '支出', data: sampleData.map(d => d.expense), color: '#EF4444' },
              ],
            };
            drawLineChart(ctx, chartData, width, height);
          });
      } catch (error) {
        console.error('[LineChart] Failed to init canvas:', error);
      }
    };

    initCanvas();
  }, [data, width, height]);

  return (
    <View className={styles.container}>
      <View className={styles.legend}>
        <View className={styles.legendItem}>
          <View className={styles.legendDot} style={{ backgroundColor: '#10B981' }} />
          <Text className={styles.legendText}>收入</Text>
        </View>
        <View className={styles.legendItem}>
          <View className={styles.legendDot} style={{ backgroundColor: '#EF4444' }} />
          <Text className={styles.legendText}>支出</Text>
        </View>
      </View>
      <Canvas
        id="lineCanvas"
        type="2d"
        ref={canvasRef}
        style={{ width, height }}
      />
    </View>
  );
};

export default LineChart;
