'use client';

import { useMemo } from 'react';
import { getCategoryColor } from '@/lib/categoryColors';

type PieChartData = {
  label: string;
  value: number;
  color: string;
  percentage: number;
};

type PieChartProps = {
  data: PieChartData[];
  size?: number;
  strokeWidth?: number;
};

const CATEGORY_EMOJIS: Record<string, string> = {
  'Ganhos': '💰',
  'Compras': '🛍️',
  'Educação': '📚',
  'Saúde': '🏥',
  'Carro': '🚗',
  'Restaurante': '🍽️',
  'Casa': '🏠',
  'Lazer': '🎬',
  'Presente': '🎁',
  'Farmácia': '💊',
  'Seguro': '🛡️',
  'Mercado': '🛒',
  'Assinatura': '📺',
};

export function PieChart({ data, size = 200, strokeWidth = 20 }: PieChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Filtrar apenas dados com valor > 0
  const validData = data.filter((item) => item.value > 0);

  if (validData.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-full bg-gray-100"
        style={{ width: size, height: size }}
      >
        <span className="text-sm text-gray-400">Sem dados</span>
      </div>
    );
  }

  let currentOffset = 0;

  // Helper function to create gradient colors
  const getGradientColor = (baseColor: string) => {
    // Convert hex to RGB
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Create darker version for gradient
    const darkerR = Math.max(0, r - 30);
    const darkerG = Math.max(0, g - 30);
    const darkerB = Math.max(0, b - 30);
    
    return {
      light: baseColor,
      dark: `rgb(${darkerR}, ${darkerG}, ${darkerB})`,
    };
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          {validData.map((item, index) => {
            const gradientColors = getGradientColor(item.color);
            return (
              <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={gradientColors.light} />
                <stop offset="100%" stopColor={gradientColors.dark} />
              </linearGradient>
            );
          })}
        </defs>
        {validData.map((item, index) => {
          const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
          const strokeDashoffset = -currentOffset;
          currentOffset += (item.percentage / 100) * circumference;

          return (
            <circle
              key={index}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={`url(#gradient-${index})`}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          );
        })}
      </svg>
      
      {/* Centro com total */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      >
        <div className="text-2xl font-bold text-gray-900">
          {validData.length}
        </div>
        <div className="text-xs text-gray-500 font-medium">
          {validData.length === 1 ? 'Categoria' : 'Categorias'}
        </div>
      </div>
    </div>
  );
}

type CategoryPieChartProps = {
  transactions: Array<{
    categoryId: string;
    value: number;
    type: string;
  }>;
  categories: Array<{ id: string; name: string }>;
  type?: 'expense' | 'income' | 'all';
};

export function CategoryPieChart({
  transactions,
  categories,
  type = 'expense',
}: CategoryPieChartProps) {
  const chartData = useMemo(() => {
    // Filtrar transações por tipo
    let filtered = transactions;
    if (type === 'expense') {
      filtered = transactions.filter((t) => t.type.includes('expense') || t.type === 'debt');
    } else if (type === 'income') {
      filtered = transactions.filter((t) => t.type === 'income');
    }

    // Agrupar por categoria
    const categoryMap = new Map<string, number>();
    filtered.forEach((transaction) => {
      const current = categoryMap.get(transaction.categoryId) || 0;
      categoryMap.set(transaction.categoryId, current + transaction.value);
    });

    // Calcular totais e porcentagens
    const total = Array.from(categoryMap.values()).reduce((sum, val) => sum + val, 0);
    
    if (total === 0) return [];

    const data: PieChartData[] = Array.from(categoryMap.entries())
      .map(([categoryId, value]) => {
        const category = categories.find((c) => c.id === categoryId);
        const categoryName = category?.name || 'Outros';
        const percentage = (value / total) * 100;
        const color = category ? getCategoryColor(category) : '#6b7280';

        return {
          label: categoryName,
          value,
          color,
          percentage,
        };
      })
      .filter((item) => item.percentage >= 1) // Filtrar valores muito pequenos
      .sort((a, b) => b.value - a.value);

    return data;
  }, [transactions, categories, type]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <PieChart data={chartData} size={200} strokeWidth={24} />
      </div>
      
      {/* Legenda */}
      <div className="space-y-2">
        {chartData.slice(0, 6).map((item, index) => {
          const emoji = CATEGORY_EMOJIS[item.label] || '📋';
          return (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: item.color }}
                >
                  <span className="text-base">{emoji}</span>
                </div>
                <span className="text-gray-700 font-medium truncate">{item.label}</span>
              </div>
              <span className="text-gray-600 font-semibold ml-2">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
          );
        })}
        {chartData.length > 6 && (
          <div className="text-xs text-gray-500 text-center pt-1">
            +{chartData.length - 6} mais
          </div>
        )}
      </div>
    </div>
  );
}
