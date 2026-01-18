'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type TabType = 'gerais' | 'ganhos' | 'fixas' | 'variaveis' | 'dividas' | 'economias';

const tabs: { id: TabType; label: string; path: string }[] = [
  { id: 'gerais', label: 'Gerais', path: '/app/gerais' },
  { id: 'ganhos', label: 'Ganhos', path: '/app/ganhos' },
  { id: 'fixas', label: 'Fixas', path: '/app/fixas' },
  { id: 'variaveis', label: 'Variáveis', path: '/app/variaveis' },
  { id: 'dividas', label: 'Dívidas', path: '/app/dividas' },
  { id: 'economias', label: 'Economias', path: '/app/economias' },
];

export function TabNavigation() {
  const pathname = usePathname();

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {tabs.map((tab) => {
        const isActive = pathname === tab.path || (pathname === '/app' && tab.id === 'gerais');
        return (
          <Link
            key={tab.id}
            href={tab.path}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
              isActive
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 border border-transparent hover:border-gray-300'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
