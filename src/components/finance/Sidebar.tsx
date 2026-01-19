'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';

type TabType = 'gerais' | 'ganhos' | 'fixas' | 'variaveis' | 'dividas' | 'economias' | 'cartoes' | 'mensal' | 'manual' | 'perfil';

const tabs: { id: TabType; label: string; path: string; icon: string }[] = [
  { id: 'gerais', label: 'Gerais', path: '/app/gerais', icon: '📊' },
  { id: 'ganhos', label: 'Ganhos', path: '/app/ganhos', icon: '💰' },
  { id: 'fixas', label: 'Fixas', path: '/app/fixas', icon: '📅' },
  { id: 'variaveis', label: 'Variáveis', path: '/app/variaveis', icon: '🛒' },
  { id: 'dividas', label: 'Dívidas', path: '/app/dividas', icon: '🔗' },
  { id: 'economias', label: 'Economias', path: '/app/economias', icon: '🎯' },
  { id: 'cartoes', label: 'Cartões', path: '/app/cartoes', icon: '💳' },
  { id: 'mensal', label: 'Mensal', path: '/app/mensal', icon: '📈' },
  { id: 'manual', label: 'Manual', path: '/app/manual', icon: '📋' },
  { id: 'perfil', label: 'Perfil', path: '/app/perfil', icon: '👤' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-20 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-sm z-30 flex flex-col items-center py-4 overflow-y-auto">
      <div className="flex flex-col gap-1 w-full flex-1">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path || 
            (pathname === '/app' && tab.id === 'gerais') ||
            (pathname?.startsWith('/app/cartoes') && tab.id === 'cartoes');
          return (
            <Link
              key={tab.id}
              href={tab.path}
              className={`w-full flex flex-col items-center justify-center py-3 px-2 transition-all relative group ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
              title={tab.label}
            >
              {/* Indicador ativo */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-blue-400 rounded-r-full" />
              )}
              
              {/* Ícone */}
              <span className="text-xl mb-1">{tab.icon}</span>
              
              {/* Label */}
              <span className={`text-[10px] font-semibold text-center leading-tight ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                {tab.label}
              </span>
              
              {/* Tooltip no hover (desktop) */}
              <div className="hidden md:block absolute left-full ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                {tab.label}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700" />
              </div>
            </Link>
          );
        })}
      </div>
      
      {/* Toggle de Tema */}
      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800 w-full flex justify-center">
        <ThemeToggle />
      </div>
    </aside>
  );
}
