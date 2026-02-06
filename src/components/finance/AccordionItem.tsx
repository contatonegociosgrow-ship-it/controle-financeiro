'use client';

import { useState, ReactNode } from 'react';
import { LucideIcon, ChevronDown } from 'lucide-react';

type AccordionItemProps = {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  defaultOpen?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
};

export function AccordionItem({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
  gradientFrom = 'from-blue-600',
  gradientTo = 'to-blue-700',
}: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
          isOpen ? 'bg-gray-50 dark:bg-gray-700/50' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${gradientFrom} ${gradientTo} flex items-center justify-center text-white shadow-sm`}>
            <Icon size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <ChevronDown
          size={20}
          className={`text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}
