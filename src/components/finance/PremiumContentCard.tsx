'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

type PremiumContentCardProps = {
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
  gradientFrom?: string;
  gradientTo?: string;
  className?: string;
};

export function PremiumContentCard({
  title,
  icon: Icon,
  children,
  gradientFrom = 'from-blue-600',
  gradientTo = 'to-blue-700',
  className = '',
}: PremiumContentCardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-gray-200/60 dark:border-gray-700/60 ${className}`}>
      {/* Header com gradiente */}
      <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} px-5 sm:px-6 py-4 text-white relative overflow-hidden`}>
        {/* Decorative circles no header */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />
        <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/10 rounded-full -ml-6 -mb-6" />
        
        <div className="relative z-10 flex items-center gap-2">
          {Icon && <Icon size={20} strokeWidth={2} className="text-white opacity-90" />}
          <h3 className="text-base sm:text-lg font-semibold tracking-tight opacity-90">
            {title}
          </h3>
        </div>
      </div>
      
      {/* Content com fundo claro */}
      <div className="p-5 sm:p-6">
        {children}
      </div>
    </div>
  );
}
