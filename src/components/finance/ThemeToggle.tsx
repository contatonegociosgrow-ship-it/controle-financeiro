'use client';

import { useFinanceStore } from '@/lib/FinanceProvider';
import { useEffect } from 'react';

export function ThemeToggle() {
  const { state, toggleTheme } = useFinanceStore();
  const theme = state.settings.theme;

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <button
      onClick={toggleTheme}
      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
      title={theme === 'dark' ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
    >
      {theme === 'dark' ? (
        <>
          <span>☀️</span>
          <span className="hidden sm:inline">Claro</span>
        </>
      ) : (
        <>
          <span>🌙</span>
          <span className="hidden sm:inline">Escuro</span>
        </>
      )}
    </button>
  );
}
