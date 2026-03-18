'use client';

import { useMemo } from 'react';

type LineChartData = {
  label: string;
  value: number;
  color?: string;
};

type LineChartProps = {
  data: Array<{
    label: string;
    series: LineChartData[];
    color?: string;
  }>;
  height?: number;
  formatValue?: (value: number) => string;
};

export function LineChart({ 
  data, 
  height = 250, 
  formatValue = (v) => v.toFixed(0)
}: LineChartProps) {
  const chartData = useMemo(() => {
    if (data.length === 0) return null;

    // Encontrar valores máximos e mínimos
    let maxValue = 0;
    let minValue = Infinity;
    
    data.forEach((series) => {
      series.series.forEach((point) => {
        maxValue = Math.max(maxValue, point.value);
        minValue = Math.min(minValue, point.value);
      });
    });

    if (maxValue === 0) return null;

    const range = maxValue - minValue || 1;
    const padding = range * 0.1; // 10% de padding
    const adjustedMax = maxValue + padding;
    const adjustedMin = Math.max(0, minValue - padding);
    const adjustedRange = adjustedMax - adjustedMin;

    return {
      maxValue: adjustedMax,
      minValue: adjustedMin,
      range: adjustedRange,
    };
  }, [data]);

  if (!data.length || !chartData) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Sem dados para exibir
      </div>
    );
  }

  const { maxValue, minValue, range } = chartData;
  const pointCount = data[0]?.series.length || 0;
  const pointSpacing = 100 / Math.max(1, pointCount - 1);

  // Cores padrão para séries
  const defaultColors = [
    '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
  ];

  return (
    <div className="w-full">
      <div className="relative mb-2" style={{ height: `${height}px` }}>
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 25, 50, 75, 100].map((percent) => (
            <div
              key={percent}
              className="border-t border-gray-200 dark:border-gray-700"
              style={{ marginTop: percent === 0 ? 0 : -1 }}
            />
          ))}
        </div>

        {/* Y-axis labels */}
        <div className="absolute -left-12 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500">
          <span>{formatValue(maxValue)}</span>
          <span>{formatValue((maxValue + minValue) / 2)}</span>
          <span>{formatValue(minValue)}</span>
        </div>
        
        {/* Lines */}
        <svg className="absolute inset-0 w-full h-full" style={{ paddingLeft: '12px' }}>
          {data.map((series, seriesIndex) => {
            const color = series.color || defaultColors[seriesIndex % defaultColors.length];
            const points = series.series.map((point, pointIndex) => {
              const x = pointIndex * pointSpacing;
              const y = height - ((point.value - minValue) / range) * height;
              return { x, y, value: point.value, label: point.label };
            });

            // Criar path para a linha
            const pathData = points.map((point, index) => {
              return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
            }).join(' ');

            return (
              <g key={seriesIndex}>
                {/* Linha */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-300"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                />
                {/* Pontos */}
                {points.map((point, pointIndex) => (
                  <g key={pointIndex}>
                    {/* Círculo externo (sombra) */}
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="6"
                      fill={color}
                      opacity="0.3"
                    />
                    {/* Círculo interno */}
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      fill={color}
                      stroke="white"
                      strokeWidth="2"
                      className="cursor-pointer hover:r-6 transition-all"
                    />
                    {/* Tooltip on hover */}
                    <title>
                      {point.label}: {formatValue(point.value)}
                    </title>
                  </g>
                ))}
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* Labels */}
      <div className="flex justify-around px-2 mt-4" style={{ paddingLeft: '12px' }}>
        {data[0]?.series.map((point, index) => (
          <div
            key={index}
            className="text-center text-xs text-gray-600 dark:text-gray-400 font-medium truncate px-1"
            style={{ width: `${pointSpacing}%` }}
          >
            {point.label}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 justify-center">
        {data.map((series, index) => {
          const color = series.color || defaultColors[index % defaultColors.length];
          return (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-4 h-1 rounded"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                {series.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
