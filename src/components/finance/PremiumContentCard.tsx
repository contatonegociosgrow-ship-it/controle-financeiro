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
    <div className={`glassmorphism rounded-3xl overflow-hidden ${className}`}>
      {/* Header com gradiente */}
      <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} px-6 sm:px-7 py-5 text-white relative overflow-hidden`}>
        {/* Decorative circles no header */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />
        <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/10 rounded-full -ml-6 -mb-6" />
        
        <div className="relative z-10 flex items-center gap-3">
          {Icon && (
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
              <Icon size={24} strokeWidth={2} className="text-white" />
            </div>
          )}
          <h3 className="text-base sm:text-lg font-semibold tracking-tight text-white">
            {title}
          </h3>
        </div>
      </div>
      
      {/* Content com fundo branco sólido */}
      <div className="p-5 sm:p-6 bg-white rounded-b-3xl">
        {children}
      </div>
    </div>
  );
}
