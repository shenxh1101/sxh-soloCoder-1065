export const drawPieChart = (
  ctx: CanvasRenderingContext2D,
  data: { value: number; color: string }[],
  width: number,
  height: number
) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 20;
  const innerRadius = radius * 0.6;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return;

  let startAngle = -Math.PI / 2;

  ctx.clearRect(0, 0, width, height);

  data.forEach((item) => {
    if (item.value === 0) return;
    const sliceAngle = (item.value / total) * 2 * Math.PI;
    const endAngle = startAngle + sliceAngle;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = item.color;
    ctx.fill();

    startAngle = endAngle;
  });
};

export const drawLineChart = (
  ctx: CanvasRenderingContext2D,
  data: { labels: string[]; datasets: { label: string; data: number[]; color: string }[] },
  width: number,
  height: number
) => {
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  ctx.clearRect(0, 0, width, height);

  const allValues = data.datasets.flatMap(d => d.data);
  const maxValue = Math.max(...allValues, 100);
  const minValue = 0;
  const valueRange = maxValue - minValue;

  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (chartHeight / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();

    const value = maxValue - (valueRange / 4) * i;
    ctx.fillStyle = '#94A3B8';
    ctx.font = '20rpx sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toFixed(0), padding.left - 10, y + 5);
  }

  ctx.fillStyle = '#64748B';
  ctx.font = '20rpx sans-serif';
  ctx.textAlign = 'center';
  data.labels.forEach((label, i) => {
    const x = padding.left + (chartWidth / (data.labels.length - 1)) * i;
    ctx.fillText(label, x, height - padding.bottom + 20);
  });

  data.datasets.forEach((dataset) => {
    ctx.beginPath();
    ctx.strokeStyle = dataset.color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    dataset.data.forEach((value, i) => {
      const x = padding.left + (chartWidth / (dataset.data.length - 1)) * i;
      const y = padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    dataset.data.forEach((value, i) => {
      const x = padding.left + (chartWidth / (dataset.data.length - 1)) * i;
      const y = padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = dataset.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  });
};
