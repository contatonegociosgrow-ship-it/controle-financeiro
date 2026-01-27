'use client';

import { LucideIcon } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';

type PremiumCardProps = {
  title: string;
  value: number;
  percentage?: number;
  icon: LucideIcon;
  gradientFrom: string;
  gradientTo: string;
  onClick?: () => void;
  formatCurrency: (value: number) => string;
  showProgress?: boolean;
  progressValue?: number;
};

export function PremiumCard({
  title,
  value,
  percentage,
  icon: Icon,
  gradientFrom,
  gradientTo,
  onClick,
  formatCurrency,
  showProgress = false,
  progressValue = 0,
}: PremiumCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} rounded-2xl p-4 sm:p-5 text-white relative overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer h-[120px] sm:h-[140px] ${
        onClick ? 'hover:scale-[1.02]' : ''
      }`}
    >
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />
      <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/10 rounded-full -ml-6 -mb-6" />
      <div className="absolute top-1/2 right-4 w-8 h-8 bg-white/5 rounded-full" />
      
      <div className="relative z-10 h-full flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <Icon size={20} strokeWidth={2} className="text-white opacity-90" />
          <h3 className="text-xs sm:text-sm font-semibold opacity-90">{title}</h3>
        </div>

        {/* Valor principal */}
        <div className="mb-2">
          <p className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {formatCurrency(value)}
          </p>
        </div>

        {/* Informações secundárias */}
        <div className="space-y-1.5">
          {percentage !== undefined && (
            <div className="flex items-center justify-between text-[10px] sm:text-xs">
              <span className="opacity-80 font-medium">
                <AnimatedCounter value={percentage} decimals={1} suffix="% do salário" />
              </span>
            </div>
          )}
          {showProgress && (
            <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-white/40 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progressValue, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
