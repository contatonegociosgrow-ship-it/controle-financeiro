'use client';

import { useState } from 'react';
import { WalletCard } from './WalletCard';

type PageHeaderProps = {
  title: string;
  icon: string;
  showFilter?: boolean;
  hideSearch?: boolean;
  onFilterChange?: (filter: string) => void;
};

export function PageHeader({
  title,
  icon,
  showFilter = true,
  hideSearch = false,
  onFilterChange,
}: PageHeaderProps) {
  const [filter, setFilter] = useState('');

  const handleFilterChange = (value: string) => {
    setFilter(value);
    onFilterChange?.(value);
  };

  return (
    <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-200 dark:border-gray-700">
      {/* Desktop Layout */}
      <div className="hidden sm:flex flex-row items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <span className="text-2xl">{icon}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          {showFilter && !hideSearch && (
            <input
              type="text"
              placeholder="Filtrar por..."
              value={filter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 text-sm w-48 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm hover:border-gray-400 dark:hover:border-gray-500"
            />
          )}
          <WalletCard />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex sm:hidden flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <span className="text-xl">{icon}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{title}</h1>
        </div>
        <WalletCard />
        {showFilter && !hideSearch && (
          <input
            type="text"
            placeholder="Filtrar por..."
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm hover:border-gray-400 dark:hover:border-gray-500"
          />
        )}
      </div>
    </div>
  );
}
