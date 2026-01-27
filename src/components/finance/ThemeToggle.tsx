'use client';

import { useFinanceStore } from '@/lib/FinanceProvider';
import { useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

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
      className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center justify-center border border-gray-700"
      title={theme === 'dark' ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
    >
      {theme === 'dark' ? (
        <Sun 
          size={20}
          strokeWidth={2}
          className="text-gray-400 hover:text-gray-200 transition-colors"
        />
      ) : (
        <Moon 
          size={20}
          strokeWidth={2}
          className="text-gray-400 hover:text-gray-200 transition-colors"
        />
      )}
    </button>
  );
}
