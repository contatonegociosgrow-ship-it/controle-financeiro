'use client';

import { LucideIcon } from 'lucide-react';
import { WalletCard } from './WalletCard';

type PageHeaderProps = {
  title: string;
  icon: LucideIcon;
  showFilter?: boolean;
  hideSearch?: boolean;
  onFilterChange?: (filter: string) => void;
};

export function PageHeader({
  title,
  icon: Icon,
  showFilter = true,
  hideSearch = false,
  onFilterChange,
}: PageHeaderProps) {

  return (
    <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-200 dark:border-gray-700">
      {/* Desktop Layout */}
      <div className="hidden sm:flex flex-row items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <Icon size={24} strokeWidth={2} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <WalletCard />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex sm:hidden flex-col gap-3 pt-12">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <Icon size={20} strokeWidth={2} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{title}</h1>
        </div>
        <WalletCard />
      </div>
    </div>
  );
}
