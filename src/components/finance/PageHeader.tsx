'use client';

import { useState } from 'react';
import { TabNavigation } from './TabNavigation';

type PageHeaderProps = {
  title: string;
  icon: string;
  showFilter?: boolean;
  onFilterChange?: (filter: string) => void;
  showAddButton?: boolean;
  onAddClick?: () => void;
};

export function PageHeader({
  title,
  icon,
  showFilter = true,
  onFilterChange,
  showAddButton = true,
  onAddClick,
}: PageHeaderProps) {
  const [filter, setFilter] = useState('');

  const handleFilterChange = (value: string) => {
    setFilter(value);
    onFilterChange?.(value);
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 justify-between">
        <TabNavigation />
        {showAddButton && (
          <button
            onClick={onAddClick}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-semibold shadow-sm hover:shadow-md transition-all whitespace-nowrap flex-shrink-0"
          >
            + Adicionar
          </button>
        )}
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <span className="text-2xl">{icon}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {showFilter && (
            <input
              type="text"
              placeholder="Filtrar por..."
              value={filter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 text-sm w-full sm:w-48 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm hover:border-gray-400"
            />
          )}
        </div>
      </div>
    </div>
  );
}
